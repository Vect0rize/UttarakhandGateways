import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3099';
const REPORT_OUT = process.env.API_REPORT_OUT || 'tests/results_api_baseline.json';

const results = [];
let passed = 0;
let failed = 0;

function record(id, category, severity, name, ok, detail) {
  const entry = { id, category, severity, name, status: ok ? 'PASS' : 'FAIL', detail };
  results.push(entry);
  if (ok) passed++;
  else failed++;
  const mark = ok ? '[PASS]' : `[FAIL:${severity}]`;
  console.log(`${mark} ${id} - ${name} :: ${detail}`);
}

async function req(method, urlPath, { body, headers = {}, cookie, rawBody } = {}) {
  const h = { ...headers };
  if (cookie) h['Cookie'] = cookie;
  let payload;
  if (rawBody !== undefined) {
    payload = rawBody;
  } else if (body !== undefined) {
    h['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${BASE_URL}${urlPath}`, {
    method,
    headers: h,
    body: payload,
    redirect: 'manual',
  });
  const setCookieHeader = res.headers.getSetCookie ? res.headers.getSetCookie() : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')] : []);
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { status: res.status, headers: res.headers, setCookies: setCookieHeader, text, json };
}

function extractSessionCookie(setCookies) {
  for (const sc of setCookies || []) {
    const m = sc.match(/ukg_session=([^;]+)/);
    if (m) return `ukg_session=${m[1]}`;
  }
  return '';
}

async function run() {
  console.log(`Running API/Security/DB Destruction Suite against ${BASE_URL}\n`);

  // 1. Health & Basic Connectivity
  const health = await req('GET', '/api/health');
  record(
    'API-01', 'Infrastructure', 'CRITICAL', 'Health Endpoint Returns Connected DB',
    health.status === 200 && health.json?.status === 'ok' && health.json?.database?.status === 'connected',
    `HTTP ${health.status}, db=${health.json?.database?.type}, count=${health.json?.propertiesCount}`
  );

  // 2. SEO & HTTP Status Checks
  const seoRoutes = ['/', '/buy', '/rent', '/list', '/list/buy', '/list/rent', '/guides', '/properties-in-dehradun', '/flats-for-sale-in-dehradun', '/robots.txt', '/sitemap.xml'];
  for (const r of seoRoutes) {
    const res = await req('GET', r);
    const ok = res.status === 200 && res.text.length > 50;
    record(`SEO-${r}`, 'SEO/Routing', 'HIGH', `Route ${r} returns 200`, ok, `HTTP ${res.status}, len=${res.text.length}`);
  }

  const notFound = await req('GET', '/this-route-definitely-does-not-exist-xyz');
  record(
    'SEO-404', 'SEO/Routing', 'HIGH', 'Unknown route returns true HTTP 404 with noindex',
    notFound.status === 404 && /noindex/i.test(notFound.text),
    `HTTP ${notFound.status}, hasNoindex=${/noindex/i.test(notFound.text)}`
  );

  const privateDash = await req('GET', '/dashboard');
  record(
    'SEO-NOINDEX', 'SEO/Routing', 'MEDIUM', 'Private route /dashboard includes noindex meta',
    privateDash.status === 200 && /noindex/i.test(privateDash.text),
    `HTTP ${privateDash.status}, hasNoindex=${/noindex/i.test(privateDash.text)}`
  );

  // 3. Auth Registration, Validation, & Privilege Escalation
  const badReg = await req('POST', '/api/auth/register', { body: { name: 'A', email: 'notanemail', password: '123' } });
  record(
    'AUTH-01', 'Auth', 'HIGH', 'Register rejects short name, bad email, short password',
    badReg.status === 400,
    `HTTP ${badReg.status}: ${badReg.json?.error}`
  );

  const emailA = `qa_seller_a_${Date.now()}@example.com`;
  const regA = await req('POST', '/api/auth/register', { body: { name: 'QA Seller Alpha', email: emailA, password: 'Password123!' } });
  const cookieA = extractSessionCookie(regA.setCookies);
  const tokenA = regA.json?.token;
  record(
    'AUTH-02', 'Auth', 'CRITICAL', 'Register creates normal user A with session cookie & token',
    regA.status === 201 && Boolean(cookieA) && Boolean(tokenA) && regA.json?.user?.role === 'user' && regA.json?.user?.isOwner === false,
    `HTTP ${regA.status}, role=${regA.json?.user?.role}, isOwner=${regA.json?.user?.isOwner}`
  );

  // Duplicate email
  const dupA = await req('POST', '/api/auth/register', { body: { name: 'Dup Alpha', email: emailA, password: 'Password123!' } });
  record(
    'AUTH-03', 'Auth', 'HIGH', 'Duplicate email registration returns 409',
    dupA.status === 409,
    `HTTP ${dupA.status}: ${dupA.json?.error}`
  );

  // CRITICAL TEST: Privilege escalation via username === "Amit Tyagi"
  const escEmail = `qa_attacker_${Date.now()}@example.com`;
  const escReg = await req('POST', '/api/auth/register', { body: { name: 'Amit Tyagi', email: escEmail, password: 'Password123!' } });
  const escToken = escReg.json?.token;
  const escCookie = extractSessionCookie(escReg.setCookies);
  const isEscOwner = Boolean(escReg.json?.user?.isOwner || escReg.json?.user?.role === 'owner');
  record(
    'SEC-PRIV-01', 'Security', 'CRITICAL', 'Registering with username "Amit Tyagi" MUST NOT grant owner privileges',
    !isEscOwner,
    `HTTP ${escReg.status}, returned isOwner=${escReg.json?.user?.isOwner}, role=${escReg.json?.user?.role}`
  );

  // Check if escalated attacker can access /api/users (PII leak!)
  const usersLeak = await req('GET', '/api/users', { headers: { Authorization: `Bearer ${escToken}` }, cookie: escCookie });
  record(
    'SEC-PRIV-02', 'Security', 'CRITICAL', 'Fake "Amit Tyagi" account MUST NOT access /api/users admin directory',
    usersLeak.status === 403,
    `HTTP ${usersLeak.status}, leakedUsers=${Array.isArray(usersLeak.json?.users) ? usersLeak.json.users.length : 0}`
  );

  // Register normal User B
  const emailB = `qa_buyer_b_${Date.now()}@example.com`;
  const regB = await req('POST', '/api/auth/register', { body: { name: 'QA Buyer Beta', email: emailB, password: 'Password123!' } });
  const cookieB = extractSessionCookie(regB.setCookies);
  const tokenB = regB.json?.token;

  // Test Legacy /api/register-user weak validation
  const legacyBad = await req('POST', '/api/register-user', { body: { username: 'X', contact: `bad-email-${Date.now()}`, password: '1' } });
  record(
    'SEC-AUTH-LEGACY', 'Security', 'HIGH', 'Legacy /api/register-user validates email format and password strength',
    legacyBad.status === 400,
    `HTTP ${legacyBad.status}: ${legacyBad.text.slice(0, 120)}`
  );

  // Test /api/auth/logout with Bearer token (not Cookie!)
  const logoutBearer = await req('POST', '/api/auth/logout', { headers: { Authorization: `Bearer ${tokenB}` } });
  const meAfterBearerLogout = await req('GET', '/api/auth/me', { headers: { Authorization: `Bearer ${tokenB}` } });
  record(
    'SEC-SESS-01', 'Security', 'HIGH', 'Logout with Bearer token invalidates server session for that token',
    logoutBearer.status === 200 && meAfterBearerLogout.status === 401,
    `logout HTTP ${logoutBearer.status}, /api/auth/me after logout HTTP ${meAfterBearerLogout.status}`
  );

  // Re-login User B for subsequent IDOR tests
  const loginB = await req('POST', '/api/auth/login', { body: { email: emailB, password: 'Password123!' } });
  const freshCookieB = extractSessionCookie(loginB.setCookies);
  const freshTokenB = loginB.json?.token;
  record(
    'AUTH-04', 'Auth', 'CRITICAL', 'User B login succeeds after register & logout',
    loginB.status === 200 && Boolean(freshTokenB),
    `HTTP ${loginB.status}`
  );

  // Test wrong password returns 401 without revealing email existence differently
  const badLogin = await req('POST', '/api/auth/login', { body: { email: emailB, password: 'WrongPassword!' } });
  record('AUTH-05', 'Auth', 'HIGH', 'Wrong password rejected with 401', badLogin.status === 401, `HTTP ${badLogin.status}`);

  // Test sync-session without auth
  const unauthSync = await req('POST', '/api/auth/sync-session', { body: { user: { id: 'fake', contact: 'amit1986.delhi@gmail.com' } } });
  record('SEC-SESS-02', 'Security', 'CRITICAL', 'Unauthenticated /api/auth/sync-session spoofing rejected with 401', unauthSync.status === 401, `HTTP ${unauthSync.status}`);

  // Test normal User B cannot access /api/users or /api/users/sync or clear-all
  const normalUsersGet = await req('GET', '/api/users', { headers: { Authorization: `Bearer ${freshTokenB}` }, cookie: freshCookieB });
  record('SEC-ADMIN-01', 'Security', 'CRITICAL', 'Normal User B blocked from GET /api/users', normalUsersGet.status === 403, `HTTP ${normalUsersGet.status}`);

  const normalClearAll = await req('POST', '/api/properties/clear-all', { headers: { Authorization: `Bearer ${freshTokenB}` }, cookie: freshCookieB });
  record('SEC-ADMIN-02', 'Security', 'CRITICAL', 'Normal User B blocked from POST /api/properties/clear-all', normalClearAll.status === 403, `HTTP ${normalClearAll.status}`);

  // 4. Property CRUD, IDOR, Mass Assignment, & PII Exposure
  const anonCreate = await req('POST', '/api/properties', { body: { title: 'Anon Prop', city: 'Dehradun', price: 5000000 } });
  record('SEC-PROP-01', 'Security', 'CRITICAL', 'Unauthenticated POST /api/properties rejected with 401', anonCreate.status === 401, `HTTP ${anonCreate.status}`);

  const propPayloadA = {
    id: `user-prop-qa-${Date.now()}`,
    title: 'QA Test Mountain Cottage <script>alert(1)</script>',
    description: 'Clean test property in Rajpur Road',
    city: 'Dehradun',
    location: 'Rajpur Road',
    price: 8500000,
    priceDisplay: '₹85 Lakhs',
    category: 'House',
    type: 'Buy',
    purpose: 'sell',
    sellerPhone: '9876543210',
    sellerEmail: emailA,
    ownerContact: emailA,
    views: 99999,
    featured: true,
    isSold: true,
    images: ['javascript:alert(1)', 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800'],
  };

  const createP1 = await req('POST', '/api/properties', { body: propPayloadA, cookie: cookieA, headers: { Authorization: `Bearer ${tokenA}` } });
  const p1Id = createP1.json?.property?.id;
  record(
    'CRUD-01', 'CRUD/Persistence', 'CRITICAL', 'User A creates property P1 via POST /api/properties',
    createP1.status === 200 && Boolean(p1Id),
    `HTTP ${createP1.status}, id=${p1Id}`
  );

  // Mass assignment check on creation
  const p1Created = createP1.json?.property || {};
  record(
    'SEC-MASS-01', 'Security', 'HIGH', 'POST /api/properties strips spoofed views/featured/isSold & unsafe javascript: image URLs',
    (p1Created.views || 0) === 0 && !p1Created.isSold && !(p1Created.images || []).some((u) => String(u).toLowerCase().startsWith('javascript:')),
    `views=${p1Created.views}, isSold=${p1Created.isSold}, images=${JSON.stringify(p1Created.images)}`
  );

  // Public PII leak check via unauthenticated GET /api/properties/:id
  if (p1Id) {
    const publicGet = await req('GET', `/api/properties/${encodeURIComponent(p1Id)}`);
    const leaked = publicGet.json?.property;
    record(
      'SEC-PII-01', 'Security', 'HIGH', 'Unauthenticated GET /api/properties/:id does not expose sellerEmail/ownerContact',
      publicGet.status === 200 && !leaked?.ownerContact && !leaked?.sellerEmail,
      `ownerContact=${leaked?.ownerContact}, sellerEmail=${leaked?.sellerEmail}, sellerPhone=${leaked?.sellerPhone}`
    );

    // IDOR TEST 1: User B tries PUT /api/properties/:id
    const idorPut = await req('PUT', `/api/properties/${encodeURIComponent(p1Id)}`, {
      body: { title: 'HIJACKED VIA PUT BY B' },
      cookie: freshCookieB,
      headers: { Authorization: `Bearer ${freshTokenB}` },
    });
    record('SEC-IDOR-01', 'Security', 'CRITICAL', 'User B blocked from PUT /api/properties/:id owned by User A', idorPut.status === 403, `HTTP ${idorPut.status}`);

    // IDOR TEST 2 (CRITICAL BUG CHECK): User B calls POST /api/properties with EXISTING p1Id!
    const idorPostOverwrite = await req('POST', '/api/properties', {
      body: { id: p1Id, title: 'OVERWRITTEN VIA POST BY B', city: 'Nainital', price: 100 },
      cookie: freshCookieB,
      headers: { Authorization: `Bearer ${freshTokenB}` },
    });
    const checkAfterOverwrite = await req('GET', `/api/properties/${encodeURIComponent(p1Id)}`);
    const wasOverwritten = checkAfterOverwrite.json?.property?.title === 'OVERWRITTEN VIA POST BY B';
    record(
      'SEC-IDOR-02', 'Security', 'CRITICAL', 'User B MUST NOT overwrite User A property by passing existing id to POST /api/properties',
      idorPostOverwrite.status >= 400 && !wasOverwritten,
      `POST HTTP ${idorPostOverwrite.status}, storedTitle="${checkAfterOverwrite.json?.property?.title}"`
    );

    // IDOR TEST 3: User B tries DELETE /api/properties/:id
    const idorDel = await req('DELETE', `/api/properties/${encodeURIComponent(p1Id)}`, {
      cookie: freshCookieB,
      headers: { Authorization: `Bearer ${freshTokenB}` },
    });
    record('SEC-IDOR-03', 'Security', 'CRITICAL', 'User B blocked from DELETE /api/properties/:id owned by User A', idorDel.status === 403, `HTTP ${idorDel.status}`);

    // Mass Assignment TEST on PUT by legitimate Owner A: try changing ownerId / views
    const putMassA = await req('PUT', `/api/properties/${encodeURIComponent(p1Id)}`, {
      body: { title: 'QA Updated Cottage', views: 55555, ownerId: 'hijacked-owner-id', price: 9000000 },
      cookie: cookieA,
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const afterMassPut = await req('GET', `/api/properties/${encodeURIComponent(p1Id)}`);
    const pAfterPut = afterMassPut.json?.property || {};
    record(
      'SEC-MASS-02', 'Security', 'HIGH', 'PUT /api/properties/:id prevents ownerId or metric views tampering by client',
      pAfterPut.ownerId !== 'hijacked-owner-id' && (pAfterPut.views || 0) < 55555,
      `PUT HTTP ${putMassA.status}, ownerId=${pAfterPut.ownerId}, views=${pAfterPut.views}`
    );

    // Negative / invalid price validation
    const negPrice = await req('POST', '/api/properties', {
      body: { id: `user-prop-neg-${Date.now()}`, title: 'Negative Price Property', city: 'Dehradun', price: -50000 },
      cookie: cookieA,
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    if (negPrice.status === 200 && negPrice.json?.property?.id) {
      await req('DELETE', `/api/properties/${encodeURIComponent(negPrice.json.property.id)}`, { cookie: cookieA, headers: { Authorization: `Bearer ${tokenA}` } });
    }
    record('VAL-01', 'Validation', 'MEDIUM', 'Negative property price rejected with 400', negPrice.status === 400, `HTTP ${negPrice.status}`);
  }

  // 5. Upload Security Tests
  // Upload fake executable/HTML disguised as video without authentication!
  const fakeVideoPayload = Buffer.from('<html><script>alert("xss")</script></html>', 'utf8');
  const anonUploadVid = await req('POST', '/api/upload-video', {
    headers: { 'Content-Type': 'application/octet-stream' },
    rawBody: fakeVideoPayload,
  });
  record(
    'SEC-UPL-01', 'Security', 'HIGH', 'Unauthenticated / non-video upload to /api/upload-video rejected',
    anonUploadVid.status >= 400,
    `HTTP ${anonUploadVid.status}: ${anonUploadVid.text.slice(0, 140)}`
  );

  // Clean up fake uploaded file if server accepted it!
  if (anonUploadVid.status === 200 && anonUploadVid.json?.url) {
    const rel = anonUploadVid.json.url.replace(/^\/+/, '');
    const full = path.join(process.cwd(), rel);
    if (fs.existsSync(full)) fs.unlinkSync(full);
  }

  // Authenticated upload of fake HTML disguised as MP4 video
  const authFakeVid = await req('POST', '/api/upload-video', {
    cookie: cookieA,
    headers: { 'Content-Type': 'application/octet-stream', Authorization: `Bearer ${tokenA}` },
    rawBody: fakeVideoPayload,
  });
  record(
    'SEC-UPL-01B', 'Security', 'HIGH', 'Authenticated fake HTML payload uploaded to /api/upload-video rejected by magic bytes',
    authFakeVid.status >= 400,
    `HTTP ${authFakeVid.status}: ${authFakeVid.text.slice(0, 140)}`
  );
  if (authFakeVid.status === 200 && authFakeVid.json?.url) {
    const rel = authFakeVid.json.url.replace(/^\/+/, '');
    const full = path.join(process.cwd(), rel);
    if (fs.existsSync(full)) fs.unlinkSync(full);
  }

  // Authenticated bulk-sync test by normal User B
  const bulkSyncNormal = await req('POST', '/api/properties/bulk-sync', {
    cookie: freshCookieB,
    headers: { Authorization: `Bearer ${freshTokenB}` },
    body: { properties: [{ id: `user-prop-bulksync-${Date.now()}`, title: 'Bulk Sync Bypass', city: 'Dehradun', price: 1000 }] },
  });
  record(
    'SEC-ADMIN-03', 'Security', 'CRITICAL', 'Normal User B blocked from bulk-sync importing arbitrary properties without ownership',
    bulkSyncNormal.status === 403,
    `HTTP ${bulkSyncNormal.status}: ${bulkSyncNormal.text.slice(0, 140)}`
  );

  // Test SVG upload to /api/moderate-image
  const svgBase64 = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"></svg>').toString('base64');
  const modSvg = await req('POST', '/api/moderate-image', {
    body: { image: `data:image/svg+xml;base64,${svgBase64}`, filename: 'xss.svg' },
  });
  record('SEC-UPL-02', 'Security', 'HIGH', 'SVG image rejected by /api/moderate-image', modSvg.status === 400, `HTTP ${modSvg.status}: ${modSvg.text.slice(0, 120)}`);

  // 6. AI Chatbot & Enhance Description Edge Cases + Rate Limits
  const emptyChat = await req('POST', '/api/chat', { body: { message: '' } });
  record('AI-01', 'Validation', 'LOW', 'Empty chat message rejected with 400', emptyChat.status === 400, `HTTP ${emptyChat.status}`);

  const longChat = await req('POST', '/api/chat', { body: { message: 'x'.repeat(1001) } });
  record('AI-02', 'Validation', 'MEDIUM', 'Over-1000 char chat message rejected with 400', longChat.status === 400, `HTTP ${longChat.status}`);

  const shortEnh = await req('POST', '/api/enhance-description', { body: { description: 'abc' } });
  record('AI-03', 'Validation', 'LOW', 'Too-short enhance description rejected with 400', shortEnh.status === 400, `HTTP ${shortEnh.status}`);

  // Rate limit test on enhance-description (send 15 fast calls)
  let enhLimited = false;
  for (let i = 0; i < 25; i++) {
    const r = await req('POST', '/api/enhance-description', { body: { description: 'Nice 2bhk flat in Dehradun near Rajpur' } });
    if (r.status === 429) { enhLimited = true; break; }
  }
  record('SEC-RL-01', 'Security', 'MEDIUM', '/api/enhance-description enforces rate limiting', enhLimited, `rateLimited=${enhLimited}`);

  // 7. Listing Reports, Profile Update, Concurrent Metrics, & Account Deletion Persistence
  // User A updates profile via PUT /api/auth/profile and verifies via /api/auth/me
  const profileEndpoint = await req('PUT', '/api/auth/profile', {
    body: { username: 'QA Updated Alpha' },
    cookie: cookieA,
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  const meAfterProf = await req('GET', '/api/auth/me', {
    cookie: cookieA,
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  record(
    'FEAT-PROF-01', 'Persistence/API', 'HIGH', 'User profile update persists in database (PUT /api/auth/profile -> GET /api/auth/me)',
    profileEndpoint.status === 200 && meAfterProf.json?.user?.username === 'QA Updated Alpha',
    `PUT HTTP ${profileEndpoint.status}, /me username="${meAfterProf.json?.user?.username}"`
  );

  // User B submits a listing report on p1Id via POST /api/reports
  const reportEndpoint = await req('POST', '/api/reports', {
    body: { propertyId: p1Id || 'test', reason: 'Incorrect information', details: 'QA API report test' },
    cookie: freshCookieB,
    headers: { Authorization: `Bearer ${freshTokenB}` },
  });
  record(
    'FEAT-REP-01', 'Persistence/API', 'HIGH', 'Listing report persists via POST /api/reports',
    (reportEndpoint.status === 200 || reportEndpoint.status === 201) && Boolean(reportEndpoint.json?.report?.id),
    `HTTP ${reportEndpoint.status}, reportId=${reportEndpoint.json?.report?.id}`
  );

  // RBAC: Normal User B MUST NOT read or mutate reports or delete other users
  const userBReportsGet = await req('GET', '/api/reports', {
    cookie: freshCookieB,
    headers: { Authorization: `Bearer ${freshTokenB}` },
  });
  record('SEC-ADMIN-04', 'Security', 'HIGH', 'Normal User B blocked from GET /api/reports moderation queue', userBReportsGet.status === 403, `HTTP ${userBReportsGet.status}`);

  const userBDelUser = await req('DELETE', `/api/users/${encodeURIComponent(emailA)}`, {
    cookie: freshCookieB,
    headers: { Authorization: `Bearer ${freshTokenB}` },
  });
  record('SEC-ADMIN-05', 'Security', 'CRITICAL', 'Normal User B blocked from DELETE /api/users/:id', userBDelUser.status === 403, `HTTP ${userBDelUser.status}`);

  if (p1Id) {
    await Promise.all(Array.from({ length: 10 }, () => req('POST', `/api/properties/${encodeURIComponent(p1Id)}/view`)));
    const afterViews = await req('GET', `/api/properties/${encodeURIComponent(p1Id)}`);
    const vCount = afterViews.json?.property?.views || 0;
    record(
      'DB-RACE-01', 'Database/Concurrency', 'HIGH', '10 concurrent /view increments all persist without lost updates',
      vCount >= 10,
      `Expected >=10 views after 10 concurrent POST /view calls, got ${vCount}`
    );

    // Cleanup property P1 via real owner A
    const delA = await req('DELETE', `/api/properties/${encodeURIComponent(p1Id)}`, { cookie: cookieA, headers: { Authorization: `Bearer ${tokenA}` } });
    const afterDel = await req('GET', `/api/properties/${encodeURIComponent(p1Id)}`);
    record(
      'CRUD-DEL-01', 'CRUD/Persistence', 'CRITICAL', 'Deleted property returns 404 on GET /api/properties/:id',
      delA.status === 200 && afterDel.status === 404,
      `DELETE HTTP ${delA.status}, follow-up GET HTTP ${afterDel.status}`
    );
  }

  const deleteAcctEndpoint = await req('DELETE', '/api/auth/account', {
    cookie: cookieA,
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  const meAfterDeleteAcct = await req('GET', '/api/auth/me', {
    cookie: cookieA,
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  const loginAfterDeleteAcct = await req('POST', '/api/auth/login', {
    body: { email: emailA, password: 'Password123!' },
  });
  record(
    'FEAT-DELACC-01', 'Persistence/API', 'HIGH', 'Self account deletion invalidates session and removes user from DB (DELETE /api/auth/account)',
    deleteAcctEndpoint.status === 200 && meAfterDeleteAcct.status === 401 && loginAfterDeleteAcct.status === 401,
    `DELETE HTTP ${deleteAcctEndpoint.status}, /me HTTP ${meAfterDeleteAcct.status}, login HTTP ${loginAfterDeleteAcct.status}`
  );

  // Clean up remaining test accounts if self-delete works
  await req('DELETE', '/api/auth/account', { cookie: freshCookieB, headers: { Authorization: `Bearer ${freshTokenB}` } });
  await req('DELETE', '/api/auth/account', { cookie: escCookie, headers: { Authorization: `Bearer ${escToken}` } });

  const outDir = path.dirname(REPORT_OUT);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(REPORT_OUT, JSON.stringify({ baseUrl: BASE_URL, timestamp: new Date().toISOString(), passed, failed, total: passed + failed, results }, null, 2));
  console.log(`\nSummary: ${passed} passed, ${failed} failed out of ${passed + failed} checks. Saved to ${REPORT_OUT}`);
}

run().catch((err) => {
  console.error('Fatal suite error:', err);
  process.exit(1);
});
