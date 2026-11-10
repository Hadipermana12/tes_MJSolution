-- ========================================================
-- Database Setup Script: MjSolution
-- DBMS: Supabase / PostgreSQL
-- Panel Kontrol Signage
-- ========================================================

-- 1. Ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tabel contents (Pustaka Aset Konten)
CREATE TABLE IF NOT EXISTS contents (
    id VARCHAR(50) PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    tipe VARCHAR(50) NOT NULL CHECK (tipe IN ('image', 'video', 'url')),
    payload TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel playlists (Daftar Putar Konten)
CREATE TABLE IF NOT EXISTS playlists (
    id VARCHAR(50) PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    deskripsi TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel playlist_items (Item dalam playlist dengan durasi & urutan)
CREATE TABLE IF NOT EXISTS playlist_items (
    id VARCHAR(50) PRIMARY KEY,
    playlist_id VARCHAR(50) REFERENCES playlists(id) ON DELETE CASCADE,
    content_id VARCHAR(50) REFERENCES contents(id) ON DELETE CASCADE,
    urutan INT DEFAULT 1,
    durasi_detik INT DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabel devices (Perangkat Layar)
CREATE TABLE IF NOT EXISTS devices (
    id VARCHAR(50) PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    lokasi VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'offline',
    last_seen TIMESTAMP WITH TIME ZONE NULL,
    active_content_id VARCHAR(50) REFERENCES contents(id) ON DELETE SET NULL,
    active_playlist_id VARCHAR(50) REFERENCES playlists(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabel device_playlists (Relasi Device ke Playlist)
CREATE TABLE IF NOT EXISTS device_playlists (
    id VARCHAR(50) PRIMARY KEY,
    device_id VARCHAR(50) REFERENCES devices(id) ON DELETE CASCADE,
    playlist_id VARCHAR(50) REFERENCES playlists(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- Kebijakan Akses Supabase (Row Level Security / RLS)
-- Memastikan API Backend / Anon Key dapat membaca dan menulis
-- ========================================================
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_playlists ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow public full access for devices" ON devices;
    CREATE POLICY "Allow public full access for devices" ON devices FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public full access for contents" ON contents;
    CREATE POLICY "Allow public full access for contents" ON contents FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public full access for playlists" ON playlists;
    CREATE POLICY "Allow public full access for playlists" ON playlists FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public full access for playlist_items" ON playlist_items;
    CREATE POLICY "Allow public full access for playlist_items" ON playlist_items FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public full access for device_playlists" ON device_playlists;
    CREATE POLICY "Allow public full access for device_playlists" ON device_playlists FOR ALL USING (true) WITH CHECK (true);
END $$;

-- ========================================================
-- Data Awal (Seed Data)
-- ========================================================
INSERT INTO contents (id, judul, tipe, payload) VALUES
('cnt-001', 'Banner Selamat Datang Tamu', 'image', 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=80'),
('cnt-002', 'Video Showcase Produk Digital', 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'),
('cnt-003', 'Live Dashboard Web Portal', 'url', 'https://wikipedia.org')
ON CONFLICT (id) DO NOTHING;

INSERT INTO devices (id, nama, lokasi, status, last_seen, active_content_id) VALUES
('dev-001', 'Layar Lobi Utama', 'Lantai 1 - Gedung A', 'offline', NULL, 'cnt-001'),
('dev-002', 'Signage Ruang Rapat VIP', 'Lantai 2 - Ruang 204', 'offline', NULL, NULL),
('dev-003', 'Display Area Kafetaria', 'Lantai Dasar', 'offline', NULL, 'cnt-002')
ON CONFLICT (id) DO NOTHING;
