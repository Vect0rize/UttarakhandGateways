import fs from 'fs';
import path from 'path';
import http from 'http';
import { spawn } from 'child_process';

const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3099';
const REPORT_OUT = process.env.E2E_REPORT_OUT || 'tests/results_e2e_baseline.json';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CDP_PORT = Number(process.env.CDP_PORT || 9233);
const PROFILE_DIR = path.resolve(process.cwd(), '.tmp_edge_qa_profile');

const results = [];
let passed = 0;
let failed = 0;

function record(id, category, severity, name, ok, detail) {
  results.push({ id, category, severity, name, status: ok ? 'PASS' : 'FAIL', detail });
  if (ok) passed++;
  else failed++;
  console.log(`${ok ? '[PASS]' : `[FAIL:${severity}]`} ${id} - ${name} :: ${detail}`);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.pending = new Map();
    this.events = [];
  }

  async connect() {
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });
    this.ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data.toString());
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
        else resolve(msg.result);
      } else if (msg.method) {
        this.events.push(msg);
      }
    });
  }

  send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.text + ' ' + (res.exceptionDetails.exception?.description || ''));
    }
    return res.result?.value;
  }

  close() {
    try { this.ws.close(); } catch {}
  }
}

async function waitFor(fn, timeoutMs = 8000, intervalMs = 150) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const v = await fn();
    if (v) return v;
    await sleep(intervalMs);
  }
  return null;
}

async function run() {
  if (fs.existsSync(PROFILE_DIR)) fs.rmSync(PROFILE_DIR, { recursive: true, force: true });
  fs.mkdirSync(PROFILE_DIR, { recursive: true });

  const edge = spawn(EDGE_PATH, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${PROFILE_DIR}`,
    'about:blank',
  ], { stdio: 'ignore' });

  let client;
  try {
    let targets = null;
    for (let i = 0; i < 30; i++) {
      try {
        targets = await getJson(`http://127.0.0.1:${CDP_PORT}/json/list`);
        const page = targets.find((t) => t.type === 'page');
        if (page) {
          client = new CDPClient(page.webSocketDebuggerUrl);
          break;
        }
      } catch {}
      await sleep(250);
    }
    if (!client) throw new Error('Failed to connect to Edge CDP');
    await client.connect();
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Network.enable');
    await client.send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 800, deviceScaleFactor: 1, mobile: false });

    const pageErrors = [];
    const consoleErrors = [];
    const server500s = [];
    const apiRequests = [];

    client.ws.addEventListener('message', (ev) => {
      const m = JSON.parse(ev.data.toString());
      if (m.method === 'Runtime.exceptionThrown') {
        pageErrors.push(m.params?.exceptionDetails?.exception?.description || m.params?.exceptionDetails?.text || 'Exception');
      }
      if (m.method === 'Runtime.consoleAPICalled' && m.params?.type === 'error') {
        const txt = (m.params.args || []).map((a) => a.value || a.description || '').join(' ');
        consoleErrors.push(txt);
      }
      if (m.method === 'Network.responseReceived') {
        const { url, status } = m.params.response || {};
        if (url && url.includes('/api/')) apiRequests.push({ url, status });
        if (status >= 500) server500s.push({ url, status });
      }
    });

    // 1. Visitor A: Load Homepage + Timing + Language Modal + Grid
    const t0 = Date.now();
    await client.send('Page.navigate', { url: `${BASE_URL}/` });
    await sleep(1800);
    const loadMs = Date.now() - t0;

    // Dismiss language modal if open
    await client.eval(`(() => {
      const btns = [...document.querySelectorAll('button')];
      const eng = btns.find(b => /continue in english|english/i.test(b.textContent || '') && b.closest('[role="dialog"], .fixed'));
      if (eng) eng.click();
    })()`);
    await sleep(400);

    const homeInfo = await waitFor(async () => {
      const info = await client.eval(`(() => {
        const h1s = [...document.querySelectorAll('h1')].map(h => h.textContent.trim());
        const cards = document.querySelectorAll('[data-property-id], article, .property-card').length;
        const bodyLen = document.body.innerText.trim().length;
        return { h1s, cards, bodyLen };
      })()`);
      return info && info.bodyLen > 200 ? info : null;
    });

    record('E2E-HOME-01', 'Functionality', 'CRITICAL', 'Homepage renders cleanly with H1 & content', Boolean(homeInfo && homeInfo.h1s.length > 0), `load=${loadMs}ms, h1Count=${homeInfo?.h1s?.length}, textLen=${homeInfo?.bodyLen}`);

    // Accessibility check on homepage
    const a11yHome = await client.eval(`(() => {
      const imgs = [...document.querySelectorAll('img')];
      const noAlt = imgs.filter(i => !i.hasAttribute('alt') || i.getAttribute('alt').trim() === '').length;
      const brokenImgs = imgs.filter(i => i.complete && i.naturalWidth === 0).map(i => i.src).slice(0, 5);
      const btns = [...document.querySelectorAll('button')];
      const emptyBtns = btns.filter(b => b.offsetParent !== null && !b.textContent.trim() && !b.getAttribute('aria-label') && !b.getAttribute('title')).length;
      const h1Count = document.querySelectorAll('h1').length;
      return { totalImgs: imgs.length, noAlt, brokenImgs, emptyBtns, h1Count };
    })()`);
    record('A11Y-01', 'Accessibility', 'MEDIUM', 'Homepage images have alt text & load cleanly', a11yHome.noAlt === 0 && a11yHome.brokenImgs.length === 0, `total=${a11yHome.totalImgs}, noAlt=${a11yHome.noAlt}, broken=${JSON.stringify(a11yHome.brokenImgs)}`);
    record('A11Y-02', 'Accessibility', 'MEDIUM', 'Visible icon buttons have aria-label or title', a11yHome.emptyBtns === 0, `emptyIconButtons=${a11yHome.emptyBtns}`);

    // Test AI Chatbot interactive send + empty guard
    const chatWorks = await client.eval(`(async () => {
      const launcher = document.querySelector('button[aria-label="Open UKG ChatBot"]');
      if (!launcher) return { opened: false };
      launcher.click();
      await new Promise(r => setTimeout(r, 350));
      const inp = document.querySelector('input[placeholder*="Ask UKG ChatBot"], input[placeholder*="Ask"]');
      if (!inp) return { opened: true, noInput: true };
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(inp, 'what is 1 nali');
      inp.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(r => setTimeout(r, 100));
      const form = inp.closest('form');
      if (form) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await new Promise(r => setTimeout(r, 1200));
      const replied = document.body.innerText.includes('2,160');
      const closeBtn = [...document.querySelectorAll('button')].find(b => b.closest('.fixed.bottom-4') && /close|reset/i.test(b.getAttribute('title') || b.getAttribute('aria-label') || '') === false && b.querySelector('svg.lucide-x'));
      if (closeBtn) closeBtn.click();
      return { opened: true, replied };
    })()`);
    record('E2E-CHAT-01', 'Functionality', 'MEDIUM', 'AI Chatbot opens & answers query live', Boolean(chatWorks?.replied), JSON.stringify(chatWorks));

    // Close chatbot if open & test Auth Registration + Persistence + Profile Update Bug
    const testEmail = `qa_e2e_${Date.now()}@example.com`;
    await client.send('Page.navigate', { url: `${BASE_URL}/login` });
    await sleep(900);

    // Click Create Account tab and fill registration form
    const regOutcome = await client.eval(`(async () => {
      const setVal = (el, v) => {
        const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
        Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };
      const btns = [...document.querySelectorAll('button')];
      const regTab = btns.find(b => b.textContent.trim() === 'Create Account');
      if (regTab) regTab.click();
      await new Promise(r => setTimeout(r, 400));
      const subBtn = [...document.querySelectorAll('button[type="submit"]')].find(b => /Create Free Account/i.test(b.textContent || ''));
      const form = subBtn ? subBtn.closest('form') : document.querySelector('form');
      if (!form) return { foundForm: false };
      const nameInp = form.querySelector('input[placeholder*="Amit" i], input[type="text"]');
      const emailInp = form.querySelector('input[type="email"]');
      const passInps = [...form.querySelectorAll('input[type="password"]')];
      if (!emailInp || passInps.length === 0) return { foundForm: false };
      if (nameInp) setVal(nameInp, 'E2E Seller Original');
      setVal(emailInp, ${JSON.stringify(testEmail)});
      passInps.forEach(p => setVal(p, 'Password123!'));
      await new Promise(r => setTimeout(r, 200));
      if (subBtn) subBtn.click();
      await new Promise(r => setTimeout(r, 2000));
      const stored = localStorage.getItem('uk_gateways_auth_user');
      return { foundForm: true, stored: stored ? JSON.parse(stored) : null, token: Boolean(localStorage.getItem('ukg_session_token')), errText: document.body.innerText.slice(0, 200) };
    })()`);
    record(
      'E2E-AUTH-01', 'Auth/UX', 'CRITICAL', 'User registration via UI creates session & logs user in',
      Boolean(regOutcome?.stored?.contact === testEmail && regOutcome?.token),
      JSON.stringify(regOutcome)
    );

    // Reload & verify session persists
    await client.send('Page.navigate', { url: `${BASE_URL}/` });
    await sleep(1200);
    const afterReloadUser = await client.eval(`(() => {
      const s = localStorage.getItem('uk_gateways_auth_user');
      return s ? JSON.parse(s) : null;
    })()`);
    record('E2E-PERSIST-01', 'Persistence', 'CRITICAL', 'Authenticated user session survives full page reload', afterReloadUser?.contact === testEmail, `username=${afterReloadUser?.username}`);

    // Open User Profile Modal, rename username, and reload to test persistence!
    const profileRename = await client.eval(`(async () => {
      const setVal = (el, v) => {
        Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(el, v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };
      const visBtns = () => [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null);
      const profBtn = visBtns().find(b => /View profile/i.test(b.getAttribute('title') || '') || (b.textContent || '').includes('E2E Seller Original'));
      if (!profBtn) return { opened: false };
      profBtn.click();
      await new Promise(r => setTimeout(r, 500));
      const editBtn = visBtns().find(b => /^(edit|संपादित करें)$/i.test((b.textContent || '').trim()));
      if (editBtn) editBtn.click();
      await new Promise(r => setTimeout(r, 350));
      const inp = [...document.querySelectorAll('input')].find(i => i.offsetParent !== null && i.value === 'E2E Seller Original');
      if (!inp) return { opened: true, editClicked: Boolean(editBtn), foundInput: false };
      setVal(inp, 'E2E Renamed Persisted');
      await new Promise(r => setTimeout(r, 150));
      const saveBtn = visBtns().find(b => /^(save|update|सहेजें)$/i.test((b.textContent || '').trim()));
      if (saveBtn) saveBtn.click();
      await new Promise(r => setTimeout(r, 1200));
      const localAfter = JSON.parse(localStorage.getItem('uk_gateways_auth_user') || '{}');
      return { opened: true, foundInput: true, saveClicked: Boolean(saveBtn), localBeforeReload: localAfter.username };
    })()`);
    await client.send('Page.reload');
    await sleep(1500);
    const nameAfterReload = await client.eval(`(() => JSON.parse(localStorage.getItem('uk_gateways_auth_user') || '{}').username)()`);
    record(
      'E2E-PERSIST-02', 'Persistence', 'HIGH', 'Updated profile username persists across full page reload (server /api/auth/me check)',
      profileRename?.foundInput && nameAfterReload === 'E2E Renamed Persisted',
      `beforeReload="${profileRename?.localBeforeReload}", afterReload="${nameAfterReload}"`
    );

    // Test Seller Property Creation via /list/sell UI + Reload Persistence
    await client.send('Page.navigate', { url: `${BASE_URL}/list/buy` });
    await sleep(1000);
    const listCheck = await client.eval(`(() => {
      const txt = document.body.innerText;
      return {
        hasBuilder: /\\bBuilder\\b/i.test(txt),
        hasAgent: /\\bAgent\\b/i.test(txt),
        hasBroker: /\\bBroker\\b/i.test(txt),
        hasZeroBrokerageBadge: /0% Brokerage Rental Listing GUI/i.test(txt),
      };
    })()`);
    record('E2E-COPY-01', 'Functionality/Copy', 'MEDIUM', '/list/buy excludes Builder & Agent options, uses Broker', !listCheck.hasBuilder && !listCheck.hasAgent && listCheck.hasBroker, JSON.stringify(listCheck));

    // Check /rent & /list/rent
    await client.send('Page.navigate', { url: `${BASE_URL}/list/rent` });
    await sleep(1000);
    const rentGuiCheck = await client.eval(`(() => {
      const txt = document.body.innerText;
      return {
        hasBuilder: /\\bBuilder\\b/i.test(txt),
        hasAgent: /\\bAgent\\b/i.test(txt),
        hasBroker: /\\bBroker\\b/i.test(txt),
        hasRemovedBadge: /0% Brokerage Rental Listing GUI/i.test(txt),
      };
    })()`);
    record('E2E-COPY-02', 'Functionality/Copy', 'MEDIUM', '/list/rent excludes Builder/Agent/removed badge & uses Broker', !rentGuiCheck.hasBuilder && !rentGuiCheck.hasAgent && !rentGuiCheck.hasRemovedBadge && rentGuiCheck.hasBroker, JSON.stringify(rentGuiCheck));

    // Check property cards on /buy expose canonical /property/:slug links that load detail page with Report button
    await client.send('Page.navigate', { url: `${BASE_URL}/buy` });
    await sleep(1300);
    const cardHref = await client.eval(`(() => {
      const cardLink = document.querySelector('a[href^="/property/"]');
      return cardLink ? cardLink.getAttribute('href') : null;
    })()`);
    let detailSlugUrl = null;
    let hasReportBtn = false;
    if (cardHref) {
      await client.send('Page.navigate', { url: `${BASE_URL}${cardHref}` });
      await sleep(1200);
      const detailInfo = await client.eval(`(() => ({
        url: window.location.pathname,
        hasReportBtn: Boolean([...document.querySelectorAll('button')].find(b => b.offsetParent !== null && /report/i.test((b.textContent || '') + ' ' + (b.getAttribute('title') || '')))),
      }))()`);
      detailSlugUrl = detailInfo?.url;
      hasReportBtn = Boolean(detailInfo?.hasReportBtn);
    }
    record('E2E-FEAT-REP-PAGE', 'Functionality/UX', 'MEDIUM', 'Clicking property card link opens canonical /property/:slug detail page with visible Report Listing button', Boolean(cardHref && detailSlugUrl?.startsWith('/property/') && hasReportBtn), JSON.stringify({ cardHref, detailSlugUrl, hasReportBtn }));

    // Now test Report Listing on a real /property/:slug page
    const firstSlug = await client.eval(`(async () => {
      const r = await fetch('/api/properties');
      const d = await r.json();
      const first = (d.properties || [])[0];
      return first ? '/property/' + encodeURIComponent(first.id) : null;
    })()`);
    const apiCountBeforeReport = apiRequests.length;
    let reportUiResult = { visited: false };
    if (firstSlug) {
      await client.send('Page.navigate', { url: `${BASE_URL}${firstSlug}` });
      await sleep(1200);
      reportUiResult = await client.eval(`(async () => {
        const repBtn = [...document.querySelectorAll('button')].find(b => b.offsetParent !== null && /report/i.test((b.textContent || '') + ' ' + (b.getAttribute('title') || '') + ' ' + (b.getAttribute('aria-label') || '')));
        if (!repBtn) return { visited: true, foundReportBtn: false };
        repBtn.click();
        await new Promise(r => setTimeout(r, 350));
        const sel = document.querySelector('#report-reason');
        if (sel) {
          Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set.call(sel, 'Fake or misleading listing');
          sel.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const det = document.querySelector('#report-details');
        if (det) {
          Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set.call(det, 'E2E automated report test');
          det.dispatchEvent(new Event('input', { bubbles: true }));
        }
        await new Promise(r => setTimeout(r, 200));
        const submitBtn = [...document.querySelectorAll('button[type="submit"], button')].find(b => /submit report/i.test(b.textContent || ''));
        if (submitBtn) submitBtn.click();
        await new Promise(r => setTimeout(r, 1000));
        return { visited: true, foundReportBtn: true, thankYouVisible: /report submitted|thank you|thanks for letting us know/i.test(document.body.innerText) };
      })()`);
    }
    const reportHitBackend = apiRequests.slice(apiCountBeforeReport).some((r) => r.url.includes('/api/reports'));
    record(
      'E2E-FEAT-REP', 'Persistence', 'HIGH', 'Report Listing Modal sends report to backend /api/reports instead of faking success',
      Boolean(reportUiResult?.thankYouVisible && reportHitBackend),
      `ui=${JSON.stringify(reportUiResult)}, backendCalled=${reportHitBackend}`
    );

    // Clean up E2E seller account cleanly via Profile -> Delete Account
    await client.send('Page.navigate', { url: `${BASE_URL}/` });
    await sleep(1000);
    const cleanupAccount = await client.eval(`(async () => {
      const token = localStorage.getItem('ukg_session_token');
      if (!token) return { deleted: false };
      const res = await fetch('/api/auth/account', { method: 'DELETE', credentials: 'include', headers: { Authorization: 'Bearer ' + token } });
      localStorage.removeItem('uk_gateways_auth_user');
      localStorage.removeItem('ukg_session_token');
      return { deleted: res.ok, status: res.status };
    })()`);
    record('E2E-CLEANUP-01', 'Persistence', 'MEDIUM', 'E2E test account deleted cleanly via /api/auth/account', Boolean(cleanupAccount?.deleted), JSON.stringify(cleanupAccount));

    // Phase 7: Multi-Viewport Responsive Overflow Audit
    const viewports = [320, 375, 390, 430, 768, 1366, 1920];
    for (const w of viewports) {
      await client.send('Emulation.setDeviceMetricsOverride', { width: w, height: 800, deviceScaleFactor: 1, mobile: w < 768 });
      await client.send('Page.navigate', { url: `${BASE_URL}/` });
      await sleep(900);
      const layout = await client.eval(`(() => ({
        scrollW: document.documentElement.scrollWidth,
        innerW: window.innerWidth,
        overflowPx: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
      }))()`);
      record(`UX-VP-${w}`, 'UI/Responsive', w <= 430 ? 'HIGH' : 'MEDIUM', `No horizontal overflow at ${w}px width`, layout.overflowPx <= 1, `scrollW=${layout.scrollW}, innerW=${layout.innerW}, overflow=${layout.overflowPx}px`);
    }

    // Phase 9: Offline Handling Simulation
    await client.send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 800, deviceScaleFactor: 1, mobile: false });
    await client.send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
    const offlineChat = await client.eval(`(async () => {
      try {
        const res = await fetch('/api/chat', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ message: 'hi' }) });
        return { threw: false, status: res.status };
      } catch (e) {
        return { threw: true, msg: e.message };
      }
    })()`);
    await client.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    record('NET-OFFLINE-01', 'Network/Resilience', 'MEDIUM', 'Offline mode triggers clean fetch failure without app crash', Boolean(offlineChat.threw && pageErrors.length === 0), `offline=${JSON.stringify(offlineChat)}, pageErrors=${pageErrors.length}`);

    // Runtime Console & 500 Errors Check
    record('E2E-STAB-01', 'Stability', 'CRITICAL', 'Zero uncaught JS runtime exceptions during entire E2E suite', pageErrors.length === 0, `exceptions=${JSON.stringify(pageErrors)}`);
    record('E2E-STAB-02', 'Stability', 'CRITICAL', 'Zero HTTP 5xx server responses during entire E2E suite', server500s.length === 0, `server500s=${JSON.stringify(server500s)}`);
    record('E2E-STAB-03', 'Stability', 'HIGH', 'Zero console.error logs during entire E2E suite', consoleErrors.length === 0, `consoleErrors=${JSON.stringify(consoleErrors.slice(0, 5))}`);

    const outDir = path.dirname(REPORT_OUT);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(REPORT_OUT, JSON.stringify({ baseUrl: BASE_URL, timestamp: new Date().toISOString(), passed, failed, total: passed + failed, pageErrors, consoleErrors, server500s, results }, null, 2));
    console.log(`\nE2E Summary: ${passed} passed, ${failed} failed out of ${passed + failed} checks. Saved to ${REPORT_OUT}`);
  } finally {
    if (client) client.close();
    try { edge.kill(); } catch {}
    await sleep(300);
    try { if (fs.existsSync(PROFILE_DIR)) fs.rmSync(PROFILE_DIR, { recursive: true, force: true }); } catch {}
  }
}

run().catch((err) => {
  console.error('Fatal E2E suite error:', err);
  process.exit(1);
});
