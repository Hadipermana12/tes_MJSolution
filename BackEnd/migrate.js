import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const { Client } = pkg;

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'postgres';
const dbName = process.env.DB_NAME || 'MjSolution';

async function runMigration() {
  console.log('--------------------------------------------------');
  console.log(`[Migration] Memulai proses migrasi ke PostgreSQL`);
  console.log(`Host: ${dbHost}:${dbPort} | User: ${dbUser} | DB: ${dbName}`);
  console.log('--------------------------------------------------');

  const rootClient = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: 'postgres'
  });

  try {
    await rootClient.connect();
    console.log('[1/4] Terhubung ke server PostgreSQL.');

    const res = await rootClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (res.rowCount === 0) {
      console.log(`[2/4] Database "${dbName}" belum ada. Membuat database "${dbName}"...`);
      await rootClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" berhasil dibuat!`);
    } else {
      console.log(`[2/4] Database "${dbName}" sudah ada.`);
    }
  } catch (err) {
    console.warn(`[Info Koneksi Root]: ${err.message}. Melanjutkan koneksi ke target...`);
  } finally {
    try {
      await rootClient.end();
    } catch {}
  }

  const targetClient = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName
  });

  try {
    await targetClient.connect();
    console.log(`[3/4] Berhasil tersambung ke database target "${dbName}".`);

    // Tambah kolom jika tabel sudah ada sebelumnya
    await targetClient.query(`
      ALTER TABLE devices ADD COLUMN IF NOT EXISTS active_content_id VARCHAR(50);
      ALTER TABLE devices ADD COLUMN IF NOT EXISTS active_playlist_id VARCHAR(50);
    `);

    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('[4/4] Menjalankan script migrasi dari schema.sql...');
    await targetClient.query(sql);
    console.log('Eksekusi schema.sql selesai dengan sukses!');

    const tablesRes = await targetClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\n================ HASIL MIGRASI ================');
    console.log(`Tabel di database "${dbName}":`);
    for (const row of tablesRes.rows) {
      const countRes = await targetClient.query(`SELECT COUNT(*) FROM "${row.table_name}"`);
      console.log(` - ${row.table_name.padEnd(20)}: ${countRes.rows[0].count} data baris`);
    }
    console.log('===============================================\n');
    console.log('✅ Migrasi database BERHASIL!');
  } catch (err) {
    console.error('\n❌ Gagal melakukan migrasi:', err.message);
    process.exitCode = 1;
  } finally {
    await targetClient.end();
  }
}

runMigration();
