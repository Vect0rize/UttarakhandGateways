import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { Pool as PgPool } from 'pg';

const currentFilename = typeof __filename !== 'undefined' ? __filename : (typeof import.meta !== 'undefined' && (import.meta as any)?.url ? fileURLToPath((import.meta as any).url) : '');
const currentDirname = typeof __dirname !== 'undefined' ? __dirname : (currentFilename ? path.dirname(currentFilename) : process.cwd());

dotenv.config();

export interface DbProperty {
  id: string;
  title: string;
  category?: string;
  type?: string;
  city?: string;
  price?: number;
  data: string; // JSON string of full Property object
  created_at?: string;
  updated_at?: string;
}

export interface DbUser {
  id: string;
  username: string;
  contact: string; // normalized email
  passwordHash: string; // bcrypt hash
  role?: 'user' | 'owner' | 'admin';
  avatar?: string;
  isOwner?: boolean;
  createdAt?: string;
  updatedAt?: string;
  data?: string;
}

export interface DbSession {
  sessionId: string;
  userId: string;
  createdAt: string;
  expiresAt: number; // unix ms
}

export interface DbPasswordReset {
  tokenHash: string;
  userId: string;
  email: string;
  expiresAt: number; // unix ms
  used: boolean;
}

export interface DbOtp {
  contact: string;
  codeHash: string;
  expiresAt: number;
  attempts: number;
}

export interface DbFavorite {
  userId: string;
  propertyId: string;
  createdAt: string;
}

export interface DbInquiryMessage {
  id: string;
  senderId?: string;
  sender: 'buyer' | 'seller';
  senderName: string;
  text: string;
  timestamp: string;
  createdAt?: string;
}

export interface DbInquiryThread {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyCity?: string;
  propertyImage?: string;
  propertyPrice?: string;
  sellerId?: string;
  sellerName: string;
  sellerContact?: string;
  buyerId?: string;
  buyerName: string;
  buyerContact?: string;
  unreadCount?: number;
  lastMessage: string;
  lastMessageTime: string;
  messages: DbInquiryMessage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DbReport {
  id: string;
  propertyId: string;
  propertyTitle?: string;
  userId?: string;
  userContact?: string;
  reason: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  createdAt: string;
}

export interface DbLead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  loanAmount?: string;
  propertyId?: string;
  type: string;
  message?: string;
  createdAt: string;
}

export type DbType = 'mysql' | 'postgres' | 'file';

class DatabaseService {
  private dbType: DbType = 'file';
  private mysqlPool: mysql.Pool | null = null;
  private pgPool: PgPool | null = null;
  private initialized: boolean = false;

  private dataDir: string;
  private propertiesFilePath: string;
  private seedFilePath: string;
  private usersFilePath: string;
  private sessionsFilePath: string;
  private resetsFilePath: string;
  private otpsFilePath: string;
  private favoritesFilePath: string;
  private inquiriesFilePath: string;
  private reportsFilePath: string;
  private leadsFilePath: string;

  constructor() {
    const possibleDataDirs = [
      process.env.DATA_DIR,
      path.join(process.cwd(), 'data'),
      path.resolve(currentDirname, '..', 'data'),
      path.resolve(currentDirname, 'data')
    ].filter(Boolean) as string[];

    const foundDataDir = possibleDataDirs.find(d => fs.existsSync(d));
    this.dataDir = foundDataDir || path.join(process.cwd(), 'data');

    this.propertiesFilePath = process.env.DATABASE_PATH || path.join(this.dataDir, 'properties.json');
    this.seedFilePath = path.join(this.dataDir, 'seed_properties.json');
    if (!fs.existsSync(this.seedFilePath)) {
      const altSeed = path.join(process.cwd(), 'data', 'seed_properties.json');
      if (fs.existsSync(altSeed)) this.seedFilePath = altSeed;
    }
    this.usersFilePath = path.join(this.dataDir, 'users.json');
    this.sessionsFilePath = path.join(this.dataDir, 'sessions.json');
    this.resetsFilePath = path.join(this.dataDir, 'password_resets.json');
    this.otpsFilePath = path.join(this.dataDir, 'otps.json');
    this.favoritesFilePath = path.join(this.dataDir, 'favorites.json');
    this.inquiriesFilePath = path.join(this.dataDir, 'inquiries.json');
    this.reportsFilePath = path.join(this.dataDir, 'reports.json');
    this.leadsFilePath = path.join(this.dataDir, 'leads.json');

    if (!fs.existsSync(this.dataDir)) {
      try {
        fs.mkdirSync(this.dataDir, { recursive: true });
      } catch (err) {
        console.warn('[UKG DB] Could not create data directory:', err);
      }
    }
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
    const mysqlHost = process.env.MYSQL_HOST;

    // 1. Detect PostgreSQL
    if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
      try {
        console.log('[UKG DB] Attempting connection to PostgreSQL database...');
        this.pgPool = new PgPool({
          connectionString: dbUrl,
          ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 20000,
          keepAlive: true,
        });

        const client = await this.pgPool.connect();
        try {
          await client.query(`
            CREATE TABLE IF NOT EXISTS ukg_properties (
              id VARCHAR(255) PRIMARY KEY,
              title VARCHAR(500) NOT NULL,
              category VARCHAR(100),
              type VARCHAR(100),
              city VARCHAR(100),
              price BIGINT,
              data TEXT NOT NULL,
              created_at VARCHAR(100),
              updated_at VARCHAR(100)
            );
          `);

          await client.query(`
            CREATE TABLE IF NOT EXISTS ukg_users (
              id VARCHAR(255) PRIMARY KEY,
              username VARCHAR(255) NOT NULL,
              contact VARCHAR(255) UNIQUE NOT NULL,
              data TEXT NOT NULL,
              created_at VARCHAR(100)
            );
          `);

          await client.query(`
            CREATE TABLE IF NOT EXISTS ukg_sessions (
              session_id VARCHAR(255) PRIMARY KEY,
              user_id VARCHAR(255) NOT NULL,
              created_at VARCHAR(100) NOT NULL,
              expires_at BIGINT NOT NULL
            );
          `);

          await client.query(`
            CREATE TABLE IF NOT EXISTS ukg_password_resets (
              token_hash VARCHAR(255) PRIMARY KEY,
              user_id VARCHAR(255) NOT NULL,
              email VARCHAR(255) NOT NULL,
              expires_at BIGINT NOT NULL,
              used INT DEFAULT 0
            );
          `);

          await client.query(`
            CREATE TABLE IF NOT EXISTS ukg_otps (
              contact VARCHAR(255) PRIMARY KEY,
              code_hash VARCHAR(255) NOT NULL,
              expires_at BIGINT NOT NULL,
              attempts INT DEFAULT 0
            );
          `);

          await client.query(`
            CREATE TABLE IF NOT EXISTS ukg_favorites (
              user_id VARCHAR(255) NOT NULL,
              property_id VARCHAR(255) NOT NULL,
              created_at VARCHAR(100) NOT NULL,
              PRIMARY KEY (user_id, property_id)
            );
          `);

          await client.query(`
            CREATE TABLE IF NOT EXISTS ukg_inquiries (
              id VARCHAR(255) PRIMARY KEY,
              property_id VARCHAR(255) NOT NULL,
              buyer_id VARCHAR(255),
              buyer_contact VARCHAR(255),
              seller_id VARCHAR(255),
              seller_contact VARCHAR(255),
              data TEXT NOT NULL,
              updated_at VARCHAR(100) NOT NULL
            );
          `);

          await client.query(`
            CREATE TABLE IF NOT EXISTS ukg_reports (
              id VARCHAR(255) PRIMARY KEY,
              property_id VARCHAR(255) NOT NULL,
              property_title VARCHAR(500),
              user_id VARCHAR(255),
              user_contact VARCHAR(255),
              reason VARCHAR(255) NOT NULL,
              details TEXT,
              status VARCHAR(50) DEFAULT 'pending',
              created_at VARCHAR(100) NOT NULL
            );
          `);

          await client.query(`
            CREATE TABLE IF NOT EXISTS ukg_leads (
              id VARCHAR(255) PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              phone VARCHAR(100) NOT NULL,
              email VARCHAR(255),
              city VARCHAR(100),
              loan_amount VARCHAR(100),
              property_id VARCHAR(255),
              type VARCHAR(100) DEFAULT 'general',
              message TEXT,
              created_at VARCHAR(100) NOT NULL
            );
          `);

          console.log('[UKG DB] PostgreSQL schema ready.');
          this.dbType = 'postgres';
          this.initialized = true;

          const countRes = await client.query('SELECT COUNT(*) FROM ukg_properties');
          const count = parseInt(countRes.rows[0].count, 10);
          if (count === 0) {
            await this.seedFromDiskToPg(client);
          }

          const userCountRes = await client.query('SELECT COUNT(*) FROM ukg_users');
          const userCount = parseInt(userCountRes.rows[0].count, 10);
          if (userCount === 0) {
            await this.seedUsersFromDiskToPg(client);
          }
        } finally {
          client.release();
        }
        return;
      } catch (pgErr) {
        console.error('[UKG DB] PostgreSQL connection failed, falling back to other storage:', pgErr);
        this.pgPool = null;
      }
    }

    // 2. Detect MySQL (Hostinger standard)
    if (dbUrl.startsWith('mysql://') || dbUrl.startsWith('mysql2://') || mysqlHost) {
      try {
        console.log('[UKG DB] Attempting connection to MySQL database...');
        if (dbUrl) {
          this.mysqlPool = mysql.createPool({
            uri: dbUrl,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
          });
        } else {
          this.mysqlPool = mysql.createPool({
            host: process.env.MYSQL_HOST || '127.0.0.1',
            port: Number(process.env.MYSQL_PORT || 3306),
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
          });
        }

        const conn = await this.mysqlPool.getConnection();
        try {
          await conn.query(`
            CREATE TABLE IF NOT EXISTS ukg_properties (
              id VARCHAR(255) PRIMARY KEY,
              title VARCHAR(500) NOT NULL,
              category VARCHAR(100),
              type VARCHAR(100),
              city VARCHAR(100),
              price BIGINT,
              data LONGTEXT NOT NULL,
              created_at VARCHAR(100),
              updated_at VARCHAR(100)
            );
          `);

          await conn.query(`
            CREATE TABLE IF NOT EXISTS ukg_users (
              id VARCHAR(255) PRIMARY KEY,
              username VARCHAR(255) NOT NULL,
              contact VARCHAR(255) UNIQUE NOT NULL,
              data LONGTEXT NOT NULL,
              created_at VARCHAR(100)
            );
          `);

          await conn.query(`
            CREATE TABLE IF NOT EXISTS ukg_sessions (
              session_id VARCHAR(255) PRIMARY KEY,
              user_id VARCHAR(255) NOT NULL,
              created_at VARCHAR(100) NOT NULL,
              expires_at BIGINT NOT NULL
            );
          `);

          await conn.query(`
            CREATE TABLE IF NOT EXISTS ukg_password_resets (
              token_hash VARCHAR(255) PRIMARY KEY,
              user_id VARCHAR(255) NOT NULL,
              email VARCHAR(255) NOT NULL,
              expires_at BIGINT NOT NULL,
              used INT DEFAULT 0
            );
          `);

          await conn.query(`
            CREATE TABLE IF NOT EXISTS ukg_otps (
              contact VARCHAR(255) PRIMARY KEY,
              code_hash VARCHAR(255) NOT NULL,
              expires_at BIGINT NOT NULL,
              attempts INT DEFAULT 0
            );
          `);

          await conn.query(`
            CREATE TABLE IF NOT EXISTS ukg_favorites (
              user_id VARCHAR(255) NOT NULL,
              property_id VARCHAR(255) NOT NULL,
              created_at VARCHAR(100) NOT NULL,
              PRIMARY KEY (user_id, property_id),
              INDEX idx_fav_user (user_id),
              INDEX idx_fav_prop (property_id)
            );
          `);

          await conn.query(`
            CREATE TABLE IF NOT EXISTS ukg_inquiries (
              id VARCHAR(255) PRIMARY KEY,
              property_id VARCHAR(255) NOT NULL,
              buyer_id VARCHAR(255),
              buyer_contact VARCHAR(255),
              seller_id VARCHAR(255),
              seller_contact VARCHAR(255),
              data LONGTEXT NOT NULL,
              updated_at VARCHAR(100) NOT NULL
            );
          `);

          await conn.query(`
            CREATE TABLE IF NOT EXISTS ukg_reports (
              id VARCHAR(255) PRIMARY KEY,
              property_id VARCHAR(255) NOT NULL,
              property_title VARCHAR(500),
              user_id VARCHAR(255),
              user_contact VARCHAR(255),
              reason VARCHAR(255) NOT NULL,
              details TEXT,
              status VARCHAR(50) DEFAULT 'pending',
              created_at VARCHAR(100) NOT NULL
            );
          `);

          await conn.query(`
            CREATE TABLE IF NOT EXISTS ukg_leads (
              id VARCHAR(255) PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              phone VARCHAR(100) NOT NULL,
              email VARCHAR(255),
              city VARCHAR(100),
              loan_amount VARCHAR(100),
              property_id VARCHAR(255),
              type VARCHAR(100) DEFAULT 'general',
              message TEXT,
              created_at VARCHAR(100) NOT NULL
            );
          `);

          console.log('[UKG DB] MySQL schema ready.');
          this.dbType = 'mysql';
          this.initialized = true;

          const [rows]: any = await conn.query('SELECT COUNT(*) as cnt FROM ukg_properties');
          const count = rows[0]?.cnt || 0;
          if (count === 0) {
            await this.seedFromDiskToMysql(conn);
          }
        } finally {
          conn.release();
        }
        return;
      } catch (mysqlErr) {
        console.error('[UKG DB] MySQL connection failed, falling back to persistent file storage:', mysqlErr);
        this.mysqlPool = null;
      }
    }

    // 3. Fallback: Robust Persistent File Storage
    console.log(`[UKG DB] Using persistent file storage at: ${this.propertiesFilePath}`);
    this.dbType = 'file';
    this.initialized = true;

    // Safe one-time initial seeding: only if properties file does not exist or is completely empty
    if (!fs.existsSync(this.propertiesFilePath) || this.readJsonFile(this.propertiesFilePath).length === 0) {
      const seedCandidate = fs.existsSync(this.seedFilePath)
        ? this.seedFilePath
        : path.join(this.dataDir, 'seed_properties.json');
      if (fs.existsSync(seedCandidate)) {
        try {
          const seeds = this.readJsonFile(seedCandidate);
          if (seeds.length > 0) {
            console.log(`[UKG DB] Initializing file database with ${seeds.length} seed properties from ${seedCandidate}`);
            this.writeJsonFileAtomically(this.propertiesFilePath, seeds);
          }
        } catch (seedErr) {
          console.warn('[UKG DB] Could not initialize from seed file:', seedErr);
        }
      }
    }
  }

  public getDatabaseType(): DbType {
    return this.dbType;
  }

  // --- Seeding Helpers ---
  private async seedFromDiskToPg(client: any): Promise<void> {
    let local = this.readJsonFile(this.propertiesFilePath);
    if (local.length === 0) {
      const seedCandidate = fs.existsSync(this.seedFilePath) ? this.seedFilePath : path.join(this.dataDir, 'seed_properties.json');
      if (fs.existsSync(seedCandidate)) {
        local = this.readJsonFile(seedCandidate);
      }
    }
    if (local.length === 0) return;
    console.log(`[UKG DB] Seeding ${local.length} initial properties to PostgreSQL...`);
    for (const p of local) {
      if (!p || !p.id) continue;
      const json = JSON.stringify(p);
      await client.query(
        `INSERT INTO ukg_properties (id, title, category, type, city, price, data, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET data = $7, updated_at = $9`,
        [p.id, p.title || 'Untitled', p.category || '', p.type || '', p.city || '', p.price || 0, json, p.createdAt || new Date().toISOString(), new Date().toISOString()]
      );
    }
  }

  private async seedUsersFromDiskToPg(client: any): Promise<void> {
    const users = this.readJsonFile(this.usersFilePath);
    if (!users || users.length === 0) return;
    console.log(`[UKG DB] Seeding ${users.length} initial users to PostgreSQL...`);
    for (const u of users) {
      if (!u || !u.id) continue;
      const contact = (u.contact || u.email || '').trim().toLowerCase();
      const json = JSON.stringify(u);
      await client.query(
        `INSERT INTO ukg_users (id, username, contact, data, created_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET username = $2, contact = $3, data = $4`,
        [u.id, u.username || 'User', contact, json, u.createdAt || new Date().toISOString()]
      );
    }
  }

  private async seedFromDiskToMysql(conn: any): Promise<void> {
    let local = this.readJsonFile(this.propertiesFilePath);
    if (local.length === 0) {
      const seedCandidate = fs.existsSync(this.seedFilePath) ? this.seedFilePath : path.join(this.dataDir, 'seed_properties.json');
      if (fs.existsSync(seedCandidate)) {
        local = this.readJsonFile(seedCandidate);
      }
    }
    if (local.length === 0) return;
    console.log(`[UKG DB] Seeding ${local.length} initial properties to MySQL...`);
    for (const p of local) {
      if (!p || !p.id) continue;
      const json = JSON.stringify(p);
      await conn.query(
        `INSERT INTO ukg_properties (id, title, category, type, city, price, data, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = VALUES(updated_at)`,
        [p.id, p.title || 'Untitled', p.category || '', p.type || '', p.city || '', p.price || 0, json, p.createdAt || new Date().toISOString(), new Date().toISOString()]
      );
    }
  }

  // --- Atomic JSON File Read & Write Helpers ---
  private readJsonFile(filePath: string): any[] {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        if (content.trim()) {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) return parsed;
        }
      }
    } catch (err) {
      console.error(`[UKG DB] Failed to read ${filePath}:`, err);
    }
    return [];
  }

  private writeJsonFileAtomically(filePath: string, data: any[]): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      const tmpFile = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 6)}`;
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, filePath);
    } catch (err) {
      console.error(`[UKG DB] Failed to write atomically to ${filePath}:`, err);
    }
  }

  // ==========================================
  // PROPERTIES CRUD METHODS
  // ==========================================

  private sanitizeProperty(p: any): any {
    if (!p || typeof p !== 'object') return p;
    if (p.roadAccess !== undefined) delete p.roadAccess;
    if (Array.isArray(p.highlights)) {
      p.highlights = p.highlights.filter((h: any) => typeof h === 'string' && !/road|highway|motorable|direct vehicle access/i.test(h));
    }
    if (Array.isArray(p.amenities)) {
      p.amenities = p.amenities.map((a: any) => typeof a === 'string' && /motorable|road_access|road access/i.test(a) ? 'Solar Power Backup' : a);
    }
    return p;
  }

  public async getAllProperties(): Promise<any[]> {
    if (!this.initialized) await this.initialize();

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        const res = await this.pgPool.query('SELECT data FROM ukg_properties ORDER BY created_at DESC');
        return res.rows.map((r) => {
          const p = typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
          return this.sanitizeProperty(p);
        });
      } catch (err) {
        console.error('[UKG DB] Error fetching properties from PostgreSQL:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        const [rows]: any = await this.mysqlPool.query('SELECT data FROM ukg_properties ORDER BY created_at DESC');
        return rows.map((r: any) => this.sanitizeProperty(typeof r.data === 'string' ? JSON.parse(r.data) : r.data));
      } catch (err) {
        console.error('[UKG DB] Error fetching properties from MySQL:', err);
      }
    }

    const all = this.readJsonFile(this.propertiesFilePath);
    return all.map((p) => this.sanitizeProperty(p));
  }

  public async getPropertyById(id: string): Promise<any | null> {
    if (!this.initialized) await this.initialize();

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        const res = await this.pgPool.query('SELECT data FROM ukg_properties WHERE id = $1', [id]);
        if (res.rows.length > 0) {
          const r = res.rows[0];
          const p = typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
          return this.sanitizeProperty(p);
        }
        return null;
      } catch (err) {
        console.error('[UKG DB] Error fetching property by id from PostgreSQL:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        const [rows]: any = await this.mysqlPool.query('SELECT data FROM ukg_properties WHERE id = ?', [id]);
        if (rows.length > 0) {
          const r = rows[0];
          const p = typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
          return this.sanitizeProperty(p);
        }
        return null;
      } catch (err) {
        console.error('[UKG DB] Error fetching property by id from MySQL:', err);
      }
    }

    const all = this.readJsonFile(this.propertiesFilePath);
    const found = all.find((p) => p.id === id) || null;
    return this.sanitizeProperty(found);
  }

  public async saveProperty(property: any): Promise<any> {
    if (!this.initialized) await this.initialize();

    property = this.sanitizeProperty(property);

    if (!property.createdAt) {
      property.createdAt = new Date().toISOString();
    }
    const json = JSON.stringify(property);
    const now = new Date().toISOString();
    const isFake = property.isFake === true;

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO ukg_properties (id, title, category, type, city, price, data, created_at, updated_at, is_fake)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO UPDATE SET
             title = $2,
             category = $3,
             type = $4,
             city = $5,
             price = $6,
             data = $7,
             updated_at = $9,
             is_fake = $10`,
          [property.id, property.title, property.category || '', property.type || '', property.city || '', property.price || 0, json, property.createdAt, now, isFake]
        );
        const local = this.readJsonFile(this.propertiesFilePath).filter((p) => p.id !== property.id);
        local.unshift(property);
        this.writeJsonFileAtomically(this.propertiesFilePath, local);
        return property;
      } catch (err) {
        console.error('[UKG DB] PostgreSQL saveProperty error:', err);
        throw err;
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        await this.mysqlPool.query(
          `INSERT INTO ukg_properties (id, title, category, type, city, price, data, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             title = VALUES(title),
             category = VALUES(category),
             type = VALUES(type),
             city = VALUES(city),
             price = VALUES(price),
             data = VALUES(data),
             updated_at = VALUES(updated_at)`,
          [property.id, property.title, property.category || '', property.type || '', property.city || '', property.price || 0, json, property.createdAt, now]
        );
        const local = this.readJsonFile(this.propertiesFilePath).filter((p) => p.id !== property.id);
        local.unshift(property);
        this.writeJsonFileAtomically(this.propertiesFilePath, local);
        return property;
      } catch (err) {
        console.error('[UKG DB] MySQL saveProperty error:', err);
        throw err;
      }
    }

    const list = this.readJsonFile(this.propertiesFilePath);
    const idx = list.findIndex((p) => p.id === property.id);
    if (idx >= 0) {
      list[idx] = property;
    } else {
      list.unshift(property);
    }
    this.writeJsonFileAtomically(this.propertiesFilePath, list);
    return property;
  }

  public async updateProperty(id: string, updates: any): Promise<any | null> {
    if (!this.initialized) await this.initialize();

    const existing = await this.getPropertyById(id);
    if (!existing) return null;

    const merged: Record<string, any> = {
      ...existing,
      ...updates,
      id,
      createdAt: existing.createdAt || updates.createdAt || new Date().toISOString(),
    };

    for (const key of Object.keys(merged)) {
      if (merged[key] === null) delete merged[key];
    }

    await this.saveProperty(merged);
    return merged;
  }

  public async incrementPropertyMetric(id: string, metric: 'views' | 'shares' | 'inquiries'): Promise<any | null> {
    if (!this.initialized) await this.initialize();
    const existing = await this.getPropertyById(id);
    if (!existing) return null;
    const current = typeof existing[metric] === 'number' ? existing[metric] : 0;
    const nextVal = current + 1;
    return await this.updateProperty(id, { [metric]: nextVal });
  }

  public async deleteProperty(id: string): Promise<boolean> {
    if (!this.initialized) await this.initialize();

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        await this.pgPool.query('DELETE FROM ukg_properties WHERE id = $1', [id]);
        const local = this.readJsonFile(this.propertiesFilePath).filter((p) => p.id !== id);
        this.writeJsonFileAtomically(this.propertiesFilePath, local);
        return true;
      } catch (err) {
        console.error('[UKG DB] PostgreSQL deleteProperty error:', err);
        throw err;
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        await this.mysqlPool.query('DELETE FROM ukg_properties WHERE id = ?', [id]);
        const local = this.readJsonFile(this.propertiesFilePath).filter((p) => p.id !== id);
        this.writeJsonFileAtomically(this.propertiesFilePath, local);
        return true;
      } catch (err) {
        console.error('[UKG DB] MySQL deleteProperty error:', err);
        throw err;
      }
    }

    const list = this.readJsonFile(this.propertiesFilePath).filter((p) => p.id !== id);
    this.writeJsonFileAtomically(this.propertiesFilePath, list);
    return true;
  }

  public async clearAllProperties(): Promise<void> {
    if (!this.initialized) await this.initialize();

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        await this.pgPool.query('DELETE FROM ukg_properties');
      } catch (err) {
        console.error('[UKG DB] PostgreSQL clearAllProperties error:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        await this.mysqlPool.query('DELETE FROM ukg_properties');
      } catch (err) {
        console.error('[UKG DB] MySQL clearAllProperties error:', err);
      }
    }

    this.writeJsonFileAtomically(this.propertiesFilePath, []);
  }

  public async bulkSyncProperties(incoming: any[]): Promise<{ added: number; total: number }> {
    if (!this.initialized) await this.initialize();

    const current = await this.getAllProperties();
    const existingIds = new Set(current.map((p) => p.id));
    let added = 0;

    for (const prop of incoming) {
      if (prop && prop.id && !existingIds.has(prop.id)) {
        await this.saveProperty(prop);
        existingIds.add(prop.id);
        added++;
      }
    }

    const total = (await this.getAllProperties()).length;
    return { added, total };
  }

  // ==========================================
  // PROGRESSIVE AUTO-REPLACEMENT ENGINE
  // (1 Fake Removed for Every 1 Real Uploaded)
  // ==========================================

  public async deleteOneFakeProperty(): Promise<any | null> {
    if (!this.initialized) await this.initialize();

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        // Query the oldest fake property in the database
        const res = await this.pgPool.query(
          `SELECT id, title, data FROM ukg_properties WHERE is_fake = true ORDER BY created_at ASC LIMIT 1`
        );
        if (res.rows.length > 0) {
          const row = res.rows[0];
          const fakeId = row.id;
          const fakeObj = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
          await this.pgPool.query('DELETE FROM ukg_properties WHERE id = $1', [fakeId]);
          const local = this.readJsonFile(this.propertiesFilePath).filter((p) => p.id !== fakeId);
          this.writeJsonFileAtomically(this.propertiesFilePath, local);
          return fakeObj;
        }
        return null;
      } catch (err) {
        console.error('[UKG DB] PostgreSQL deleteOneFakeProperty error:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        const [rows]: any = await this.mysqlPool.query(
          `SELECT id, title, data FROM ukg_properties WHERE is_fake = 1 ORDER BY created_at ASC LIMIT 1`
        );
        if (rows.length > 0) {
          const fakeId = rows[0].id;
          const fakeObj = typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data;
          await this.mysqlPool.query('DELETE FROM ukg_properties WHERE id = ?', [fakeId]);
          const local = this.readJsonFile(this.propertiesFilePath).filter((p) => p.id !== fakeId);
          this.writeJsonFileAtomically(this.propertiesFilePath, local);
          return fakeObj;
        }
        return null;
      } catch (err) {
        console.error('[UKG DB] MySQL deleteOneFakeProperty error:', err);
      }
    }

    const list = this.readJsonFile(this.propertiesFilePath);
    const idx = list.findIndex((p) => p.isFake === true);
    if (idx >= 0) {
      const [deleted] = list.splice(idx, 1);
      this.writeJsonFileAtomically(this.propertiesFilePath, list);
      return deleted;
    }
    return null;
  }

  public async countFakeProperties(): Promise<number> {
    if (!this.initialized) await this.initialize();

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        const res = await this.pgPool.query('SELECT COUNT(*) FROM ukg_properties WHERE is_fake = true');
        return parseInt(res.rows[0].count, 10);
      } catch (err) {
        console.error('[UKG DB] PostgreSQL countFakeProperties error:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        const [rows]: any = await this.mysqlPool.query('SELECT COUNT(*) as cnt FROM ukg_properties WHERE is_fake = 1');
        return rows[0]?.cnt || 0;
      } catch (err) {
        console.error('[UKG DB] MySQL countFakeProperties error:', err);
      }
    }

    return this.readJsonFile(this.propertiesFilePath).filter((p) => p.isFake === true).length;
  }

  public async countRealProperties(): Promise<number> {
    if (!this.initialized) await this.initialize();

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        const res = await this.pgPool.query('SELECT COUNT(*) FROM ukg_properties WHERE is_fake IS NOT TRUE');
        return parseInt(res.rows[0].count, 10);
      } catch (err) {
        console.error('[UKG DB] PostgreSQL countRealProperties error:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        const [rows]: any = await this.mysqlPool.query('SELECT COUNT(*) as cnt FROM ukg_properties WHERE is_fake != 1 OR is_fake IS NULL');
        return rows[0]?.cnt || 0;
      } catch (err) {
        console.error('[UKG DB] MySQL countRealProperties error:', err);
      }
    }

    return this.readJsonFile(this.propertiesFilePath).filter((p) => !p.isFake).length;
  }

  public async deleteAllFakeProperties(): Promise<number> {
    if (!this.initialized) await this.initialize();
    let count = 0;

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        const res = await this.pgPool.query('DELETE FROM ukg_properties WHERE is_fake = true');
        count = res.rowCount || 0;
        const local = this.readJsonFile(this.propertiesFilePath).filter((p) => !p.isFake);
        this.writeJsonFileAtomically(this.propertiesFilePath, local);
        return count;
      } catch (err) {
        console.error('[UKG DB] PostgreSQL deleteAllFakeProperties error:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        const [res]: any = await this.mysqlPool.query('DELETE FROM ukg_properties WHERE is_fake = 1');
        count = res?.affectedRows || 0;
        const local = this.readJsonFile(this.propertiesFilePath).filter((p) => !p.isFake);
        this.writeJsonFileAtomically(this.propertiesFilePath, local);
        return count;
      } catch (err) {
        console.error('[UKG DB] MySQL deleteAllFakeProperties error:', err);
      }
    }

    const list = this.readJsonFile(this.propertiesFilePath);
    const reals = list.filter((p) => !p.isFake);
    count = list.length - reals.length;
    this.writeJsonFileAtomically(this.propertiesFilePath, reals);
    return count;
  }

  // ==========================================
  // USERS & AUTH METHODS
  // ==========================================

  public async getAllUsers(): Promise<DbUser[]> {
    if (!this.initialized) await this.initialize();

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        const res = await this.pgPool.query('SELECT data FROM ukg_users ORDER BY created_at DESC');
        return res.rows.map((r) => (typeof r.data === 'string' ? JSON.parse(r.data) : r.data));
      } catch (err) {
        console.error('[UKG DB] PostgreSQL getAllUsers error:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        const [rows]: any = await this.mysqlPool.query('SELECT data FROM ukg_users ORDER BY created_at DESC');
        return rows.map((r: any) => (typeof r.data === 'string' ? JSON.parse(r.data) : r.data));
      } catch (err) {
        console.error('[UKG DB] MySQL getAllUsers error:', err);
      }
    }

    return this.readJsonFile(this.usersFilePath);
  }

  public async findUserByEmail(email: string): Promise<DbUser | null> {
    if (!this.initialized) await this.initialize();
    const normalized = email.trim().toLowerCase();

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        const res = await this.pgPool.query('SELECT data FROM ukg_users WHERE contact = $1', [normalized]);
        if (res.rows.length > 0) {
          const r = res.rows[0];
          return typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
        }
        return null;
      } catch (err) {
        console.error('[UKG DB] PostgreSQL findUserByEmail error:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        const [rows]: any = await this.mysqlPool.query('SELECT data FROM ukg_users WHERE contact = ?', [normalized]);
        if (rows.length > 0) {
          const r = rows[0];
          return typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
        }
        return null;
      } catch (err) {
        console.error('[UKG DB] MySQL findUserByEmail error:', err);
      }
    }

    const users = this.readJsonFile(this.usersFilePath);
    return users.find((u) => (u.contact || u.email || '').trim().toLowerCase() === normalized) || null;
  }

  public async findUserById(id: string): Promise<DbUser | null> {
    if (!this.initialized) await this.initialize();

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        const res = await this.pgPool.query('SELECT data FROM ukg_users WHERE id = $1', [id]);
        if (res.rows.length > 0) {
          const r = res.rows[0];
          return typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
        }
        return null;
      } catch (err) {
        console.error('[UKG DB] PostgreSQL findUserById error:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        const [rows]: any = await this.mysqlPool.query('SELECT data FROM ukg_users WHERE id = ?', [id]);
        if (rows.length > 0) {
          const r = rows[0];
          return typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
        }
        return null;
      } catch (err) {
        console.error('[UKG DB] MySQL findUserById error:', err);
      }
    }

    const users = this.readJsonFile(this.usersFilePath);
    return users.find((u) => u.id === id) || null;
  }

  public async saveUser(user: DbUser): Promise<DbUser> {
    if (!this.initialized) await this.initialize();

    const normalizedContact = (user.contact || (user as any).email || '').trim().toLowerCase();
    const adminEmail = (process.env.ADMIN_EMAIL || 'amit1986.delhi@gmail.com').trim().toLowerCase();
    const isOwner = normalizedContact === adminEmail && Boolean(user.isOwner || user.role === 'owner' || normalizedContact === 'amit1986.delhi@gmail.com');
    const completeUser: DbUser = {
      ...user,
      contact: normalizedContact,
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isOwner,
      role: isOwner ? 'owner' : 'user',
    };

    const json = JSON.stringify(completeUser);

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO ukg_users (id, username, contact, data, created_at)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO UPDATE SET username = $2, contact = $3, data = $4`,
          [completeUser.id, completeUser.username, normalizedContact, json, completeUser.createdAt]
        );
        const local = this.readJsonFile(this.usersFilePath).filter((u) => u.id !== completeUser.id && String(u.contact).toLowerCase() !== normalizedContact);
        local.push(completeUser);
        this.writeJsonFileAtomically(this.usersFilePath, local);
        return completeUser;
      } catch (err) {
        console.error('[UKG DB] PostgreSQL saveUser error:', err);
        throw err;
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        await this.mysqlPool.query(
          `INSERT INTO ukg_users (id, username, contact, data, created_at)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE username = VALUES(username), contact = VALUES(contact), data = VALUES(data)`,
          [completeUser.id, completeUser.username, normalizedContact, json, completeUser.createdAt]
        );
        const local = this.readJsonFile(this.usersFilePath).filter((u) => u.id !== completeUser.id && String(u.contact).toLowerCase() !== normalizedContact);
        local.push(completeUser);
        this.writeJsonFileAtomically(this.usersFilePath, local);
        return completeUser;
      } catch (err) {
        console.error('[UKG DB] MySQL saveUser error:', err);
        throw err;
      }
    }

    const users = this.readJsonFile(this.usersFilePath);
    const idx = users.findIndex((u) => u.id === completeUser.id || String(u.contact || '').toLowerCase() === normalizedContact);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...completeUser };
    } else {
      users.push(completeUser);
    }
    this.writeJsonFileAtomically(this.usersFilePath, users);
    return completeUser;
  }

  public async deleteUser(idOrContact: string): Promise<boolean> {
    if (!this.initialized) await this.initialize();
    const target = idOrContact.trim().toLowerCase();

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        await this.pgPool.query('DELETE FROM ukg_users WHERE id = $1 OR contact = $1', [target]);
      } catch (err) {
        console.error('[UKG DB] PostgreSQL deleteUser error:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        await this.mysqlPool.query('DELETE FROM ukg_users WHERE id = ? OR contact = ?', [target, target]);
      } catch (err) {
        console.error('[UKG DB] MySQL deleteUser error:', err);
      }
    }

    const users = this.readJsonFile(this.usersFilePath).filter((u) => u.id !== target && String(u.contact || '').toLowerCase() !== target);
    this.writeJsonFileAtomically(this.usersFilePath, users);
    return true;
  }

  public async syncUsers(incomingUsers: any[]): Promise<number> {
    if (!this.initialized) await this.initialize();

    const current = await this.getAllUsers();
    const existingContacts = new Set(current.map((u) => String(u.contact || (u as any).email || '').trim().toLowerCase()));
    let added = 0;

    for (const u of incomingUsers) {
      if (!u || !u.contact) continue;
      const contact = String(u.contact).trim().toLowerCase();
      if (!existingContacts.has(contact)) {
        await this.saveUser(u);
        existingContacts.add(contact);
        added++;
      }
    }
    return added;
  }

  // ==========================================
  // SESSIONS (HttpOnly Cookie Auth)
  // ==========================================

  public async createSession(sessionId: string, userId: string, expiresAt: number): Promise<void> {
    if (!this.initialized) await this.initialize();
    const createdAt = new Date().toISOString();

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO ukg_sessions (session_id, user_id, created_at, expires_at)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (session_id) DO UPDATE SET expires_at = $4`,
          [sessionId, userId, createdAt, expiresAt]
        );
        return;
      } catch (err) {
        console.error('[UKG DB] PostgreSQL createSession error:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        await this.mysqlPool.query(
          `INSERT INTO ukg_sessions (session_id, user_id, created_at, expires_at)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE expires_at = VALUES(expires_at)`,
          [sessionId, userId, createdAt, expiresAt]
        );
        return;
      } catch (err) {
        console.error('[UKG DB] MySQL createSession error:', err);
      }
    }

    const sessions = this.readJsonFile(this.sessionsFilePath).filter((s) => s.sessionId !== sessionId);
    sessions.push({ sessionId, userId, createdAt, expiresAt });
    this.writeJsonFileAtomically(this.sessionsFilePath, sessions);
  }

  public async findSession(sessionId: string): Promise<DbSession | null> {
    if (!this.initialized) await this.initialize();

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        const res = await this.pgPool.query('SELECT session_id, user_id, created_at, expires_at FROM ukg_sessions WHERE session_id = $1', [sessionId]);
        if (res.rows.length > 0) {
          const r = res.rows[0];
          return { sessionId: r.session_id, userId: r.user_id, createdAt: r.created_at, expiresAt: Number(r.expires_at) };
        }
        return null;
      } catch (err) {
        console.error('[UKG DB] PostgreSQL findSession error:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        const [rows]: any = await this.mysqlPool.query('SELECT session_id, user_id, created_at, expires_at FROM ukg_sessions WHERE session_id = ?', [sessionId]);
        if (rows.length > 0) {
          const r = rows[0];
          return { sessionId: r.session_id, userId: r.user_id, createdAt: r.created_at, expiresAt: Number(r.expires_at) };
        }
        return null;
      } catch (err) {
        console.error('[UKG DB] MySQL findSession error:', err);
      }
    }

    const sessions = this.readJsonFile(this.sessionsFilePath);
    const found = sessions.find((s) => s.sessionId === sessionId);
    return found ? { sessionId: found.sessionId, userId: found.userId, createdAt: found.createdAt, expiresAt: Number(found.expiresAt) } : null;
  }

  public async deleteSession(sessionId: string): Promise<void> {
    if (!this.initialized) await this.initialize();

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        await this.pgPool.query('DELETE FROM ukg_sessions WHERE session_id = $1', [sessionId]);
        return;
      } catch (err) {
        console.error('[UKG DB] PostgreSQL deleteSession error:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        await this.mysqlPool.query('DELETE FROM ukg_sessions WHERE session_id = ?', [sessionId]);
        return;
      } catch (err) {
        console.error('[UKG DB] MySQL deleteSession error:', err);
      }
    }

    const sessions = this.readJsonFile(this.sessionsFilePath).filter((s) => s.sessionId !== sessionId);
    this.writeJsonFileAtomically(this.sessionsFilePath, sessions);
  }

  public async deleteUserSessions(userId: string): Promise<void> {
    if (!this.initialized) await this.initialize();

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        await this.pgPool.query('DELETE FROM ukg_sessions WHERE user_id = $1', [userId]);
        return;
      } catch (err) {
        console.error('[UKG DB] PostgreSQL deleteUserSessions error:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        await this.mysqlPool.query('DELETE FROM ukg_sessions WHERE user_id = ?', [userId]);
        return;
      } catch (err) {
        console.error('[UKG DB] MySQL deleteUserSessions error:', err);
      }
    }

    const sessions = this.readJsonFile(this.sessionsFilePath).filter((s) => s.userId !== userId);
    this.writeJsonFileAtomically(this.sessionsFilePath, sessions);
  }

  // ==========================================
  // PASSWORD RESETS
  // ==========================================

  public async savePasswordResetToken(tokenHash: string, userId: string, email: string, expiresAt: number): Promise<void> {
    if (!this.initialized) await this.initialize();

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO ukg_password_resets (token_hash, user_id, email, expires_at, used)
           VALUES ($1, $2, $3, $4, 0)
           ON CONFLICT (token_hash) DO UPDATE SET expires_at = $4, used = 0`,
          [tokenHash, userId, email.trim().toLowerCase(), expiresAt]
        );
        return;
      } catch (err) {
        console.error('[UKG DB] PostgreSQL savePasswordResetToken error:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        await this.mysqlPool.query(
          `INSERT INTO ukg_password_resets (token_hash, user_id, email, expires_at, used)
           VALUES (?, ?, ?, ?, 0)
           ON DUPLICATE KEY UPDATE expires_at = VALUES(expires_at), used = 0`,
          [tokenHash, userId, email.trim().toLowerCase(), expiresAt]
        );
        return;
      } catch (err) {
        console.error('[UKG DB] MySQL savePasswordResetToken error:', err);
      }
    }

    const resets = this.readJsonFile(this.resetsFilePath).filter((r) => r.tokenHash !== tokenHash);
    resets.push({ tokenHash, userId, email: email.trim().toLowerCase(), expiresAt, used: false });
    this.writeJsonFileAtomically(this.resetsFilePath, resets);
  }

  public async findPasswordResetToken(tokenHash: string): Promise<DbPasswordReset | null> {
    if (!this.initialized) await this.initialize();

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        const res = await this.pgPool.query('SELECT token_hash, user_id, email, expires_at, used FROM ukg_password_resets WHERE token_hash = $1', [tokenHash]);
        if (res.rows.length > 0) {
          const r = res.rows[0];
          return { tokenHash: r.token_hash, userId: r.user_id, email: r.email, expiresAt: Number(r.expires_at), used: Boolean(r.used) };
        }
        return null;
      } catch (err) {
        console.error('[UKG DB] PostgreSQL findPasswordResetToken error:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        const [rows]: any = await this.mysqlPool.query('SELECT token_hash, user_id, email, expires_at, used FROM ukg_password_resets WHERE token_hash = ?', [tokenHash]);
        if (rows.length > 0) {
          const r = rows[0];
          return { tokenHash: r.token_hash, userId: r.user_id, email: r.email, expiresAt: Number(r.expires_at), used: Boolean(r.used) };
        }
        return null;
      } catch (err) {
        console.error('[UKG DB] MySQL findPasswordResetToken error:', err);
      }
    }

    const resets = this.readJsonFile(this.resetsFilePath);
    const found = resets.find((r) => r.tokenHash === tokenHash);
    return found ? { tokenHash: found.tokenHash, userId: found.userId, email: found.email, expiresAt: Number(found.expiresAt), used: Boolean(found.used) } : null;
  }

  public async markPasswordResetTokenUsed(tokenHash: string): Promise<void> {
    if (!this.initialized) await this.initialize();

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        await this.pgPool.query('UPDATE ukg_password_resets SET used = 1 WHERE token_hash = $1', [tokenHash]);
        return;
      } catch (err) {
        console.error('[UKG DB] PostgreSQL markPasswordResetTokenUsed error:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        await this.mysqlPool.query('UPDATE ukg_password_resets SET used = 1 WHERE token_hash = ?', [tokenHash]);
        return;
      } catch (err) {
        console.error('[UKG DB] MySQL markPasswordResetTokenUsed error:', err);
      }
    }

    const resets = this.readJsonFile(this.resetsFilePath);
    const idx = resets.findIndex((r) => r.tokenHash === tokenHash);
    if (idx >= 0) {
      resets[idx].used = true;
      this.writeJsonFileAtomically(this.resetsFilePath, resets);
    }
  }

  // =================================================================
  // OTP (ONE-TIME-PASSWORD) STORAGE & VERIFICATION
  // =================================================================

  public async saveOtp(contact: string, codeHash: string, expiresAt: number): Promise<void> {
    if (!this.initialized) await this.initialize();
    const normalizedContact = contact.trim().toLowerCase();

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO ukg_otps (contact, code_hash, expires_at, attempts)
           VALUES ($1, $2, $3, 0)
           ON CONFLICT (contact)
           DO UPDATE SET code_hash = EXCLUDED.code_hash, expires_at = EXCLUDED.expires_at, attempts = 0`,
          [normalizedContact, codeHash, expiresAt]
        );
        return;
      } catch (err) {
        console.error('[UKG DB] PostgreSQL saveOtp error:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        await this.mysqlPool.query(
          `INSERT INTO ukg_otps (contact, code_hash, expires_at, attempts)
           VALUES (?, ?, ?, 0)
           ON DUPLICATE KEY UPDATE code_hash = VALUES(code_hash), expires_at = VALUES(expires_at), attempts = 0`,
          [normalizedContact, codeHash, expiresAt]
        );
        return;
      } catch (err) {
        console.error('[UKG DB] MySQL saveOtp error:', err);
      }
    }

    const otps: DbOtp[] = this.readJsonFile(this.otpsFilePath).filter((o: any) => o.contact !== normalizedContact);
    otps.push({ contact: normalizedContact, codeHash, expiresAt, attempts: 0 });
    this.writeJsonFileAtomically(this.otpsFilePath, otps);
  }

  public async verifyAndConsumeOtp(contact: string, rawCode: string): Promise<{ success: boolean; error?: string }> {
    if (!this.initialized) await this.initialize();
    const normalizedContact = contact.trim().toLowerCase();
    const code = rawCode.trim();

    if (!code || code.length < 4 || code.length > 10) {
      return { success: false, error: 'Invalid verification code format.' };
    }

    const providedHash = crypto.createHash('sha256').update(code).digest('hex');

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        const res = await this.pgPool.query(
          'SELECT contact, code_hash, expires_at, attempts FROM ukg_otps WHERE contact = $1',
          [normalizedContact]
        );
        if (res.rows.length === 0) {
          return { success: false, error: 'No active verification code found. Please request a new code.' };
        }
        const record = res.rows[0];
        if (Number(record.expires_at) < Date.now()) {
          await this.pgPool.query('DELETE FROM ukg_otps WHERE contact = $1', [normalizedContact]);
          return { success: false, error: 'Verification code has expired. Please request a new code.' };
        }
        if (record.attempts >= 5) {
          await this.pgPool.query('DELETE FROM ukg_otps WHERE contact = $1', [normalizedContact]);
          return { success: false, error: 'Too many failed verification attempts. Please request a new code.' };
        }

        const expectedBuffer = Buffer.from(record.code_hash, 'utf8');
        const providedBuffer = Buffer.from(providedHash, 'utf8');
        const isMatch = expectedBuffer.length === providedBuffer.length && crypto.timingSafeEqual(expectedBuffer, providedBuffer);

        if (!isMatch) {
          await this.pgPool.query('UPDATE ukg_otps SET attempts = attempts + 1 WHERE contact = $1', [normalizedContact]);
          return { success: false, error: 'Incorrect verification code. Please check and try again.' };
        }

        // Successfully verified, consume immediately
        await this.pgPool.query('DELETE FROM ukg_otps WHERE contact = $1', [normalizedContact]);
        return { success: true };
      } catch (err) {
        console.error('[UKG DB] PostgreSQL verifyAndConsumeOtp error:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        const [rows]: any = await this.mysqlPool.query(
          'SELECT contact, code_hash, expires_at, attempts FROM ukg_otps WHERE contact = ?',
          [normalizedContact]
        );
        if (!rows || rows.length === 0) {
          return { success: false, error: 'No active verification code found. Please request a new code.' };
        }
        const record = rows[0];
        if (Number(record.expires_at) < Date.now()) {
          await this.mysqlPool.query('DELETE FROM ukg_otps WHERE contact = ?', [normalizedContact]);
          return { success: false, error: 'Verification code has expired. Please request a new code.' };
        }
        if (record.attempts >= 5) {
          await this.mysqlPool.query('DELETE FROM ukg_otps WHERE contact = ?', [normalizedContact]);
          return { success: false, error: 'Too many failed verification attempts. Please request a new code.' };
        }

        const expectedBuffer = Buffer.from(record.code_hash, 'utf8');
        const providedBuffer = Buffer.from(providedHash, 'utf8');
        const isMatch = expectedBuffer.length === providedBuffer.length && crypto.timingSafeEqual(expectedBuffer, providedBuffer);

        if (!isMatch) {
          await this.mysqlPool.query('UPDATE ukg_otps SET attempts = attempts + 1 WHERE contact = ?', [normalizedContact]);
          return { success: false, error: 'Incorrect verification code. Please check and try again.' };
        }

        // Successfully verified, consume immediately
        await this.mysqlPool.query('DELETE FROM ukg_otps WHERE contact = ?', [normalizedContact]);
        return { success: true };
      } catch (err) {
        console.error('[UKG DB] MySQL verifyAndConsumeOtp error:', err);
      }
    }

    const otps: DbOtp[] = this.readJsonFile(this.otpsFilePath);
    const idx = otps.findIndex((o) => o.contact === normalizedContact);
    if (idx === -1) {
      return { success: false, error: 'No active verification code found. Please request a new code.' };
    }
    const record = otps[idx];
    if (record.expiresAt < Date.now()) {
      otps.splice(idx, 1);
      this.writeJsonFileAtomically(this.otpsFilePath, otps);
      return { success: false, error: 'Verification code has expired. Please request a new code.' };
    }
    if (record.attempts >= 5) {
      otps.splice(idx, 1);
      this.writeJsonFileAtomically(this.otpsFilePath, otps);
      return { success: false, error: 'Too many failed verification attempts. Please request a new code.' };
    }

    const expectedBuffer = Buffer.from(record.codeHash, 'utf8');
    const providedBuffer = Buffer.from(providedHash, 'utf8');
    const isMatch = expectedBuffer.length === providedBuffer.length && crypto.timingSafeEqual(expectedBuffer, providedBuffer);

    if (!isMatch) {
      record.attempts = (record.attempts || 0) + 1;
      this.writeJsonFileAtomically(this.otpsFilePath, otps);
      return { success: false, error: 'Incorrect verification code. Please check and try again.' };
    }

    otps.splice(idx, 1);
    this.writeJsonFileAtomically(this.otpsFilePath, otps);
    return { success: true };
  }

  // =================================================================
  // USER FAVORITES / SAVED PROPERTIES
  // =================================================================

  public async getUserFavorites(userId: string): Promise<string[]> {
    if (!this.initialized) await this.initialize();
    if (!userId) return [];

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        const res = await this.pgPool.query(
          'SELECT property_id FROM ukg_favorites WHERE user_id = $1 ORDER BY created_at DESC',
          [userId]
        );
        return res.rows.map((r) => r.property_id);
      } catch (err) {
        console.error('[UKG DB] PostgreSQL getUserFavorites error:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        const [rows]: any = await this.mysqlPool.query(
          'SELECT property_id FROM ukg_favorites WHERE user_id = ? ORDER BY created_at DESC',
          [userId]
        );
        return rows.map((r: any) => r.property_id);
      } catch (err) {
        console.error('[UKG DB] MySQL getUserFavorites error:', err);
      }
    }

    const all = this.readJsonFile(this.favoritesFilePath);
    return all.filter((f) => f.userId === userId).map((f) => f.propertyId);
  }

  public async addUserFavorite(userId: string, propertyId: string): Promise<boolean> {
    if (!this.initialized) await this.initialize();
    if (!userId || !propertyId) return false;
    const now = new Date().toISOString();

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO ukg_favorites (user_id, property_id, created_at)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, property_id) DO NOTHING`,
          [userId, propertyId, now]
        );
        return true;
      } catch (err) {
        console.error('[UKG DB] PostgreSQL addUserFavorite error:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        await this.mysqlPool.query(
          `INSERT IGNORE INTO ukg_favorites (user_id, property_id, created_at)
           VALUES (?, ?, ?)`,
          [userId, propertyId, now]
        );
        return true;
      } catch (err) {
        console.error('[UKG DB] MySQL addUserFavorite error:', err);
      }
    }

    const all = this.readJsonFile(this.favoritesFilePath);
    if (!all.some((f) => f.userId === userId && f.propertyId === propertyId)) {
      all.push({ userId, propertyId, createdAt: now });
      this.writeJsonFileAtomically(this.favoritesFilePath, all);
    }
    return true;
  }

  public async removeUserFavorite(userId: string, propertyId: string): Promise<boolean> {
    if (!this.initialized) await this.initialize();
    if (!userId || !propertyId) return false;

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        await this.pgPool.query(
          'DELETE FROM ukg_favorites WHERE user_id = $1 AND property_id = $2',
          [userId, propertyId]
        );
        return true;
      } catch (err) {
        console.error('[UKG DB] PostgreSQL removeUserFavorite error:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        await this.mysqlPool.query(
          'DELETE FROM ukg_favorites WHERE user_id = ? AND property_id = ?',
          [userId, propertyId]
        );
        return true;
      } catch (err) {
        console.error('[UKG DB] MySQL removeUserFavorite error:', err);
      }
    }

    const all = this.readJsonFile(this.favoritesFilePath).filter(
      (f) => !(f.userId === userId && f.propertyId === propertyId)
    );
    this.writeJsonFileAtomically(this.favoritesFilePath, all);
    return true;
  }

  // =================================================================
  // INQUIRIES & CHAT THREADS
  // =================================================================

  public async getUserInquiries(userId: string, contact?: string): Promise<DbInquiryThread[]> {
    if (!this.initialized) await this.initialize();
    const normalizedContact = (contact || '').trim().toLowerCase();

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        const res = await this.pgPool.query(
          `SELECT data FROM ukg_inquiries
           WHERE buyer_id = $1 OR seller_id = $1
              OR ($2 <> '' AND (buyer_contact = $2 OR seller_contact = $2))
           ORDER BY updated_at DESC`,
          [userId, normalizedContact]
        );
        return res.rows.map((r) => (typeof r.data === 'string' ? JSON.parse(r.data) : r.data));
      } catch (err) {
        console.error('[UKG DB] PostgreSQL getUserInquiries error:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        const [rows]: any = await this.mysqlPool.query(
          `SELECT data FROM ukg_inquiries
           WHERE buyer_id = ? OR seller_id = ?
              OR (? <> '' AND (buyer_contact = ? OR seller_contact = ?))
           ORDER BY updated_at DESC`,
          [userId, userId, normalizedContact, normalizedContact, normalizedContact]
        );
        return rows.map((r: any) => (typeof r.data === 'string' ? JSON.parse(r.data) : r.data));
      } catch (err) {
        console.error('[UKG DB] MySQL getUserInquiries error:', err);
      }
    }

    const all: DbInquiryThread[] = this.readJsonFile(this.inquiriesFilePath);
    return all.filter((t) => {
      const matchBuyer = t.buyerId === userId || (normalizedContact && (t.buyerContact || '').toLowerCase() === normalizedContact);
      const matchSeller = t.sellerId === userId || (normalizedContact && (t.sellerContact || '').toLowerCase() === normalizedContact);
      return matchBuyer || matchSeller;
    });
  }

  public async getInquiryById(threadId: string): Promise<DbInquiryThread | null> {
    if (!this.initialized) await this.initialize();

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        const res = await this.pgPool.query('SELECT data FROM ukg_inquiries WHERE id = $1', [threadId]);
        if (res.rows.length > 0) {
          const r = res.rows[0];
          return typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
        }
        return null;
      } catch (err) {
        console.error('[UKG DB] PostgreSQL getInquiryById error:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        const [rows]: any = await this.mysqlPool.query('SELECT data FROM ukg_inquiries WHERE id = ?', [threadId]);
        if (rows.length > 0) {
          const r = rows[0];
          return typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
        }
        return null;
      } catch (err) {
        console.error('[UKG DB] MySQL getInquiryById error:', err);
      }
    }

    const all: DbInquiryThread[] = this.readJsonFile(this.inquiriesFilePath);
    return all.find((t) => t.id === threadId) || null;
  }

  public async saveInquiry(thread: DbInquiryThread): Promise<DbInquiryThread> {
    if (!this.initialized) await this.initialize();

    const now = new Date().toISOString();
    thread.updatedAt = now;
    if (!thread.createdAt) thread.createdAt = now;
    const json = JSON.stringify(thread);

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO ukg_inquiries (id, property_id, buyer_id, buyer_contact, seller_id, seller_contact, data, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO UPDATE SET
             data = $7,
             updated_at = $8`,
          [
            thread.id,
            thread.propertyId,
            thread.buyerId || '',
            (thread.buyerContact || '').trim().toLowerCase(),
            thread.sellerId || '',
            (thread.sellerContact || '').trim().toLowerCase(),
            json,
            now
          ]
        );
      } catch (err) {
        console.error('[UKG DB] PostgreSQL saveInquiry error:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        await this.mysqlPool.query(
          `INSERT INTO ukg_inquiries (id, property_id, buyer_id, buyer_contact, seller_id, seller_contact, data, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = VALUES(updated_at)`,
          [
            thread.id,
            thread.propertyId,
            thread.buyerId || '',
            (thread.buyerContact || '').trim().toLowerCase(),
            thread.sellerId || '',
            (thread.sellerContact || '').trim().toLowerCase(),
            json,
            now
          ]
        );
      } catch (err) {
        console.error('[UKG DB] MySQL saveInquiry error:', err);
      }
    }

    const all = this.readJsonFile(this.inquiriesFilePath);
    const idx = all.findIndex((t: DbInquiryThread) => t.id === thread.id);
    if (idx >= 0) {
      all[idx] = thread;
    } else {
      all.unshift(thread);
    }
    this.writeJsonFileAtomically(this.inquiriesFilePath, all);
    return thread;
  }

  public async addMessageToInquiry(threadId: string, message: DbInquiryMessage): Promise<DbInquiryThread | null> {
    const thread = await this.getInquiryById(threadId);
    if (!thread) return null;

    if (!Array.isArray(thread.messages)) {
      thread.messages = [];
    }

    if (!message.createdAt) message.createdAt = new Date().toISOString();
    thread.messages.push(message);
    thread.lastMessage = message.text;
    thread.lastMessageTime = message.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (message.sender === 'buyer') {
      thread.unreadCount = (thread.unreadCount || 0) + 1;
    }

    return await this.saveInquiry(thread);
  }

  public async markInquiryRead(threadId: string): Promise<void> {
    const thread = await this.getInquiryById(threadId);
    if (!thread) return;
    thread.unreadCount = 0;
    await this.saveInquiry(thread);
  }

  // =================================================================
  // LISTING ABUSE REPORTS
  // =================================================================

  public async createReport(report: Omit<DbReport, 'id' | 'createdAt' | 'status'> & Partial<DbReport>): Promise<DbReport> {
    if (!this.initialized) await this.initialize();

    const fullReport: DbReport = {
      id: report.id || `report-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      propertyId: report.propertyId,
      propertyTitle: report.propertyTitle || 'Listing',
      userId: report.userId || undefined,
      userContact: (report.userContact || '').trim().toLowerCase() || undefined,
      reason: report.reason,
      details: report.details || '',
      status: report.status || 'pending',
      createdAt: report.createdAt || new Date().toISOString(),
    };

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO ukg_reports (id, property_id, property_title, user_id, user_contact, reason, details, status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            fullReport.id,
            fullReport.propertyId,
            fullReport.propertyTitle,
            fullReport.userId || null,
            fullReport.userContact || null,
            fullReport.reason,
            fullReport.details,
            fullReport.status,
            fullReport.createdAt,
          ]
        );
      } catch (err) {
        console.error('[UKG DB] PostgreSQL createReport error:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        await this.mysqlPool.query(
          `INSERT INTO ukg_reports (id, property_id, property_title, user_id, user_contact, reason, details, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            fullReport.id,
            fullReport.propertyId,
            fullReport.propertyTitle,
            fullReport.userId || null,
            fullReport.userContact || null,
            fullReport.reason,
            fullReport.details,
            fullReport.status,
            fullReport.createdAt,
          ]
        );
      } catch (err) {
        console.error('[UKG DB] MySQL createReport error:', err);
      }
    }

    const all = this.readJsonFile(this.reportsFilePath);
    all.unshift(fullReport);
    this.writeJsonFileAtomically(this.reportsFilePath, all);
    return fullReport;
  }

  public async getAllReports(): Promise<DbReport[]> {
    if (!this.initialized) await this.initialize();

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        const res = await this.pgPool.query('SELECT * FROM ukg_reports ORDER BY created_at DESC');
        return res.rows.map((r) => ({
          id: r.id,
          propertyId: r.property_id,
          propertyTitle: r.property_title,
          userId: r.user_id,
          userContact: r.user_contact,
          reason: r.reason,
          details: r.details,
          status: r.status,
          createdAt: r.created_at,
        }));
      } catch (err) {
        console.error('[UKG DB] PostgreSQL getAllReports error:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        const [rows]: any = await this.mysqlPool.query('SELECT * FROM ukg_reports ORDER BY created_at DESC');
        return rows.map((r: any) => ({
          id: r.id,
          propertyId: r.property_id,
          propertyTitle: r.property_title,
          userId: r.user_id,
          userContact: r.user_contact,
          reason: r.reason,
          details: r.details,
          status: r.status,
          createdAt: r.created_at,
        }));
      } catch (err) {
        console.error('[UKG DB] MySQL getAllReports error:', err);
      }
    }

    return this.readJsonFile(this.reportsFilePath);
  }

  public async deleteReport(id: string): Promise<boolean> {
    if (!this.initialized) await this.initialize();

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        await this.pgPool.query('DELETE FROM ukg_reports WHERE id = $1', [id]);
      } catch (err) {
        console.error('[UKG DB] PostgreSQL deleteReport error:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        await this.mysqlPool.query('DELETE FROM ukg_reports WHERE id = ?', [id]);
      } catch (err) {
        console.error('[UKG DB] MySQL deleteReport error:', err);
      }
    }

    const all = this.readJsonFile(this.reportsFilePath).filter((r: DbReport) => r.id !== id);
    this.writeJsonFileAtomically(this.reportsFilePath, all);
    return true;
  }

  public async updateReportStatus(id: string, status: 'pending' | 'reviewed' | 'dismissed'): Promise<boolean> {
    if (!this.initialized) await this.initialize();

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        await this.pgPool.query('UPDATE ukg_reports SET status = $1 WHERE id = $2', [status, id]);
      } catch (err) {
        console.error('[UKG DB] PostgreSQL updateReportStatus error:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        await this.mysqlPool.query('UPDATE ukg_reports SET status = ? WHERE id = ?', [status, id]);
      } catch (err) {
        console.error('[UKG DB] MySQL updateReportStatus error:', err);
      }
    }

    const all = this.readJsonFile(this.reportsFilePath);
    const target = all.find((r: DbReport) => r.id === id);
    if (target) {
      target.status = status;
      this.writeJsonFileAtomically(this.reportsFilePath, all);
      return true;
    }
    return false;
  }

  // =================================================================
  // LEADS & INQUIRY SUBMISSIONS
  // =================================================================

  public async createLead(lead: Omit<DbLead, 'id' | 'createdAt'> & Partial<DbLead>): Promise<DbLead> {
    if (!this.initialized) await this.initialize();

    const fullLead: DbLead = {
      id: lead.id || `lead-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      name: lead.name,
      phone: lead.phone,
      email: (lead.email || '').trim().toLowerCase() || undefined,
      city: lead.city || '',
      loanAmount: lead.loanAmount || '',
      propertyId: lead.propertyId || undefined,
      type: lead.type || 'general',
      message: lead.message || '',
      createdAt: lead.createdAt || new Date().toISOString(),
    };

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO ukg_leads (id, name, phone, email, city, loan_amount, property_id, type, message, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            fullLead.id,
            fullLead.name,
            fullLead.phone,
            fullLead.email || null,
            fullLead.city || null,
            fullLead.loanAmount || null,
            fullLead.propertyId || null,
            fullLead.type,
            fullLead.message,
            fullLead.createdAt,
          ]
        );
      } catch (err) {
        console.error('[UKG DB] PostgreSQL createLead error:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        await this.mysqlPool.query(
          `INSERT INTO ukg_leads (id, name, phone, email, city, loan_amount, property_id, type, message, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            fullLead.id,
            fullLead.name,
            fullLead.phone,
            fullLead.email || null,
            fullLead.city || null,
            fullLead.loanAmount || null,
            fullLead.propertyId || null,
            fullLead.type,
            fullLead.message,
            fullLead.createdAt,
          ]
        );
      } catch (err) {
        console.error('[UKG DB] MySQL createLead error:', err);
      }
    }

    const all = this.readJsonFile(this.leadsFilePath);
    all.unshift(fullLead);
    this.writeJsonFileAtomically(this.leadsFilePath, all);
    return fullLead;
  }

  public async getAllLeads(): Promise<DbLead[]> {
    if (!this.initialized) await this.initialize();

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        const res = await this.pgPool.query('SELECT * FROM ukg_leads ORDER BY created_at DESC');
        return res.rows.map((r) => ({
          id: r.id,
          name: r.name,
          phone: r.phone,
          email: r.email,
          city: r.city,
          loanAmount: r.loan_amount,
          propertyId: r.property_id,
          type: r.type,
          message: r.message,
          createdAt: r.created_at,
        }));
      } catch (err) {
        console.error('[UKG DB] PostgreSQL getAllLeads error:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        const [rows]: any = await this.mysqlPool.query('SELECT * FROM ukg_leads ORDER BY created_at DESC');
        return rows.map((r: any) => ({
          id: r.id,
          name: r.name,
          phone: r.phone,
          email: r.email,
          city: r.city,
          loanAmount: r.loan_amount,
          propertyId: r.property_id,
          type: r.type,
          message: r.message,
          createdAt: r.created_at,
        }));
      } catch (err) {
        console.error('[UKG DB] MySQL getAllLeads error:', err);
      }
    }

    return this.readJsonFile(this.leadsFilePath);
  }

  // =================================================================
  // USER PROFILE & ACCOUNT PURGE
  // =================================================================

  public async updateUserProfile(userId: string, updates: { username?: string; avatar?: string }): Promise<DbUser | null> {
    if (!this.initialized) await this.initialize();

    const user = await this.findUserById(userId);
    if (!user) return null;

    if (updates.username && updates.username.trim().length >= 2) {
      user.username = updates.username.trim();
    }
    if (updates.avatar !== undefined) {
      user.avatar = updates.avatar;
    }
    user.updatedAt = new Date().toISOString();

    return await this.saveUser(user);
  }

  public async deleteUserAccountAndData(userId: string): Promise<boolean> {
    if (!this.initialized) await this.initialize();

    const user = await this.findUserById(userId);
    const userContact = (user?.contact || '').trim().toLowerCase();

    // 1. Delete all sessions
    await this.deleteUserSessions(userId);

    // 2. Delete favorites
    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        await this.pgPool.query('DELETE FROM ukg_favorites WHERE user_id = $1', [userId]);
      } catch {}
    } else if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        await this.mysqlPool.query('DELETE FROM ukg_favorites WHERE user_id = ?', [userId]);
      } catch {}
    }
    const favs = this.readJsonFile(this.favoritesFilePath).filter((f: any) => f.userId !== userId);
    this.writeJsonFileAtomically(this.favoritesFilePath, favs);

    // 3. Delete user's properties
    const props = await this.getAllProperties();
    for (const p of props) {
      const matchOwner = p.ownerId === userId || (userContact && String(p.ownerContact || p.sellerEmail || '').toLowerCase() === userContact);
      if (matchOwner) {
        await this.deleteProperty(p.id);
      }
    }

    // 4. Delete user record
    await this.deleteUser(userId);
    return true;
  }
}

export const db = new DatabaseService();
