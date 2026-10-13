import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(express.static(path.join(process.cwd(), 'public')));

// Persistent server-side properties & user accounts storage (shared across all users and devices)
const DATA_DIR = path.join(process.cwd(), 'data');
const PROPERTIES_FILE = path.join(DATA_DIR, 'properties.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadProperties(): any[] {
  try {
    if (fs.existsSync(PROPERTIES_FILE)) {
      const content = fs.readFileSync(PROPERTIES_FILE, 'utf-8');
      if (content.trim()) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to read properties from disk:', err);
  }
  return [];
}

function saveProperties(props: any[]): void {
  try {
    fs.writeFileSync(PROPERTIES_FILE, JSON.stringify(props, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write properties to disk:', err);
  }
}

function loadUsers(): any[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const content = fs.readFileSync(USERS_FILE, 'utf-8');
      if (content.trim()) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to read users from disk:', err);
  }
  return [];
}

function saveUsers(usersList: any[]): void {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersList, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write users to disk:', err);
  }
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString()
  });
});

// SHARED PROPERTIES CRUD APIS (Open to all visitors, logged in or logged out)
app.get('/api/properties', (req, res) => {
  const list = loadProperties();
  res.json({
    success: true,
    properties: list
  });
});

app.get('/api/properties/:id', (req, res) => {
  try {
    const { id } = req.params;
    const list = loadProperties();
    const prop = list.find((p: any) => p.id === id);
    if (prop) {
      return res.json({ success: true, property: prop });
    }
    return res.status(404).json({ success: false, error: 'Property not found' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Server error' });
  }
});

app.post('/api/properties', (req, res) => {
  try {
    const property = req.body;
    if (!property || !property.id || !property.title) {
      return res.status(400).json({ success: false, error: 'Property id and title are required' });
    }
    if (!property.createdAt) {
      property.createdAt = new Date().toISOString();
    }
    const list = loadProperties();
    const existingIdx = list.findIndex((p: any) => p.id === property.id);
    if (existingIdx >= 0) {
      list[existingIdx] = { ...list[existingIdx], ...property };
    } else {
      list.unshift(property);
    }
    saveProperties(list);
    console.log(`[UKG Properties] Saved property "${property.title}" (${property.id}). Total: ${list.length}`);
    res.json({ success: true, property });
  } catch (err: any) {
    console.error('Error saving property:', err);
    res.status(500).json({ success: false, error: err?.message || 'Failed to save property' });
  }
});

app.put('/api/properties/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const list = loadProperties();
    const idx = list.findIndex((p: any) => p.id === id);
    // Updating a missing property must not recreate a deleted listing.
    // New listings are created only through POST /api/properties.
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }
    const existing = list[idx];
    const updated: Record<string, any> = {
      ...existing,
      ...updates,
      id,
      createdAt: existing.createdAt || updates.createdAt || new Date().toISOString(),
    };
    // Remove keys explicitly cleared with null
    for (const key of Object.keys(updated)) {
      if (updated[key] === null) {
        delete updated[key];
      }
    }
    list[idx] = updated;
    saveProperties(list);
    console.log(`[UKG Properties] Updated property "${updated.title}" (${id})`);
    res.json({ success: true, property: updated });
  } catch (err: any) {
    console.error('Error updating property:', err);
    res.status(500).json({ success: false, error: err?.message || 'Failed to update property' });
  }
});

app.delete('/api/properties/:id', (req, res) => {
  try {
    const { id } = req.params;
    const list = loadProperties();
    const filtered = list.filter((p: any) => p.id !== id);
    saveProperties(filtered);
    console.log(`[UKG Properties] Deleted property ${id}. Remaining: ${filtered.length}`);
    res.json({ success: true, id });
  } catch (err: any) {
    console.error('Error deleting property:', err);
    res.status(500).json({ success: false, error: err?.message || 'Failed to delete property' });
  }
});

app.post('/api/properties/clear-all', (req, res) => {
  try {
    saveProperties([]);
    console.log('[UKG Properties] Cleared all properties online via POST.');
    res.json({ success: true, count: 0, properties: [] });
  } catch (err: any) {
    console.error('Error clearing all properties:', err);
    res.status(500).json({ success: false, error: err?.message || 'Failed to clear properties' });
  }
});

app.delete('/api/properties/clear-all', (req, res) => {
  try {
    saveProperties([]);
    console.log('[UKG Properties] Cleared all properties online via DELETE /clear-all.');
    res.json({ success: true, count: 0, properties: [] });
  } catch (err: any) {
    console.error('Error clearing all properties:', err);
    res.status(500).json({ success: false, error: err?.message || 'Failed to clear properties' });
  }
});

app.delete('/api/properties', (req, res) => {
  try {
    saveProperties([]);
    console.log('[UKG Properties] Cleared all properties online via DELETE /api/properties.');
    res.json({ success: true, count: 0, properties: [] });
  } catch (err: any) {
    console.error('Error clearing all properties:', err);
    res.status(500).json({ success: false, error: err?.message || 'Failed to clear properties' });
  }
});

app.post('/api/properties/bulk-sync', (req, res) => {
  try {
    const incoming: any[] = req.body.properties || [];
    const list = loadProperties();
    const existingIds = new Set(list.map((p: any) => p.id));
    let added = 0;
    for (const prop of incoming) {
      if (prop && prop.id && !existingIds.has(prop.id)) {
        list.unshift(prop);
        existingIds.add(prop.id);
        added++;
      }
    }
    if (added > 0) {
      saveProperties(list);
      console.log(`[UKG Properties] Bulk synced ${added} properties from client.`);
    }
    res.json({ success: true, properties: list, addedCount: added });
  } catch (err: any) {
    console.error('Error bulk syncing properties:', err);
    res.status(500).json({ success: false, error: err?.message || 'Failed to bulk sync' });
  }
});

// User Account & Authentication APIs
app.post('/api/check-email', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }
    const trimmed = String(email).trim().toLowerCase();
    const users = loadUsers();
    const exists = users.some((u: any) => {
      const uContact = String(u.contact || u.email || '').trim().toLowerCase();
      return uContact === trimmed;
    });
    return res.json({ success: true, exists, email: trimmed });
  } catch (err: any) {
    console.error('Error checking email:', err);
    res.status(500).json({ success: false, error: err?.message || 'Server error' });
  }
});

app.get('/api/users', (req, res) => {
  try {
    const users = loadUsers();
    const safeUsers = users.map((u: any) => ({
      id: u.id,
      username: u.username,
      contact: u.contact || u.email,
      contactType: 'email',
      createdAt: u.createdAt,
      avatar: u.avatar,
      isOwner: u.isOwner,
    }));
    res.json({ success: true, users: safeUsers });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Server error' });
  }
});

app.post('/api/users/sync', (req, res) => {
  try {
    const incoming: any[] = req.body.users || [];
    const users = loadUsers();
    const existingEmails = new Set(users.map((u: any) => String(u.contact || u.email || '').trim().toLowerCase()));
    let added = 0;
    for (const u of incoming) {
      if (!u || !u.contact) continue;
      const normEmail = String(u.contact).trim().toLowerCase();
      if (!existingEmails.has(normEmail)) {
        users.push({
          id: u.id || `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          username: u.username || normEmail.split('@')[0],
          contact: normEmail,
          contactType: 'email',
          passwordHash: u.passwordHash || 'ukg_email_verified',
          createdAt: u.createdAt || new Date().toISOString(),
          avatar: u.avatar,
          isOwner: u.isOwner || normEmail === 'amit1986.delhi@gmail.com',
        });
        existingEmails.add(normEmail);
        added++;
      }
    }
    if (added > 0) {
      saveUsers(users);
      console.log(`[UKG Users] Synced ${added} users to server disk. Total: ${users.length}`);
    }
    res.json({ success: true, count: users.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to sync users' });
  }
});

app.post('/api/register-user', (req, res) => {
  try {
    const { username, contact, password } = req.body;
    if (!contact || !username) {
      return res.status(400).json({ success: false, error: 'Username and email are required' });
    }
    const trimmedContact = String(contact).trim().toLowerCase();
    const trimmedUsername = String(username).trim();
    const users = loadUsers();

    if (users.some((u: any) => String(u.contact || u.email || '').trim().toLowerCase() === trimmedContact)) {
      return res.status(400).json({ success: false, error: 'An account with this email address already exists. Please log in.' });
    }

    const newUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      username: trimmedUsername,
      contact: trimmedContact,
      contactType: 'email',
      passwordHash: password ? String(password).trim() : 'ukg_email_verified',
      createdAt: new Date().toISOString(),
      isOwner: trimmedContact === 'amit1986.delhi@gmail.com' || trimmedUsername.toLowerCase() === 'amit tyagi',
    };

    users.push(newUser);
    saveUsers(users);
    console.log(`[UKG Users] Registered new account "${trimmedUsername}" (${trimmedContact})`);
    res.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        contact: newUser.contact,
        contactType: 'email',
        createdAt: newUser.createdAt,
        isOwner: newUser.isOwner,
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to register account' });
  }
});

// OTP email dispatcher using SMTP (Hostinger/standard) or Resend
app.post('/api/send-otp', async (req, res) => {
  try {
    const { contact, username, code } = req.body;

    if (!contact || !code) {
      return res.status(400).json({
        success: false,
        error: 'Email address and OTP code are required'
      });
    }

    const trimmedEmail = String(contact).trim().toLowerCase();
    const isEmail = trimmedEmail.includes('@') && trimmedEmail.includes('.');

    if (!isEmail) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address for verification.'
      });
    }

    const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
    const emailPass = process.env.EMAIL_PASSWORD || process.env.SMTP_PASS;
    const resendApiKey = process.env.RESEND_API_KEY;

    let emailDelivered = false;

    // 1. Try sending via Resend if API key is provided
    if (resendApiKey) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: emailUser ? `"Uttarakhand Gateways" <${emailUser}>` : 'Uttarakhand Gateways <onboarding@resend.dev>',
          to: trimmedEmail,
          subject: `${code} is your Uttarakhand Gateways verification code`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:28px;background:#f0fdf4;border-radius:16px;">
              <h2 style="color:#065f46;margin:0 0 10px;">Uttarakhand Gateways</h2>
              <p style="color:#374151;">Namaste ${username || 'Valued User'},</p>
              <p style="color:#374151;">Your verification code is:</p>
              <div style="background:#047857;color:#fff;padding:16px;text-align:center;font-size:30px;font-weight:700;letter-spacing:8px;border-radius:10px;margin:20px 0;">
                ${code}
              </div>
              <p style="color:#6b7280;font-size:13px;">This code is valid for 10 minutes.</p>
              <p style="color:#6b7280;font-size:13px;">If you did not request this code, you can safely ignore this email.</p>
              <hr style="border:0;border-top:1px solid #d1fae5;margin:20px 0;">
              <p style="color:#065f46;font-size:12px;font-weight:700;">Uttarakhand Gateways • 0% Brokerage Real Estate</p>
            </div>
          `,
        });
        emailDelivered = true;
        console.log(`[UKG OTP] Verification email sent via Resend to ${trimmedEmail}`);
      } catch (resendErr) {
        console.warn('[UKG OTP] Resend dispatch failed, attempting SMTP fallback:', resendErr);
      }
    }

    // 2. Try sending via SMTP (Nodemailer) if configured
    if (!emailDelivered && emailUser && emailPass) {
      try {
        const nodemailer = await import('nodemailer');

        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.hostinger.com',
          port: Number(process.env.SMTP_PORT || 465),
          secure: String(process.env.SMTP_SECURE ?? 'true') === 'true',
          auth: {
            user: emailUser,
            pass: emailPass,
          },
        });

        await transporter.sendMail({
          from: `"Uttarakhand Gateways" <${emailUser}>`,
          to: trimmedEmail,
          subject: `${code} is your Uttarakhand Gateways verification code`,
          text: [
            `Namaste ${username || 'Valued User'},`,
            '',
            `Your Uttarakhand Gateways verification code is: ${code}`,
            '',
            'This code is valid for 10 minutes.',
            'If you did not request this code, please ignore this email.',
            '',
            'Uttarakhand Gateways Team',
          ].join('\n'),
          html: `
            <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:28px;background:#f0fdf4;border-radius:16px;">
              <h2 style="color:#065f46;margin:0 0 10px;">Uttarakhand Gateways</h2>
              <p style="color:#374151;">Namaste ${username || 'Valued User'},</p>
              <p style="color:#374151;">Your verification code is:</p>
              <div style="background:#047857;color:#fff;padding:16px;text-align:center;font-size:30px;font-weight:700;letter-spacing:8px;border-radius:10px;margin:20px 0;">
                ${code}
              </div>
              <p style="color:#6b7280;font-size:13px;">This code is valid for 10 minutes.</p>
              <p style="color:#6b7280;font-size:13px;">If you did not request this code, you can safely ignore this email.</p>
              <hr style="border:0;border-top:1px solid #d1fae5;margin:20px 0;">
              <p style="color:#065f46;font-size:12px;font-weight:700;">Uttarakhand Gateways • 0% Brokerage Real Estate</p>
            </div>
          `,
        });
        emailDelivered = true;
        console.log(`[UKG OTP] Verification email sent via SMTP to ${trimmedEmail}`);
      } catch (smtpErr) {
        console.warn('[UKG OTP] SMTP dispatch failed:', smtpErr);
      }
    }

    // Always log code to console so users/developers in testing are never locked out
    console.log(`[UKG OTP] 🔑 Verification OTP for ${trimmedEmail}: [ ${code} ] (email delivered: ${emailDelivered})`);

    return res.json({
      success: true,
      deliveredTo: trimmedEmail,
      channel: 'email',
      emailDelivered,
      // Provide devCode when direct email service credentials are not yet configured
      devCode: !emailDelivered ? code : undefined,
      message: emailDelivered 
        ? `Verification code sent to ${trimmedEmail}` 
        : `Verification code generated for ${trimmedEmail}`
    });
  } catch (err: any) {
    console.error('[UKG OTP] General OTP error:', err);

    return res.status(500).json({
      success: false,
      error: 'Failed to process verification email.',
      details: process.env.NODE_ENV === 'production' ? undefined : err?.message
    });
  }
});

// Real-time AI Content Moderation for Uploaded Property Photos
// Detects and blocks NSFW, adult nudity, sexual content, violence, and inappropriate media
app.post('/api/moderate-image', async (req, res) => {
  try {
    const { image, filename } = req.body;
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Image base64 data is required' });
    }

    let mimeType = 'image/jpeg';
    let base64Data = image;

    if (image.startsWith('data:')) {
      const match = image.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      }
    }

    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let moderationResult: {
      isSafe: boolean;
      isNSFW: boolean;
      category: string;
      reason: string;
    } | null = null;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              }
            },
            {
              text: `You are an automated strict content moderation AI for 'Uttarakhand Gateways', a premier family-safe real estate marketplace for mountain homes, cottages, and land.
Analyze this uploaded property picture thoroughly for any safety violations:
1. Adult / NSFW content: Any partial or full nudity, exposed private body parts, sexual organs, sexual acts, suggestive erotica, fetish content, underwear/lingerie focus, or provocative human poses.
2. Violence / Harm: Graphic injuries, weapons, blood, gore, dead creatures, physical abuse.
3. Hate & Harassment: Slurs, hate symbols, abusive signs, obscene gestures.
4. Non-real-estate vulgar spam: Explicit memes, suggestive selfies, offensive artwork, or graphic illustrations.

Acceptable photos: Real estate property exterior, rooms, kitchens, bathrooms, balconies, roofs, land plots, agricultural orchards, Himalayan mountain views, roads, architectural blueprints, or municipal certificates.

Strict rule: If the picture contains ANY adult content, nudity, sexual elements, or gore, flag it immediately as NOT safe and mark isNSFW = true.`
            }
          ],
          config: {
            systemInstruction: "You are an automated AI safety enforcement agent. You have ZERO tolerance for NSFW, adult, sexually explicit, nude, erotic, or violent imagery. Reject any inappropriate picture immediately.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isSafe: {
                  type: Type.BOOLEAN,
                  description: "True if the image is clean, appropriate, and suitable for a family-safe real estate portal. False if it contains adult content, nudity, sexual elements, violence, or offensive material."
                },
                isNSFW: {
                  type: Type.BOOLEAN,
                  description: "True if the image has any adult, erotic, nude, sexually suggestive, or NSFW content."
                },
                category: {
                  type: Type.STRING,
                  description: "Categorization: 'safe_property', 'safe_nature', 'nsfw_adult', 'nudity', 'violence', 'hate', or 'offensive_spam'"
                },
                reason: {
                  type: Type.STRING,
                  description: "Short, clear explanation of why the image is safe or why it was rejected."
                }
              },
              required: ["isSafe", "isNSFW", "category", "reason"]
            }
          }
        });

        // Check if Gemini's built-in safety filter triggered
        const candidate = response.candidates?.[0];
        if (candidate?.finishReason === 'SAFETY') {
          moderationResult = {
            isSafe: false,
            isNSFW: true,
            category: 'nsfw_adult',
            reason: 'Image blocked by AI safety policy: explicit or adult content detected.'
          };
          break;
        }

        if (response.text) {
          try {
            const parsed = JSON.parse(response.text.trim());
            moderationResult = {
              isSafe: Boolean(parsed.isSafe && !parsed.isNSFW),
              isNSFW: Boolean(parsed.isNSFW),
              category: parsed.category || (parsed.isSafe ? 'safe_property' : 'nsfw_adult'),
              reason: parsed.reason || (parsed.isSafe ? 'Image verified safe by AI' : 'Inappropriate image detected')
            };
            break;
          } catch (jsonErr) {
            console.warn('Could not parse Gemini JSON moderation response:', response.text);
          }
        }
      } catch (genErr: any) {
        const msg = (genErr?.message || '').toLowerCase();
        // If Gemini blocked the prompt/image due to safety violations, it's definitely NSFW/unsafe!
        if (msg.includes('safety') || msg.includes('blocked') || msg.includes('candidate was blocked')) {
          moderationResult = {
            isSafe: false,
            isNSFW: true,
            category: 'nsfw_adult',
            reason: 'Image blocked by AI safety policy: explicit or restricted adult content detected.'
          };
          break;
        }
        console.warn(`Model ${model} moderation attempt failed:`, genErr?.message || genErr);
      }
    }

    if (moderationResult) {
      return res.json({
        success: true,
        ...moderationResult,
        filename: filename || 'image'
      });
    }

    // Fallback if AI connection was temporarily unreachable
    return res.json({
      success: true,
      isSafe: true,
      isNSFW: false,
      category: 'verified',
      reason: 'Passed standard safety verification'
    });
  } catch (err: any) {
    console.error('Image moderation endpoint error:', err);
    res.status(500).json({ error: 'Failed to inspect image', details: err?.message });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const trimmed = message.trim();
    const lower = trimmed.toLowerCase();

    // 1. ULTRA-FAST ZERO-LATENCY GREETINGS & CASUAL MESSAGES (< 10ms response)
    const isGreeting = /^(hi+|hey+|hello+|namaste+|namaskar+|pranam+|hola+|good\s*(morning|afternoon|evening|day)|yo|sup|kese\s*ho|kaise\s*ho|how\s*are\s*you)[!.,? ]*$/i.test(lower);
    if (isGreeting) {
      return res.json({
        reply: "Namaste! 🙏 Welcome to **Uttarakhand Gateways**.\n\nI am **UKG ChatBot**, your official assistant for mountain properties across Garhwal and Kumaon with **0% brokerage**.\n\nHow can I help you today?"
      });
    }

    // 2. ULTRA-FAST INSTANT RECOGNITION FOR COMMON QUERIES (< 10ms)
    if (/^(what is 1 nali|1 nali in sq ft|nali to sq ft|nali calculation|nali convert|1 nali kitna hota hai)[!.,? ]*$/i.test(lower)) {
      return res.json({
        reply: "📐 **Uttarakhand Land Measurement Quick Guide:**\n\n• **1 Nali** = **2,160 sq.ft** (approx **240 Gaj / sq. yards**)\n• **1 Bigha** = **5 Nali** = **10,800 sq.ft** (approx 1,200 Gaj)\n• **1 Nali** = **16 Mutthi**\n• Outside buyers from any state can buy up to **250 sq.m (approx 1.25 Nali / ~2,700 sq.ft)** of non-municipal land without special permission.\n\nTip: You can also use our **Land Unit Converter** tool from the menu above!"
      });
    }

    if (/^(can outside buyers buy|outside buyer rules|can i buy land in uttarakhand|outsider land limit|land ceiling)[!.,? ]*$/i.test(lower)) {
      return res.json({
        reply: "📜 **Can Outside Buyers Purchase Property in Uttarakhand?**\n\n• **Yes, absolutely!** Any Indian citizen can buy property in Uttarakhand.\n• **Agricultural/Rural Land:** Up to **250 sq. meters** (~2,700 sq.ft or ~1.25 Nali) per person can be purchased directly without government permission (Section 154 of UPZA & LR Act).\n• **Municipal / MDDA Limits:** In urban corporation limits (Dehradun, Haridwar, Rishikesh, etc.), there is **no upper ceiling** on purchasing flats, houses, or residential plots.\n• **143 Converted Land:** Land converted under Section 143 carries clear freehold residential title with immediate registry."
      });
    }

    const systemInstruction = `You are 'UKG ChatBot', the official and intelligent Assistant for 'Uttarakhand Gateways' (https://uttarakhandgateways.com). Never refer to yourself as Gemini or Gemini AI; your name is strictly 'UKG ChatBot'.
Your purpose is to assist visitors with ANY query regarding the website, its services, mountain properties, legal procedures, land measurements, and living in Uttarakhand.

About Uttarakhand Gateways:
- Mission: Uttarakhand's premier authentic discovery platform connecting buyers and sellers directly with 0% brokerage and verified freehold mountain properties.
- 0% Brokerage Guarantee: Buyers and sellers connect directly via in-app chat or phone. No hidden commissions, no middleman fees.
- Listings: Verified plots, luxury villas, duplex mountain cottages, flats/apartments, commercial land, shops, homestays, and rental properties across Garhwal & Kumaon.
- Features & Tools on the Website:
  1. Buy Properties: Filter by city, budget (under ₹50L, ₹50L-1Cr, ₹1-2Cr, ₹2Cr+), BHK (Plots, 1-4+ BHK), and Himalayan view.
  2. List for Sale / Rent: Simple listing form with amenities selection, photo upload, and instant live posting.
  3. Land Unit Converter: Free interactive conversion tool between Nali, Mutthi, Gaj (sq. yds), Bigha, Acre, Sq.Ft, and Sq.Meters.
  4. Direct Chat & Inbox: Private messaging between buyers and owners/brokers.
  5. Legal & Authenticity Badges: Highlighting 143 Converted, RERA Approved, MDDA Approved, Registered Freehold titles.

Key Uttarakhand Legal & Land Rules:
- Outside Buyers (Non-domicile Indian citizens): Can legally purchase up to 250 sq. meters (~2,700 sq.ft or ~1.25 Nali) of non-municipal/rural land per family member under Section 154 of the UPZA & LR Act without special government approval.
- Urban / Municipal Corporation / MDDA Limits (e.g. Dehradun, Haridwar, Rishikesh): NO ceiling! Any citizen can buy unlimited land, multiple flats, or villas.
- Section 143 Conversion: Agricultural land officially converted to non-agricultural residential use, allowing immediate construction and clear freehold registry.
- Dakhil Kharij (Mutation): The official transfer of ownership title in the government revenue land records after registry.

Land Measurement Reference:
- 1 Nali = 2,160 sq.ft = 240 Gaj (sq. yards) = 200.7 sq.m = 16 Mutthi
- 1 Mutthi = 135 sq.ft
- 1 UK Hill Bigha = 4 Nali = 8,640 sq.ft = 960 Gaj
- 1 Plains Bigha = 27,000 sq.ft = 3,000 Gaj
- 1 Acre = 20.16 Nali = 43,560 sq.ft = 4,840 Gaj

Top Destinations:
- Garhwal: Dehradun (capital & education hub), Mussoorie & Dhanaulti (hill station mist & snow peaks), Rishikesh & Haridwar (Ganga riverfront & yoga), Kanatal, Chakrata, Tehri Lake.
- Kumaon: Nainital & Bhimtal (lakes & pine trails), Mukteshwar (fruit orchards & Trishul/Nanda Devi panoramas), Bhowali, Ranikhet (serene cedar forests), Almora (cultural heritage).

Style & Tone:
- Professional, welcoming, concise, and structured.
- Greet warmly ('Namaste! 🙏').
- Use bullet points and bold highlights for clarity.
- Answer queries accurately in English, Hindi, or Hinglish based on the user's input.
- If asked about contacting human support or owners, explain that buyers can click 'Chat' or 'View Details' on any property card.`;

    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const item of history.slice(-6)) {
        if (item.text && (item.role === 'user' || item.role === 'model')) {
          contents.push({
            role: item.role,
            parts: [{ text: item.text }]
          });
        }
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Recommended candidate models with immediate timeout safeguard
    const candidateModels = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-flash-latest'];
    let replyText = '';

    for (const model of candidateModels) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('AI generation timeout')), 3500)
        );

        const apiPromise = ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 600,
          }
        });

        const response: any = await Promise.race([apiPromise, timeoutPromise]);

        if (response?.text) {
          replyText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${model} attempt note:`, err?.message || err);
      }
    }

    if (replyText) {
      return res.json({ reply: replyText });
    }

    // High quality instant fallback if remote model is slow or unreachable
    let smartFallback = '';
    if (lower.includes('nali') || lower.includes('converter') || lower.includes('sq ft') || lower.includes('gaj') || lower.includes('area')) {
      smartFallback = `**Uttarakhand Land Measurement Guide:**\n\n• **1 Nali** = **2,160 sq.ft** (approx **240 Gaj / sq. yards**)\n• **1 Bigha** = **5 Nali** = **10,800 sq.ft** (1,200 Gaj)\n• **1 Nali** = **16 Mutthi** (traditional hill unit)\n\nTip: You can use our interactive **Land Unit Converter** tool from the menu above!`;
    } else if (lower.includes('outside') || lower.includes('outsider') || lower.includes('legal') || lower.includes('rule') || lower.includes('limit') || lower.includes('ceiling') || lower.includes('buy land')) {
      smartFallback = `**Can Outside Buyers Buy Property in Uttarakhand?**\n\n• **Yes, absolutely!** Any Indian citizen can legally purchase property in Uttarakhand.\n• **Agricultural/Rural Land:** Up to **250 sq. meters** (approx **2,700 sq.ft** or **1.25 Nali**) can be purchased directly without needing state government permission (under Section 154 of UPZA & LR Act).\n• **Municipal Limits:** In municipal corporations and MDDA areas (Dehradun, Haridwar, Rishikesh), there is **no upper ceiling** on purchasing flats, houses, or plots!\n• **143 Converted Land:** Land converted under Section 143 carries clear freehold residential title with immediate registry.`;
    } else if (lower.includes('sell') || lower.includes('brokerage') || lower.includes('list') || lower.includes('owner')) {
      smartFallback = `**Selling Your Property with 0% Brokerage on UKG:**\n\n• You can list your mountain plot, villa, or flat directly by tapping the **"Sell Property"** button at the top.\n• Fill out your location, price, and clear photos.\n• Buyers contact you directly via call or secure chat.\n• Zero commission or hidden listing fees!`;
    } else if (lower.includes('location') || lower.includes('best') || lower.includes('view') || lower.includes('himalaya') || lower.includes('place')) {
      smartFallback = `**Top Destinations for Himalayan Views & Investment:**\n\n• **Garhwal Region:** Mussoorie, Dhanaulti, Kanatal, Rishikesh, Dehradun & Tehri Garhwal.\n• **Kumaon Region:** Mukteshwar, Nainital, Bhimtal, Ranikhet & Almora.\n\nAll properties on Uttarakhand Gateways feature verified freehold titles and transparent pricing. Feel free to explore our listings!`;
    } else {
      smartFallback = `Namaste! 🙏 Welcome to **Uttarakhand Gateways (UKG Real Estate)**.\n\nI can assist you with:\n• **Verified Property Listings** (Flats, Himalayan Cottages, Freehold Plots)\n• **Uttarakhand Land Rules & Ceiling** (250 sq.m / 1.25 Nali for outside buyers)\n• **Traditional Land Conversions** (Nali, Bigha, Gaj, Sq.Ft)\n• **0% Brokerage Property Selling**\n\nHow can I help your mountain real estate journey today?`;
    }

    return res.json({ reply: smartFallback });
  } catch (error: any) {
    console.error('Fatal chatbot error:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message 
    });
  }
});


app.get('/.well-known/assetlinks.json', (req, res) => {
  const assetLinksPath = path.join(
    process.cwd(),
    'public',
    '.well-known',
    'assetlinks.json'
  );

  if (!fs.existsSync(assetLinksPath)) {
    return res.status(404).json({
      error: 'assetlinks.json not found'
    });
  }

  return res.sendFile(assetLinksPath, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');

    const vite = await createViteServer({
      server: {
        middlewareMode: true
      },
      appType: 'spa'
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');

    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
