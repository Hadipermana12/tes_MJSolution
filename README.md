# MJ Signage - CMS Digital Display

Aplikasi manajemen digital signage untuk mengelola layar TV, playlist konten, jadwal tayang, dan pengumuman teks berjalan secara real-time.

---

## 🚀 Cara Menjalankan Proyek

### 1. Clone Repository
```bash
git clone <URL_REPOSITORY_ANDA>
cd tes-MjSolution
```

---

### 2. Jalankan Backend (Server API & WebSocket)
Buka terminal:

```bash
cd BackEnd
npm install
```

Salin file environment:
```bash
cp .env.example .env
```
> **Tips:** Isi `SUPABASE_URL` dan `SUPABASE_ANON_KEY` Anda di `.env`. Jika belum disiapkan, server tetap bisa berjalan menggunakan data mock cadangan.

Nyalakan server:
```bash
npm run dev
```
Backend berjalan di: `http://localhost:5000`

---

### 3. Jalankan Frontend (Dashboard Web)
Buka terminal baru:

```bash
cd FrontEnd
npm install
npm run dev
```
Buka browser di: **`http://localhost:5173`**

---

## 🔑 Akun Login

Gunakan akun bawaan ini untuk masuk:
- **Username:** `admin`
- **Kata Sandi:** `admin123`

*(Atau klik opsi **Gunakan akun demo** di layar login untuk langsung mengisi otomatis).*

---

## 📌 Link Halaman Penting

- **Dashboard CMS:** [http://localhost:5173/dashboard](http://localhost:5173/dashboard)
- **Layar TV Player (Fullscreen):** [http://localhost:5173/player](http://localhost:5173/player)
- **Halaman Login:** [http://localhost:5173/login](http://localhost:5173/login)
