import fs from 'fs';
import path from 'path';
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

export type DbType = 'mysql' | 'postgres' | 'file';

class DatabaseService {
  private dbType: DbType = 'file';
  private mysqlPool: mysql.Pool | null = null;
  private pgPool: PgPool | null = null;
  private initialized: boolean = false;

  private dataDir: string;
  private propertiesFilePath: string;
  private usersFilePath: string;
  private sessionsFilePath: string;
  private resetsFilePath: string;

  constructor() {
    this.dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
    this.propertiesFilePath = process.env.DATABASE_PATH || path.join(this.dataDir, 'properties.json');
    this.usersFilePath = path.join(this.dataDir, 'users.json');
    this.sessionsFilePath = path.join(this.dataDir, 'sessions.json');
    this.resetsFilePath = path.join(this.dataDir, 'password_resets.json');

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

          console.log('[UKG DB] PostgreSQL schema ready.');
          this.dbType = 'postgres';
          this.initialized = true;

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
  }

  public getDatabaseType(): DbType {
    return this.dbType;
  }

  // --- Seeding Helpers ---
  private async seedFromDiskToPg(client: any): Promise<void> {
    const local = this.readJsonFile(this.propertiesFilePath);
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

  private async seedFromDiskToMysql(conn: any): Promise<void> {
    const local = this.readJsonFile(this.propertiesFilePath);
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

  public async getAllProperties(): Promise<any[]> {
    if (!this.initialized) await this.initialize();

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        const res = await this.pgPool.query('SELECT data FROM ukg_properties ORDER BY created_at DESC');
        return res.rows.map((r) => (typeof r.data === 'string' ? JSON.parse(r.data) : r.data));
      } catch (err) {
        console.error('[UKG DB] Error fetching properties from PostgreSQL:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        const [rows]: any = await this.mysqlPool.query('SELECT data FROM ukg_properties ORDER BY created_at DESC');
        return rows.map((r: any) => (typeof r.data === 'string' ? JSON.parse(r.data) : r.data));
      } catch (err) {
        console.error('[UKG DB] Error fetching properties from MySQL:', err);
      }
    }

    return this.readJsonFile(this.propertiesFilePath);
  }

  public async getPropertyById(id: string): Promise<any | null> {
    if (!this.initialized) await this.initialize();

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        const res = await this.pgPool.query('SELECT data FROM ukg_properties WHERE id = $1', [id]);
        if (res.rows.length > 0) {
          const r = res.rows[0];
          return typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
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
          return typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
        }
        return null;
      } catch (err) {
        console.error('[UKG DB] Error fetching property by id from MySQL:', err);
      }
    }

    const all = this.readJsonFile(this.propertiesFilePath);
    return all.find((p) => p.id === id) || null;
  }

  public async saveProperty(property: any): Promise<any> {
    if (!this.initialized) await this.initialize();

    if (!property.createdAt) {
      property.createdAt = new Date().toISOString();
    }
    const json = JSON.stringify(property);
    const now = new Date().toISOString();

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
      list[idx] = { ...list[idx], ...property };
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
    const completeUser: DbUser = {
      ...user,
      contact: normalizedContact,
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isOwner: user.isOwner || normalizedContact === 'amit1986.delhi@gmail.com' || user.username.trim().toLowerCase() === 'amit tyagi',
      role: (normalizedContact === 'amit1986.delhi@gmail.com' || user.username.trim().toLowerCase() === 'amit tyagi') ? 'owner' : (user.role || 'user'),
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
}

export const db = new DatabaseService();
