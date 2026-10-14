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
  contact: string;
  data: string; // JSON string of full StoredUserAccount object
  created_at?: string;
}

export type DbType = 'mysql' | 'postgres' | 'file';

class DatabaseService {
  private dbType: DbType = 'file';
  private mysqlPool: mysql.Pool | null = null;
  private pgPool: PgPool | null = null;
  private initialized: boolean = false;
  private inMemoryProperties: any[] = [];
  private inMemoryUsers: any[] = [];

  private dataDir: string;
  private propertiesFilePath: string;
  private usersFilePath: string;

  constructor() {
    this.dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
    this.propertiesFilePath = process.env.DATABASE_PATH || path.join(this.dataDir, 'properties.json');
    this.usersFilePath = path.join(this.dataDir, 'users.json');

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

        // Test connection
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
              username VARCHAR(255),
              contact VARCHAR(255) UNIQUE,
              data TEXT NOT NULL,
              created_at VARCHAR(100)
            );
          `);

          console.log('[UKG DB] PostgreSQL schema ready.');
          this.dbType = 'postgres';
          this.initialized = true;

          // Check if properties need seeding from local file
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
              username VARCHAR(255),
              contact VARCHAR(255) UNIQUE,
              data LONGTEXT NOT NULL,
              created_at VARCHAR(100)
            );
          `);

          console.log('[UKG DB] MySQL schema ready.');
          this.dbType = 'mysql';
          this.initialized = true;

          // Check if properties need seeding from local file
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
    this.loadPropertiesFromDisk();
    this.loadUsersFromDisk();
    this.initialized = true;
  }

  public getDatabaseType(): DbType {
    return this.dbType;
  }

  // --- Seed initial listings into SQL database so no existing properties are lost ---
  private async seedFromDiskToPg(client: any): Promise<void> {
    const local = this.readPropertiesFile();
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
    const local = this.readPropertiesFile();
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

  // --- Local Disk Read & Atomic Write Helpers ---
  private readPropertiesFile(): any[] {
    try {
      if (fs.existsSync(this.propertiesFilePath)) {
        const content = fs.readFileSync(this.propertiesFilePath, 'utf-8');
        if (content.trim()) {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) return parsed;
        }
      }
    } catch (err) {
      console.error('[UKG DB] Failed to read properties file:', err);
    }
    return [];
  }

  private writePropertiesFile(props: any[]): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      const tmpFile = `${this.propertiesFilePath}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, JSON.stringify(props, null, 2), 'utf-8');
      fs.renameSync(tmpFile, this.propertiesFilePath);
    } catch (err) {
      console.error('[UKG DB] Failed to write properties file atomically:', err);
    }
  }

  private readUsersFile(): any[] {
    try {
      if (fs.existsSync(this.usersFilePath)) {
        const content = fs.readFileSync(this.usersFilePath, 'utf-8');
        if (content.trim()) {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) return parsed;
        }
      }
    } catch (err) {
      console.error('[UKG DB] Failed to read users file:', err);
    }
    return [];
  }

  private writeUsersFile(users: any[]): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      const tmpFile = `${this.usersFilePath}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, JSON.stringify(users, null, 2), 'utf-8');
      fs.renameSync(tmpFile, this.usersFilePath);
    } catch (err) {
      console.error('[UKG DB] Failed to write users file atomically:', err);
    }
  }

  private loadPropertiesFromDisk(): any[] {
    this.inMemoryProperties = this.readPropertiesFile();
    return this.inMemoryProperties;
  }

  private loadUsersFromDisk(): any[] {
    this.inMemoryUsers = this.readUsersFile();
    return this.inMemoryUsers;
  }

  // ==========================================
  // PUBLIC PROPERTIES CRUD METHODS
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

    // File storage fallback
    return this.readPropertiesFile();
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

    const all = this.readPropertiesFile();
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
        // Also keep local disk mirror updated
        const local = this.readPropertiesFile().filter((p) => p.id !== property.id);
        local.unshift(property);
        this.writePropertiesFile(local);
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
        // Also keep local disk mirror updated
        const local = this.readPropertiesFile().filter((p) => p.id !== property.id);
        local.unshift(property);
        this.writePropertiesFile(local);
        return property;
      } catch (err) {
        console.error('[UKG DB] MySQL saveProperty error:', err);
        throw err;
      }
    }

    // File storage save
    const list = this.readPropertiesFile();
    const idx = list.findIndex((p) => p.id === property.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...property };
    } else {
      list.unshift(property);
    }
    this.writePropertiesFile(list);
    return property;
  }

  public async updateProperty(id: string, updates: any): Promise<any | null> {
    if (!this.initialized) await this.initialize();

    const existing = await this.getPropertyById(id);
    if (!existing) {
      return null;
    }

    const merged: Record<string, any> = {
      ...existing,
      ...updates,
      id,
      createdAt: existing.createdAt || updates.createdAt || new Date().toISOString(),
    };

    // Remove keys explicitly cleared with null
    for (const key of Object.keys(merged)) {
      if (merged[key] === null) {
        delete merged[key];
      }
    }

    await this.saveProperty(merged);
    return merged;
  }

  public async deleteProperty(id: string): Promise<boolean> {
    if (!this.initialized) await this.initialize();

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        await this.pgPool.query('DELETE FROM ukg_properties WHERE id = $1', [id]);
        const local = this.readPropertiesFile().filter((p) => p.id !== id);
        this.writePropertiesFile(local);
        return true;
      } catch (err) {
        console.error('[UKG DB] PostgreSQL deleteProperty error:', err);
        throw err;
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        await this.mysqlPool.query('DELETE FROM ukg_properties WHERE id = ?', [id]);
        const local = this.readPropertiesFile().filter((p) => p.id !== id);
        this.writePropertiesFile(local);
        return true;
      } catch (err) {
        console.error('[UKG DB] MySQL deleteProperty error:', err);
        throw err;
      }
    }

    const list = this.readPropertiesFile().filter((p) => p.id !== id);
    this.writePropertiesFile(list);
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

    this.writePropertiesFile([]);
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
  // PUBLIC USERS CRUD METHODS
  // ==========================================

  public async getAllUsers(): Promise<any[]> {
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

    return this.readUsersFile();
  }

  public async saveUser(user: any): Promise<any> {
    if (!this.initialized) await this.initialize();

    const json = JSON.stringify(user);
    const contact = String(user.contact || user.email || '').trim().toLowerCase();

    if (this.dbType === 'postgres' && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO ukg_users (id, username, contact, data, created_at)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO UPDATE SET username = $2, contact = $3, data = $4`,
          [user.id, user.username, contact, json, user.createdAt || new Date().toISOString()]
        );
        const local = this.readUsersFile().filter((u) => u.id !== user.id && String(u.contact).toLowerCase() !== contact);
        local.push(user);
        this.writeUsersFile(local);
        return user;
      } catch (err) {
        console.error('[UKG DB] PostgreSQL saveUser error:', err);
      }
    }

    if (this.dbType === 'mysql' && this.mysqlPool) {
      try {
        await this.mysqlPool.query(
          `INSERT INTO ukg_users (id, username, contact, data, created_at)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE username = VALUES(username), contact = VALUES(contact), data = VALUES(data)`,
          [user.id, user.username, contact, json, user.createdAt || new Date().toISOString()]
        );
        const local = this.readUsersFile().filter((u) => u.id !== user.id && String(u.contact).toLowerCase() !== contact);
        local.push(user);
        this.writeUsersFile(local);
        return user;
      } catch (err) {
        console.error('[UKG DB] MySQL saveUser error:', err);
      }
    }

    const users = this.readUsersFile();
    const idx = users.findIndex((u) => u.id === user.id || String(u.contact || '').toLowerCase() === contact);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...user };
    } else {
      users.push(user);
    }
    this.writeUsersFile(users);
    return user;
  }

  public async syncUsers(incomingUsers: any[]): Promise<number> {
    if (!this.initialized) await this.initialize();

    const current = await this.getAllUsers();
    const existingContacts = new Set(current.map((u) => String(u.contact || u.email || '').trim().toLowerCase()));
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
}

export const db = new DatabaseService();
