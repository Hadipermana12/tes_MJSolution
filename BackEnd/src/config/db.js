import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'MjSolution',
    };

export const pool = new Pool(poolConfig);

let isDbConnected = false;

// Auto-initialize tables
export const initDb = async () => {
  try {
    const client = await pool.connect();
    isDbConnected = true;
    console.log(`[Database] Terhubung ke PostgreSQL: ${poolConfig.database || 'MjSolution'}`);

    // Create extensions
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    `);

    // 1. Contents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS contents (
        id VARCHAR(50) PRIMARY KEY,
        judul VARCHAR(255) NOT NULL,
        tipe VARCHAR(50) NOT NULL CHECK (tipe IN ('image', 'video', 'url')),
        payload TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Playlists table
    await client.query(`
      CREATE TABLE IF NOT EXISTS playlists (
        id VARCHAR(50) PRIMARY KEY,
        nama VARCHAR(255) NOT NULL,
        deskripsi TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Playlist items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS playlist_items (
        id VARCHAR(50) PRIMARY KEY,
        playlist_id VARCHAR(50) REFERENCES playlists(id) ON DELETE CASCADE,
        content_id VARCHAR(50) REFERENCES contents(id) ON DELETE CASCADE,
        urutan INT DEFAULT 1,
        durasi_detik INT DEFAULT 10,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Devices table
    await client.query(`
      CREATE TABLE IF NOT EXISTS devices (
        id VARCHAR(50) PRIMARY KEY,
        nama VARCHAR(255) NOT NULL,
        lokasi VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'offline',
        last_seen TIMESTAMP NULL,
        active_content_id VARCHAR(50) REFERENCES contents(id) ON DELETE SET NULL,
        active_playlist_id VARCHAR(50) REFERENCES playlists(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE devices ADD COLUMN IF NOT EXISTS active_content_id VARCHAR(50) REFERENCES contents(id) ON DELETE SET NULL;
      ALTER TABLE devices ADD COLUMN IF NOT EXISTS active_playlist_id VARCHAR(50) REFERENCES playlists(id) ON DELETE SET NULL;
    `);

    // 5. Device playlists table
    await client.query(`
      CREATE TABLE IF NOT EXISTS device_playlists (
        id VARCHAR(50) PRIMARY KEY,
        device_id VARCHAR(50) REFERENCES devices(id) ON DELETE CASCADE,
        playlist_id VARCHAR(50) REFERENCES playlists(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Check if initial seed is needed
    const { rowCount: contentCount } = await client.query('SELECT 1 FROM contents LIMIT 1');
    if (contentCount === 0) {
      await client.query(`
        INSERT INTO contents (id, judul, tipe, payload) VALUES
        ('cnt-001', 'Banner Selamat Datang Tamu', 'image', 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=80'),
        ('cnt-002', 'Video Showcase Produk Digital', 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'),
        ('cnt-003', 'Live Dashboard Web Portal', 'url', 'https://wikipedia.org')
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    const { rowCount: deviceCount } = await client.query('SELECT 1 FROM devices LIMIT 1');
    if (deviceCount === 0) {
      await client.query(`
        INSERT INTO devices (id, nama, lokasi, status, last_seen, active_content_id) VALUES
        ('dev-001', 'Layar Lobi Utama', 'Lantai 1 - Gedung A', 'offline', NULL, 'cnt-001'),
        ('dev-002', 'Signage Ruang Rapat VIP', 'Lantai 2 - Ruang 204', 'offline', NULL, NULL),
        ('dev-003', 'Display Area Kafetaria', 'Lantai Dasar', 'offline', NULL, 'cnt-002')
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    client.release();
    console.log('[Database] Skema tabel lengkap berhasil diverifikasi & diinisialisasi.');
  } catch (err) {
    isDbConnected = false;
    console.warn(
      `[Database Warning] Tidak dapat terhubung ke PostgreSQL (${err.message}). ` +
      `Pastikan server PostgreSQL aktif dan database "${poolConfig.database || 'MjSolution'}" sudah dibuat.`
    );
  }
};

export const checkDbStatus = () => isDbConnected;
