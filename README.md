# Panel Kontrol Signage - MJ Solution Indonesia

Sistem manajemen digital signage real-time yang memungkinkan administrator mengelola beberapa perangkat layar, mengunggah/melampirkan konten media (gambar, video, atau URL web), dan memantau status koneksi perangkat secara langsung melalui WebSocket.

---

## 🛠️ Tumpukan Teknologi (Technology Stack)

- **Frontend:** React 19, Vite 7, Tailwind CSS v4, Axios, Lucide Icons
- **Backend:** Node.js, Express.js (v5), WebSocket (`ws` native)
- **Database:** **Supabase** (PostgreSQL Cloud) / PostgreSQL

---

## 📁 Struktur Direktori

```text
tes-MjSolution/
├── BackEnd/
│   ├── .env                    # Variabel lingkungan backend (Supabase / Postgres)
│   ├── .env.example
│   ├── schema.sql              # Skema SQL DDL untuk Supabase / PostgreSQL
│   ├── package.json
│   └── src/
│       ├── config/
│       │   ├── supabase.js     # Client resmi @supabase/supabase-js
│       │   └── db.js           # Pool PostgreSQL / Supabase Direct Connection
│       ├── controllers/
│       │   ├── deviceController.js   # CRUD Perangkat (Supabase & REST)
│       │   ├── contentController.js  # CRUD Pustaka Media (Supabase & REST)
│       │   ├── playlistController.js # CRUD Playlist (Fitur Bonus)
│       │   └── authController.js     # Autentikasi JWT (Fitur Bonus)
│       ├── routes/
│       │   ├── deviceRoutes.js
│       │   ├── contentRoutes.js
│       │   ├── playlistRoutes.js
│       │   └── authRoutes.js
│       ├── websocket/
│       │   └── wsServer.js     # WebSocket Server (Heartbeat & Broadcast)
│       └── index.js            # Server Entry Point (HTTP + WS)
│
├── FrontEnd/
│   ├── .env                    # Konfigurasi VITE_API_URL & VITE_WS_URL
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js          # Vite & Tailwind CSS v4
│   └── src/
│       ├── services/
│       │   ├── api.js          # Axios API Service terpusat
│       │   └── websocket.js    # Client WebSocket dengan Exponential Backoff
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── StatsCards.jsx
│       │   ├── DeviceManagement.jsx
│       │   ├── DeviceModal.jsx
│       │   ├── ContentManagement.jsx
│       │   ├── ContentModal.jsx
│       │   ├── PushContentModal.jsx
│       │   ├── PlaylistManagement.jsx
│       │   ├── AuthModal.jsx
│       │   └── DeviceClientView.jsx  # Player Layar Penuh (Signage Client)
│       ├── App.jsx             # Aplikasi Utama
│       └── index.css           # Styling Tailwind CSS v4
│
├── PRD.md                      # Product Requirements Document lengkap
├── agent .md                   # Instruksi Konteks AI Agent
└── README.md                   # Petunjuk penggunaan sistem
```

---

## ⚡ Langkah Menghubungkan ke Database Supabase

### 1. Buat Tabel di Supabase SQL Editor
1. Buka dashboard proyek Supabase Anda: [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Masuk ke menu **SQL Editor** di sidebar kiri.
3. Salin seluruh isi file [**`BackEnd/schema.sql`**](./BackEnd/schema.sql) dan klik tombol **Run**.
4. Script ini otomatis membuat:
   - Tabel `devices`
   - Tabel `contents`
   - Tabel `playlists` & `playlist_items` & `device_playlists`
   - Kebijakan keamanan akses (Row Level Security / RLS)
   - Data awal (*seed data*)

### 2. Masukkan Kredensial Supabase ke `BackEnd/.env`
Buka menu **Project Settings -> API** di Supabase, lalu salin:
- **Project URL**
- **Project API Keys (anon public atau service_role)**

Tempelkan ke dalam file [**`BackEnd/.env`**](./BackEnd/.env):
```env
PORT=5000

# Kredensial Supabase Anda
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

*(Backend juga mendukung **Supabase Direct Connection String** melalui variabel `DATABASE_URL` jika Anda ingin koneksi pooling PostgreSQL).*

---

## 🚀 Cara Menjalankan Aplikasi

### 1. Jalankan Backend
```powershell
cd BackEnd
npm run dev
```
- API Endpoint: `http://localhost:5000/api`
- WebSocket Server: `ws://localhost:5000`
- Cek Status Supabase: `http://localhost:5000/api/health`

### 2. Jalankan Frontend
```powershell
cd FrontEnd
npm run dev
```
- Buka di browser: `http://localhost:5173`
