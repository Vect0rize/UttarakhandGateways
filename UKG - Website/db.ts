import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { Pool as PgPool } from 'pg';

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
  phone?: string;
  notes?: string;
  isOwner?: boolean;
  isSuspended?: boolean;
  suspendedAt?: string;
  suspendedReason?: string;
  usernameChangeTimestamps?: number[];
  createdAt?: string;
  updatedAt?: string;
  data?: string;
}

export interface PlatformSettings {
  enabledCategories: string[];
  requireApprovalForNewListings: boolean;
  showFeaturedSection: boolean;
  featuredMode: 'manual_and_top' | 'manual_only';
  updatedAt?: string;
}

export interface DbReport {
  id: string;
  propertyId: string;
  propertyTitle?: string;
  reason: string;
  details?: string;
  reporterId?: string;
  reporterEmail?: string;
  status: 'open' | 'resolved' | 'dismissed';
  createdAt: string;
  updatedAt?: string;
}

export interface DbRequirement {
  id: string;
  requirementType: 'Buy' | 'Rent';
  propertyType: string;
  city: string;
  preferredLocation: string;
  minBudget: number;
  maxBudget: number;
  bedrooms?: number | null;
  requiredSize?: string | null;
  description?: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  isFulfilled: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface DbRequirementResponse {
  id: string;
  requirementId: string;
  responderId: string;
  responderName: string;
  responderEmail: string;
  responderPhone: string;
  propertyId?: string;
  propertyTitle?: string;
  message: string;
  createdAt: string;
}

export interface DbAuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  adminName: string;
  action: string;
  targetType: 'property' | 'user' | 'report' | 'settings' | 'bulk' | 'requirement';
  targetId: string;
  targetTitle?: string;
  details: string;
  createdAt: string;
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
  private reportsFilePath: string;
  private viewsFilePath: string;
  private settingsFilePath: string;
  private auditLogsFilePath: string;
  private requirementsFilePath: string;
  private requirementResponsesFilePath: string;
  private revokedSessionsFilePath: string;
  private revokedTokens = new Set<string>();
  private writeLocks = new Map<string, Promise<unknown>>();

  private async withLock<T>(key: string, fn: () => Promise<T> | T): Promise<T> {
    const prev = this.writeLocks.get(key) || Promise.resolve();
    let release!: () => void;
    const next = new Promise<void>((resolve) => {
      release = resolve;
    });
    const chain = prev.then(() => next);
    this.writeLocks.set(key, chain);
    await prev;
    try {
      return await fn();
    } finally {
      release();
      if (this.writeLocks.get(key) === chain) {
        this.writeLocks.delete(key);
      }
    }
  }

  constructor() {
    const possibleDataDirs = [
      process.env.DATA_DIR,
      path.join(process.cwd(), 'data'),
      path.resolve(__dirname, '..', 'data'),
      path.resolve(__dirname, 'data')
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
    this.reportsFilePath = path.join(this.dataDir, 'reports.json');
    this.viewsFilePath = path.join(this.dataDir, 'property_views.json');
    this.settingsFilePath = path.join(this.dataDir, 'platform_settings.json');
    this.auditLogsFilePath = path.join(this.dataDir, 'admin_audit_logs.json');
    this.requirementsFilePath = path.join(this.dataDir, 'requirements.json');
    this.requirementResponsesFilePath = path.join(this.dataDir, 'requirement_responses.json');
    this.revokedSessionsFilePath = path.join(this.dataDir, 'revoked_sessions.json');
    try {
      const revokedList = this.readJsonFile(this.revokedSessionsFilePath);
      const now = Date.now();
      for (const item of revokedList) {
        if (item && typeof item.sessionId === 'string' && (!item.expiresAt || Number(item.expiresAt) >= now)) {
          this.revokedTokens.add(item.sessionId);
        }
      }
    } catch {}

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
            CREATE TABLE IF NOT EXISTS ukg_reports (
              id VARCHAR(255) PRIMARY KEY,
              property_id VARCHAR(255) NOT NULL,
              status VARCHAR(50) DEFAULT 'open',
              data TEXT NOT NULL,
              created_at VARCHAR(100)
            );
          `);

          await client.query(`
            CREATE TABLE IF NOT EXISTS ukg_property_views (
              view_key VARCHAR(255) PRIMARY KEY,
              property_id VARCHAR(255) NOT NULL,
              created_at BIGINT NOT NULL
            );
          `);

          await client.query(`
            CREATE TABLE IF NOT EXISTS ukg_settings (
              id VARCHAR(100) PRIMARY KEY,
              data TEXT NOT NULL,
              updated_at VARCHAR(100)
            );
          `);

          await client.query(`
            CREATE TABLE IF NOT EXISTS ukg_audit_logs (
              id VARCHAR(255) PRIMARY KEY,
              admin_id VARCHAR(255) NOT NULL,
              action VARCHAR(150) NOT NULL,
              target_type VARCHAR(50) NOT NULL,
              target_id VARCHAR(255) NOT NULL,
              data TEXT NOT NULL,
              created_at VARCHAR(100) NOT NULL
            );
          `);

          await client.query(`
            CREATE TABLE IF NOT EXISTS ukg_requirements (
              id VARCHAR(255) PRIMARY KEY,
              user_id VARCHAR(255) NOT NULL,
              status VARCHAR(50) NOT NULL,
              data TEXT NOT NULL,
              created_at VARCHAR(100) NOT NULL
            );
          `);

          await client.query(`
            CREATE TABLE IF NOT EXISTS ukg_requirement_responses (
              id VARCHAR(255) PRIMARY KEY,
              requirement_id VARCHAR(255) NOT NULL,
              responder_id VARCHAR(255) NOT NULL,
              data TEXT NOT NULL,
              created_at VARCHAR(100) NOT NULL
            );
          `);

          console.log('[UKG DB] PostgreSQL schema ready.');
          this.dbType = 'postgres';
          this.initialized = true;

          // Automatically purge all synthetic / fake demo properties & demo accounts
          try {
            const purgeRes = await client.query(`
              DELETE FROM ukg_properties
              WHERE id LIKE 'user-prop-2026-%'
                 OR id LIKE 'prop-seed-%'
                 OR id LIKE 'prop-sale-%'
                 OR id LIKE 'prop-rent-%'
                 OR id LIKE 'fake-%'
                 OR id LIKE 'seed-%'
            `);
            if (purgeRes.rowCount && purgeRes.rowCount > 0) {
              console.log(`[UKG DB] Purged ${purgeRes.rowCount} synthetic/fake properties from PostgreSQL.`);
            }
            await client.query(`
              DELETE FROM ukg_users
              WHERE id IN ('user-fake-catalog-500', 'user-sunil-joshi-2026')
                 OR contact IN ('fakeproperties@uttarakhandgateways.com', 'sunil.joshi.uk@gmail.com')
            `);
          } catch (purgeErr) {
            console.warn('[UKG DB] PostgreSQL fake property purge warning:', purgeErr);
          }

          const countRes = await client.query('SELECT COUNT(*) FROM ukg_properties');
          const count = parseInt(countRes.rows[0].count, 10);
          if (count === 0) {
            await this.seedFromDiskToPg(client);
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
            CREATE TABLE IF NOT EXISTS ukg_reports (
              id VARCHAR(255) PRIMARY KEY,
              property_id VARCHAR(255) NOT NULL,
              status VARCHAR(50) DEFAULT 'open',
              data LONGTEXT NOT NULL,
              created_at VARCHAR(100)
            );
          `);

          await conn.query(`
            CREATE TABLE IF NOT EXISTS ukg_property_views (
              view_key VARCHAR(255) PRIMARY KEY,
              property_id VARCHAR(255) NOT NULL,
              created_at BIGINT NOT NULL
            );
          `);

          await conn.query(`
            CREATE TABLE IF NOT EXISTS ukg_settings (
              id VARCHAR(100) PRIMARY KEY,
              data LONGTEXT NOT NULL,
              updated_at VARCHAR(100)
            );
          `);

          await conn.query(`
            CREATE TABLE IF NOT EXISTS ukg_audit_logs (
              id VARCHAR(255) PRIMARY KEY,
              admin_id VARCHAR(255) NOT NULL,
              action VARCHAR(150) NOT NULL,
              target_type VARCHAR(50) NOT NULL,
              target_id VARCHAR(255) NOT NULL,
              data LONGTEXT NOT NULL,
              created_at VARCHAR(100) NOT NULL
            );
          `);

          await conn.query(`
            CREATE TABLE IF NOT EXISTS ukg_requirements (
              id VARCHAR(255) PRIMARY KEY,
              user_id VARCHAR(255) NOT NULL,
              status VARCHAR(50) NOT NULL,
              data LONGTEXT NOT NULL,
              created_at VARCHAR(100) NOT NULL
            );
          `);

          await conn.query(`
            CREATE TABLE IF NOT EXISTS ukg_requirement_responses (
              id VARCHAR(255) PRIMARY KEY,
              requirement_id VARCHAR(255) NOT NULL,
              responder_id VARCHAR(255) NOT NULL,
              data LONGTEXT NOT NULL,
              created_at VARCHAR(100) NOT NULL
            );
          `);

          console.log('[UKG DB] MySQL schema ready.');
          this.dbType = 'mysql';
          this.initialized = true;

          // Automatically purge all synthetic / fake demo properties & demo accounts
          try {
            const [purgeRes]: any = await conn.query(`
              DELETE FROM ukg_properties
              WHERE id LIKE 'user-prop-2026-%'
                 OR id LIKE 'prop-seed-%'
                 OR id LIKE 'prop-sale-%'
                 OR id LIKE 'prop-rent-%'
                 OR id LIKE 'fake-%'
                 OR id LIKE 'seed-%'
            `);
            if (purgeRes?.affectedRows > 0) {
              console.log(`[UKG DB] Purged ${purgeRes.affectedRows} synthetic/fake properties from MySQL.`);
            }
            await conn.query(`
              DELETE FROM ukg_users
              WHERE id IN ('user-fake-catalog-500', 'user-sunil-joshi-2026')
                 OR contact IN ('fakeproperties@uttarakhandgateways.com', 'sunil.joshi.uk@gmail.com')
            `);
          } catch (purgeErr) {
            console.warn('[UKG DB] MySQL fake property purge warning:', purgeErr);
          }

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

    // Ensure any synthetic/fake properties are stripped from file storage
    if (fs.existsSync(this.propertiesFilePath)) {
      try {
        const existing = this.readJsonFile(this.propertiesFilePath);
        const filtered = existing.filter((p) => !this.isFakePropertyRecord(p));
        if (filtered.length !== existing.length) {
          console.log(`[UKG DB] Purged ${existing.length - filtered.length} synthetic/fake properties from file storage.`);
          this.writeJsonFileAtomically(this.propertiesFilePath, filtered);
        }
      } catch {}
    } else {
      this.writeJsonFileAtomically(this.propertiesFilePath, []);
    }
  }

  public isFakePropertyRecord(p: any): boolean {
    if (!p || typeof p !== 'object') return true;
    const id = String(p.id || '');
    const ownerId = String(p.ownerId || '');
    const ownerContact = String(p.ownerContact || p.sellerEmail || '').toLowerCase();
    const sellerName = String(p.sellerName || '').toLowerCase();
    const ownerUsername = String(p.ownerUsername || '').toLowerCase();

    return (
      id.startsWith('user-prop-2026-') ||
      id.startsWith('prop-seed-') ||
      id.startsWith('prop-sale-') ||
      id.startsWith('prop-rent-') ||
      id.startsWith('fake-') ||
      id.startsWith('seed-') ||
      p.isFake === true ||
      p.is_fake === true ||
      p.isSeed === true ||
      ownerId === 'user-fake-catalog-500' ||
      ownerId === 'user-1794208094775-78b03b00' ||
      ownerId === 'user-sunil-joshi-2026' ||
      ownerContact === 'fakeproperties@uttarakhandgateways.com' ||
      ownerContact === 'sunil.joshi.uk@gmail.com' ||
      sellerName === 'ukg demo listings' ||
      sellerName === 'sunil joshi' ||
      ownerUsername === 'sunil joshi'
    );
  }

  public getDatabaseType(): DbType {
    return this.dbType;
  }

  // --- Seeding Helpers ---
  private async seedFromDiskToPg(client: any): Promise<void> {
    const local = this.readJsonFile(this.propertiesFilePath).filter((p) => !this.isFakePropertyRecord(p));
    if (local.length === 0) return;
    console.log(`[UKG DB] Seeding ${local.length} genuine properties to PostgreSQL...`);
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

  private async seedFromDiskToMysql(conn: any): Promise<void> {
    const local = this.readJsonFile(this.propertiesFilePath).filter((p) => !this.isFakePropertyRecord(p));
    if (local.length === 0) return;
    console.log(`[UKG DB] Seeding ${local.length} genuine properties to MySQL...`);
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

  public async getAllProperties(): Promise<any[]> {
    if (!this.initialized) await this.initialize();

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        const res = await this.pgPool.query('SELECT data FROM ukg_properties ORDER BY created_at DESC');
        return res.rows
          .map((r) => (typeof r.data === 'string' ? JSON.parse(r.data) : r.data))
          .filter((p) => !this.isFakePropertyRecord(p));
      } catch (err) {
        console.error('[UKG DB] Error fetching properties from PostgreSQL:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        const [rows]: any = await this.mysqlPool.query('SELECT data FROM ukg_properties ORDER BY created_at DESC');
        return rows
          .map((r: any) => (typeof r.data === 'string' ? JSON.parse(r.data) : r.data))
          .filter((p: any) => !this.isFakePropertyRecord(p));
      } catch (err) {
        console.error('[UKG DB] Error fetching properties from MySQL:', err);
      }
    }

    return this.readJsonFile(this.propertiesFilePath).filter((p) => !this.isFakePropertyRecord(p));
  }

  public async getPropertyById(id: string): Promise<any | null> {
    if (!this.initialized) await this.initialize();
    if (this.isFakePropertyRecord({ id })) return null;

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        const res = await this.pgPool.query('SELECT data FROM ukg_properties WHERE id = $1', [id]);
        if (res.rows.length > 0) {
          const r = res.rows[0];
          const parsed = typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
          return this.isFakePropertyRecord(parsed) ? null : parsed;
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
          const parsed = typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
          return this.isFakePropertyRecord(parsed) ? null : parsed;
        }
        return null;
      } catch (err) {
        console.error('[UKG DB] Error fetching property by id from MySQL:', err);
      }
    }

    const all = this.readJsonFile(this.propertiesFilePath);
    const found = all.find((p) => p.id === id) || null;
    return found && !this.isFakePropertyRecord(found) ? found : null;
  }

  public async saveProperty(property: any): Promise<any> {
    if (!this.initialized) await this.initialize();
    return this.withLock('properties', () => this.savePropertyUnlocked(property, true));
  }

  private async savePropertyUnlocked(property: any, touchUpdatedAt: boolean = true): Promise<any> {
    const now = new Date().toISOString();
    if (!property.createdAt) {
      property.createdAt = now;
    }
    if (touchUpdatedAt || !property.updatedAt) {
      property.updatedAt = now;
    }
    const json = JSON.stringify(property);

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO ukg_properties (id, title, category, type, city, price, data, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO UPDATE SET
             title = $2,
             category = $3,
             type = $4,
             city = $5,
             price = $6,
             data = $7,
             updated_at = $9`,
          [property.id, property.title, property.category || '', property.type || '', property.city || '', property.price || 0, json, property.createdAt, now]
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

  public async updateProperty(id: string, updates: any, touchUpdatedAt: boolean = true): Promise<any | null> {
    if (!this.initialized) await this.initialize();
    return this.withLock('properties', () => this.updatePropertyUnlocked(id, updates, touchUpdatedAt));
  }

  private async updatePropertyUnlocked(id: string, updates: any, touchUpdatedAt: boolean = true): Promise<any | null> {
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

    await this.savePropertyUnlocked(merged, touchUpdatedAt);
    return merged;
  }

  public async incrementPropertyMetric(id: string, metric: 'views' | 'shares' | 'inquiries'): Promise<any | null> {
    if (!this.initialized) await this.initialize();
    return this.withLock('properties', async () => {
      const existing = await this.getPropertyById(id);
      if (!existing) return null;
      const current = typeof existing[metric] === 'number' ? existing[metric] : 0;
      const nextVal = current + 1;
      return await this.updatePropertyUnlocked(id, { [metric]: nextVal }, false);
    });
  }

  public async recordUniquePropertyView(
    propertyId: string,
    viewerFingerprint: string,
    windowMs: number = 6 * 60 * 60 * 1000
  ): Promise<{ counted: boolean; views: number } | null> {
    if (!this.initialized) await this.initialize();
    return this.withLock('properties', async () => {
      const existing = await this.getPropertyById(propertyId);
      if (!existing) return null;

      const currentViews = Math.max(0, Math.floor(Number(existing.views) || 0));
      const now = Date.now();
      const viewKey = crypto.createHash('sha256').update(`${propertyId}:${viewerFingerprint}`).digest('hex');

      if (this.dbType === 'postgres' && this.pgPool) {
        try {
          const checkRes = await this.pgPool.query(
            'SELECT created_at FROM ukg_property_views WHERE view_key = $1',
            [viewKey]
          );
          if (checkRes.rows.length > 0 && now - Number(checkRes.rows[0].created_at) < windowMs) {
            return { counted: false, views: currentViews };
          }
          await this.pgPool.query(
            `INSERT INTO ukg_property_views (view_key, property_id, created_at)
             VALUES ($1, $2, $3)
             ON CONFLICT (view_key) DO UPDATE SET created_at = $3`,
            [viewKey, propertyId, now]
          );
        } catch (err) {
          console.error('[UKG DB] PostgreSQL recordUniquePropertyView error:', err);
        }
      } else if (this.dbType === 'mysql' && this.mysqlPool) {
        try {
          const [rows]: any = await this.mysqlPool.query(
            'SELECT created_at FROM ukg_property_views WHERE view_key = ?',
            [viewKey]
          );
          if (rows && rows.length > 0 && now - Number(rows[0].created_at) < windowMs) {
            return { counted: false, views: currentViews };
          }
          await this.mysqlPool.query(
            `INSERT INTO ukg_property_views (view_key, property_id, created_at)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE created_at = VALUES(created_at)`,
            [viewKey, propertyId, now]
          );
        } catch (err) {
          console.error('[UKG DB] MySQL recordUniquePropertyView error:', err);
        }
      } else {
        const records = this.readJsonFile(this.viewsFilePath);
        const found = records.find((r: any) => r && r.viewKey === viewKey);
        if (found && now - Number(found.createdAt) < windowMs) {
          return { counted: false, views: currentViews };
        }
        const retentionCutoff = now - Math.max(windowMs * 4, 48 * 60 * 60 * 1000);
        const pruned = records.filter(
          (r: any) => r && r.viewKey && r.viewKey !== viewKey && Number(r.createdAt) >= retentionCutoff
        );
        pruned.push({ viewKey, propertyId, createdAt: now });
        this.writeJsonFileAtomically(this.viewsFilePath, pruned);
      }

      const nextViews = currentViews + 1;
      await this.updatePropertyUnlocked(propertyId, { views: nextViews }, false);
      return { counted: true, views: nextViews };
    });
  }

  public async deleteProperty(id: string): Promise<boolean> {
    if (!this.initialized) await this.initialize();
    return this.withLock('properties', async () => {
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
    });
  }

  public async deletePropertiesByOwner(userId: string, contact: string): Promise<number> {
    if (!this.initialized) await this.initialize();
    const normContact = String(contact || '').trim().toLowerCase();
    return this.withLock('properties', async () => {
      const all = await this.getAllProperties();
      const toDelete = all.filter((p) => {
        const pOwnerId = String(p.ownerId || '');
        const pContact = String(p.ownerContact || p.sellerEmail || '').trim().toLowerCase();
        return (userId && pOwnerId === userId) || (normContact && pContact === normContact);
      });
      if (toDelete.length === 0) return 0;
      const deleteIds = new Set(toDelete.map((p) => p.id));
      if (this.dbType === 'postgres' && this.pgPool) {
        for (const id of deleteIds) {
          await this.pgPool.query('DELETE FROM ukg_properties WHERE id = $1', [id]);
        }
      } else if (this.dbType === 'mysql' && this.mysqlPool) {
        for (const id of deleteIds) {
          await this.mysqlPool.query('DELETE FROM ukg_properties WHERE id = ?', [id]);
        }
      }
      const remaining = this.readJsonFile(this.propertiesFilePath).filter((p) => !deleteIds.has(p.id));
      this.writeJsonFileAtomically(this.propertiesFilePath, remaining);
      return deleteIds.size;
    });
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

    return this.withLock('users', async () => {
      const normalizedContact = (user.contact || (user as any).email || '').trim().toLowerCase();
      const adminEmail = (process.env.ADMIN_EMAIL || 'amit1986.delhi@gmail.com').trim().toLowerCase();
      // Strict email-based owner check only — never derive admin privileges from display username
      const isAdminEmail = normalizedContact === adminEmail;
      const completeUser: DbUser = {
        ...user,
        contact: normalizedContact,
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isOwner: isAdminEmail,
        role: isAdminEmail ? 'owner' : (user.role === 'admin' ? 'admin' : 'user'),
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
    });
  }

  public async deleteUser(idOrContact: string): Promise<boolean> {
    if (!this.initialized) await this.initialize();
    const target = idOrContact.trim().toLowerCase();

    return this.withLock('users', async () => {
      if (this.dbType === 'postgres' && this.pgPool) {
        try {
          await this.pgPool.query('DELETE FROM ukg_users WHERE LOWER(id) = $1 OR LOWER(contact) = $1', [target]);
        } catch (err) {
          console.error('[UKG DB] PostgreSQL deleteUser error:', err);
        }
      }

      if (this.dbType === 'mysql' && this.mysqlPool) {
        try {
          await this.mysqlPool.query('DELETE FROM ukg_users WHERE LOWER(id) = ? OR LOWER(contact) = ?', [target, target]);
        } catch (err) {
          console.error('[UKG DB] MySQL deleteUser error:', err);
        }
      }

      const users = this.readJsonFile(this.usersFilePath).filter((u) => String(u.id || '').toLowerCase() !== target && String(u.contact || '').toLowerCase() !== target);
      this.writeJsonFileAtomically(this.usersFilePath, users);
      return true;
    });
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

  public async revokeSession(sessionId: string): Promise<void> {
    if (!sessionId) return;
    this.revokedTokens.add(sessionId);
    await this.withLock('revoked_sessions', () => {
      const now = Date.now();
      const expiresAt = now + 31 * 24 * 60 * 60 * 1000;
      const existing = this.readJsonFile(this.revokedSessionsFilePath).filter(
        (r) => r && r.sessionId && r.sessionId !== sessionId && (!r.expiresAt || Number(r.expiresAt) >= now)
      );
      existing.push({ sessionId, revokedAt: new Date().toISOString(), expiresAt });
      this.writeJsonFileAtomically(this.revokedSessionsFilePath, existing);
    });
  }

  public isSessionRevoked(sessionId: string): boolean {
    return this.revokedTokens.has(sessionId);
  }

  public async deleteSession(sessionId: string): Promise<void> {
    if (!this.initialized) await this.initialize();
    await this.revokeSession(sessionId);

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

    const jsonSessions = this.readJsonFile(this.sessionsFilePath).filter((s) => s.userId === userId);
    for (const s of jsonSessions) {
      if (s.sessionId) await this.revokeSession(s.sessionId);
    }

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        const res = await this.pgPool.query('SELECT session_id FROM ukg_sessions WHERE user_id = $1', [userId]);
        for (const r of res.rows || []) {
          if (r.session_id) await this.revokeSession(r.session_id);
        }
        await this.pgPool.query('DELETE FROM ukg_sessions WHERE user_id = $1', [userId]);
        return;
      } catch (err) {
        console.error('[UKG DB] PostgreSQL deleteUserSessions error:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        const [rows]: any = await this.mysqlPool.query('SELECT session_id FROM ukg_sessions WHERE user_id = ?', [userId]);
        for (const r of rows || []) {
          if (r.session_id) await this.revokeSession(r.session_id);
        }
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
  // LISTING REPORTS STORAGE & MODERATION
  // =================================================================

  public async getAllReports(): Promise<DbReport[]> {
    if (!this.initialized) await this.initialize();

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        const res = await this.pgPool.query('SELECT data FROM ukg_reports ORDER BY created_at DESC');
        return res.rows.map((r) => (typeof r.data === 'string' ? JSON.parse(r.data) : r.data));
      } catch (err) {
        console.error('[UKG DB] PostgreSQL getAllReports error:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        const [rows]: any = await this.mysqlPool.query('SELECT data FROM ukg_reports ORDER BY created_at DESC');
        return rows.map((r: any) => (typeof r.data === 'string' ? JSON.parse(r.data) : r.data));
      } catch (err) {
        console.error('[UKG DB] MySQL getAllReports error:', err);
      }
    }

    return this.readJsonFile(this.reportsFilePath);
  }

  public async saveReport(report: DbReport): Promise<DbReport> {
    if (!this.initialized) await this.initialize();
    return this.withLock('reports', async () => {
      const json = JSON.stringify(report);
      if (this.dbType === 'postgres' && this.pgPool) {
        await this.pgPool.query(
          `INSERT INTO ukg_reports (id, property_id, status, data, created_at)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO UPDATE SET status = $3, data = $4`,
          [report.id, report.propertyId, report.status, json, report.createdAt]
        );
      } else if (this.dbType === 'mysql' && this.mysqlPool) {
        await this.mysqlPool.query(
          `INSERT INTO ukg_reports (id, property_id, status, data, created_at)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE status = VALUES(status), data = VALUES(data)`,
          [report.id, report.propertyId, report.status, json, report.createdAt]
        );
      }
      const reports = this.readJsonFile(this.reportsFilePath).filter((r: any) => r.id !== report.id);
      reports.unshift(report);
      this.writeJsonFileAtomically(this.reportsFilePath, reports);
      return report;
    });
  }

  public async updateReportStatus(id: string, status: 'open' | 'resolved' | 'dismissed'): Promise<DbReport | null> {
    if (!this.initialized) await this.initialize();
    return this.withLock('reports', async () => {
      const all = await this.getAllReports();
      const target = all.find((r) => r.id === id);
      if (!target) return null;
      const updated: DbReport = { ...target, status, updatedAt: new Date().toISOString() };
      const json = JSON.stringify(updated);
      if (this.dbType === 'postgres' && this.pgPool) {
        await this.pgPool.query('UPDATE ukg_reports SET status = $2, data = $3 WHERE id = $1', [id, status, json]);
      } else if (this.dbType === 'mysql' && this.mysqlPool) {
        await this.mysqlPool.query('UPDATE ukg_reports SET status = ?, data = ? WHERE id = ?', [status, json, id]);
      }
      const list = this.readJsonFile(this.reportsFilePath).map((r: any) => (r.id === id ? updated : r));
      this.writeJsonFileAtomically(this.reportsFilePath, list);
      return updated;
    });
  }

  public async deleteReport(id: string): Promise<boolean> {
    if (!this.initialized) await this.initialize();
    return this.withLock('reports', async () => {
      if (this.dbType === 'postgres' && this.pgPool) {
        try {
          await this.pgPool.query('DELETE FROM ukg_reports WHERE id = $1', [id]);
        } catch (err) {
          console.error('[UKG DB] PostgreSQL deleteReport error:', err);
        }
      } else if (this.dbType === 'mysql' && this.mysqlPool) {
        try {
          await this.mysqlPool.query('DELETE FROM ukg_reports WHERE id = ?', [id]);
        } catch (err) {
          console.error('[UKG DB] MySQL deleteReport error:', err);
        }
      }
      const list = this.readJsonFile(this.reportsFilePath).filter((r: any) => r.id !== id);
      this.writeJsonFileAtomically(this.reportsFilePath, list);
      return true;
    });
  }

  // =================================================================
  // PLATFORM SETTINGS & VISIBILITY CONTROLS
  // =================================================================

  private getDefaultPlatformSettings(): PlatformSettings {
    return {
      enabledCategories: ['Residential', 'Commercial', 'Agriculture'],
      requireApprovalForNewListings: false,
      showFeaturedSection: true,
      featuredMode: 'manual_and_top',
      updatedAt: new Date().toISOString(),
    };
  }

  public async getPlatformSettings(): Promise<PlatformSettings> {
    if (!this.initialized) await this.initialize();
    const defaults = this.getDefaultPlatformSettings();

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        const res = await this.pgPool.query('SELECT data FROM ukg_settings WHERE id = $1', ['platform']);
        if (res.rows.length > 0) {
          const parsed = typeof res.rows[0].data === 'string' ? JSON.parse(res.rows[0].data) : res.rows[0].data;
          return { ...defaults, ...parsed };
        }
      } catch {}
    } else if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        const [rows]: any = await this.mysqlPool.query('SELECT data FROM ukg_settings WHERE id = ?', ['platform']);
        if (rows && rows.length > 0) {
          const parsed = typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data;
          return { ...defaults, ...parsed };
        }
      } catch {}
    }

    const list = this.readJsonFile(this.settingsFilePath);
    if (list.length > 0 && list[0] && typeof list[0] === 'object') {
      return { ...defaults, ...list[0] };
    }
    return defaults;
  }

  public async savePlatformSettings(updates: Partial<PlatformSettings>): Promise<PlatformSettings> {
    if (!this.initialized) await this.initialize();
    return this.withLock('settings', async () => {
      const current = await this.getPlatformSettings();
      const allowedCategories = ['Residential', 'Commercial', 'Agriculture'];
      const enabledCategories = Array.isArray(updates.enabledCategories)
        ? updates.enabledCategories.filter((c) => allowedCategories.includes(c))
        : current.enabledCategories;

      const merged: PlatformSettings = {
        ...current,
        enabledCategories: enabledCategories.length > 0 ? enabledCategories : allowedCategories,
        requireApprovalForNewListings:
          typeof updates.requireApprovalForNewListings === 'boolean'
            ? updates.requireApprovalForNewListings
            : current.requireApprovalForNewListings,
        showFeaturedSection:
          typeof updates.showFeaturedSection === 'boolean'
            ? updates.showFeaturedSection
            : current.showFeaturedSection,
        featuredMode:
          updates.featuredMode === 'manual_only' || updates.featuredMode === 'manual_and_top'
            ? updates.featuredMode
            : current.featuredMode,
        updatedAt: new Date().toISOString(),
      };

      const json = JSON.stringify(merged);
      if (this.dbType === 'postgres' && this.pgPool) {
        try {
          await this.pgPool.query(
            `INSERT INTO ukg_settings (id, data, updated_at)
             VALUES ($1, $2, $3)
             ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = $3`,
            ['platform', json, merged.updatedAt]
          );
        } catch (err) {
          console.error('[UKG DB] PostgreSQL savePlatformSettings error:', err);
        }
      } else if (this.dbType === 'mysql' && this.mysqlPool) {
        try {
          await this.mysqlPool.query(
            `INSERT INTO ukg_settings (id, data, updated_at)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = VALUES(updated_at)`,
            ['platform', json, merged.updatedAt]
          );
        } catch (err) {
          console.error('[UKG DB] MySQL savePlatformSettings error:', err);
        }
      }

      this.writeJsonFileAtomically(this.settingsFilePath, [merged]);
      return merged;
    });
  }

  // =================================================================
  // ADMINISTRATOR AUDIT TRAIL
  // =================================================================

  public async recordAuditLog(
    entry: Omit<DbAuditLog, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
  ): Promise<DbAuditLog> {
    if (!this.initialized) await this.initialize();
    return this.withLock('audit_logs', async () => {
      const record: DbAuditLog = {
        id: entry.id || `audit-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
        adminId: String(entry.adminId || 'admin'),
        adminEmail: String(entry.adminEmail || ''),
        adminName: String(entry.adminName || 'Administrator'),
        action: String(entry.action || 'ADMIN_ACTION'),
        targetType: entry.targetType || 'property',
        targetId: String(entry.targetId || ''),
        targetTitle: entry.targetTitle ? String(entry.targetTitle) : undefined,
        details: String(entry.details || ''),
        createdAt: entry.createdAt || new Date().toISOString(),
      };

      const json = JSON.stringify(record);
      if (this.dbType === 'postgres' && this.pgPool) {
        try {
          await this.pgPool.query(
            `INSERT INTO ukg_audit_logs (id, admin_id, action, target_type, target_id, data, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (id) DO UPDATE SET data = $6`,
            [record.id, record.adminId, record.action, record.targetType, record.targetId, json, record.createdAt]
          );
        } catch (err) {
          console.error('[UKG DB] PostgreSQL recordAuditLog error:', err);
        }
      } else if (this.dbType === 'mysql' && this.mysqlPool) {
        try {
          await this.mysqlPool.query(
            `INSERT INTO ukg_audit_logs (id, admin_id, action, target_type, target_id, data, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE data = VALUES(data)`,
            [record.id, record.adminId, record.action, record.targetType, record.targetId, json, record.createdAt]
          );
        } catch (err) {
          console.error('[UKG DB] MySQL recordAuditLog error:', err);
        }
      }

      const existing = this.readJsonFile(this.auditLogsFilePath);
      const nextList = [record, ...existing.filter((x: any) => x && x.id !== record.id)].slice(0, 1000);
      this.writeJsonFileAtomically(this.auditLogsFilePath, nextList);
      return record;
    });
  }

  public async getAuditLogs(limit: number = 250): Promise<DbAuditLog[]> {
    if (!this.initialized) await this.initialize();
    const safeLimit = Math.max(1, Math.min(1000, Math.floor(Number(limit) || 250)));

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        const res = await this.pgPool.query(
          'SELECT data FROM ukg_audit_logs ORDER BY created_at DESC LIMIT $1',
          [safeLimit]
        );
        return res.rows.map((r) => (typeof r.data === 'string' ? JSON.parse(r.data) : r.data));
      } catch (err) {
        console.error('[UKG DB] PostgreSQL getAuditLogs error:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        const [rows]: any = await this.mysqlPool.query(
          'SELECT data FROM ukg_audit_logs ORDER BY created_at DESC LIMIT ?',
          [safeLimit]
        );
        return rows.map((r: any) => (typeof r.data === 'string' ? JSON.parse(r.data) : r.data));
      } catch (err) {
        console.error('[UKG DB] MySQL getAuditLogs error:', err);
      }
    }

    return this.readJsonFile(this.auditLogsFilePath).slice(0, safeLimit);
  }

  // =================================================================
  // POST YOUR REQUIREMENTS & SECURE OWNER RESPONSES
  // =================================================================

  public async getAllRequirements(): Promise<DbRequirement[]> {
    if (!this.initialized) await this.initialize();
    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        const res = await this.pgPool.query('SELECT data FROM ukg_requirements ORDER BY created_at DESC');
        return res.rows.map((r) => (typeof r.data === 'string' ? JSON.parse(r.data) : r.data));
      } catch (err) {
        console.error('[UKG DB] PostgreSQL getAllRequirements error:', err);
      }
    }
    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        const [rows]: any = await this.mysqlPool.query('SELECT data FROM ukg_requirements ORDER BY created_at DESC');
        return rows.map((r: any) => (typeof r.data === 'string' ? JSON.parse(r.data) : r.data));
      } catch (err) {
        console.error('[UKG DB] MySQL getAllRequirements error:', err);
      }
    }
    return this.readJsonFile(this.requirementsFilePath);
  }

  public async getRequirementById(id: string): Promise<DbRequirement | null> {
    const all = await this.getAllRequirements();
    return all.find((r) => r && r.id === id) || null;
  }

  public async saveRequirement(reqRecord: DbRequirement): Promise<DbRequirement> {
    if (!this.initialized) await this.initialize();
    return this.withLock('requirements', async () => {
      const json = JSON.stringify(reqRecord);
      if (this.dbType === 'postgres' && this.pgPool) {
        try {
          await this.pgPool.query(
            `INSERT INTO ukg_requirements (id, user_id, status, data, created_at)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (id) DO UPDATE SET status = $3, data = $4`,
            [reqRecord.id, reqRecord.userId, reqRecord.approvalStatus, json, reqRecord.createdAt]
          );
        } catch (err) {
          console.error('[UKG DB] PostgreSQL saveRequirement error:', err);
        }
      } else if (this.dbType === 'mysql' && this.mysqlPool) {
        try {
          await this.mysqlPool.query(
            `INSERT INTO ukg_requirements (id, user_id, status, data, created_at)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE status = VALUES(status), data = VALUES(data)`,
            [reqRecord.id, reqRecord.userId, reqRecord.approvalStatus, json, reqRecord.createdAt]
          );
        } catch (err) {
          console.error('[UKG DB] MySQL saveRequirement error:', err);
        }
      }
      const existing = this.readJsonFile(this.requirementsFilePath).filter((r: any) => r && r.id !== reqRecord.id);
      const next = [reqRecord, ...existing].sort(
        (a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      this.writeJsonFileAtomically(this.requirementsFilePath, next);
      return reqRecord;
    });
  }

  public async deleteRequirement(id: string): Promise<boolean> {
    if (!this.initialized) await this.initialize();
    return this.withLock('requirements', async () => {
      if (this.dbType === 'postgres' && this.pgPool) {
        try {
          await this.pgPool.query('DELETE FROM ukg_requirements WHERE id = $1', [id]);
          await this.pgPool.query('DELETE FROM ukg_requirement_responses WHERE requirement_id = $1', [id]);
        } catch (err) {
          console.error('[UKG DB] PostgreSQL deleteRequirement error:', err);
        }
      } else if (this.dbType === 'mysql' && this.mysqlPool) {
        try {
          await this.mysqlPool.query('DELETE FROM ukg_requirements WHERE id = ?', [id]);
          await this.mysqlPool.query('DELETE FROM ukg_requirement_responses WHERE requirement_id = ?', [id]);
        } catch (err) {
          console.error('[UKG DB] MySQL deleteRequirement error:', err);
        }
      }
      const list = this.readJsonFile(this.requirementsFilePath).filter((r: any) => r && r.id !== id);
      this.writeJsonFileAtomically(this.requirementsFilePath, list);
      const responses = this.readJsonFile(this.requirementResponsesFilePath).filter(
        (resp: any) => resp && resp.requirementId !== id
      );
      this.writeJsonFileAtomically(this.requirementResponsesFilePath, responses);
      return true;
    });
  }

  public async getAllRequirementResponses(): Promise<DbRequirementResponse[]> {
    if (!this.initialized) await this.initialize();
    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        const res = await this.pgPool.query('SELECT data FROM ukg_requirement_responses ORDER BY created_at DESC');
        return res.rows.map((r) => (typeof r.data === 'string' ? JSON.parse(r.data) : r.data));
      } catch (err) {
        console.error('[UKG DB] PostgreSQL getAllRequirementResponses error:', err);
      }
    }
    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        const [rows]: any = await this.mysqlPool.query(
          'SELECT data FROM ukg_requirement_responses ORDER BY created_at DESC'
        );
        return rows.map((r: any) => (typeof r.data === 'string' ? JSON.parse(r.data) : r.data));
      } catch (err) {
        console.error('[UKG DB] MySQL getAllRequirementResponses error:', err);
      }
    }
    return this.readJsonFile(this.requirementResponsesFilePath);
  }

  public async saveRequirementResponse(resp: DbRequirementResponse): Promise<DbRequirementResponse> {
    if (!this.initialized) await this.initialize();
    return this.withLock('requirement_responses', async () => {
      const json = JSON.stringify(resp);
      if (this.dbType === 'postgres' && this.pgPool) {
        try {
          await this.pgPool.query(
            `INSERT INTO ukg_requirement_responses (id, requirement_id, responder_id, data, created_at)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (id) DO UPDATE SET data = $4`,
            [resp.id, resp.requirementId, resp.responderId, json, resp.createdAt]
          );
        } catch (err) {
          console.error('[UKG DB] PostgreSQL saveRequirementResponse error:', err);
        }
      } else if (this.dbType === 'mysql' && this.mysqlPool) {
        try {
          await this.mysqlPool.query(
            `INSERT INTO ukg_requirement_responses (id, requirement_id, responder_id, data, created_at)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE data = VALUES(data)`,
            [resp.id, resp.requirementId, resp.responderId, json, resp.createdAt]
          );
        } catch (err) {
          console.error('[UKG DB] MySQL saveRequirementResponse error:', err);
        }
      }
      const existing = this.readJsonFile(this.requirementResponsesFilePath).filter(
        (x: any) => x && x.id !== resp.id
      );
      this.writeJsonFileAtomically(this.requirementResponsesFilePath, [resp, ...existing]);
      return resp;
    });
  }
}

export const db = new DatabaseService();
