# Product Requirements Document (PRD): Panel Kontrol Signage

## 1. Ringkasan & Tujuan
**Panel Kontrol Signage** adalah sistem manajemen digital signage real-time yang dirancang untuk **MJ Solution Indonesia**. Sistem ini memungkinkan administrator untuk mengelola beberapa perangkat layar, mengunggah atau melampirkan konten (gambar, video, atau URL), dan memantau status konektivitas perangkat secara instan melalui WebSocket.

### Tujuan
- Menyediakan dasbor admin yang bersih dan intuitif untuk manajemen perangkat dan konten yang lengkap.
- Menerapkan pelacakan status koneksi real-time menggunakan arsitektur WebSocket.
- Menghadirkan antarmuka klien yang ringan dan andal untuk merender konten signage dengan mulus.
- Memenuhi seluruh persyaratan wajib serta target bonus (playlist, perintah push, aplikasi Electron, autentikasi JWT, dan rekoneksi otomatis) guna menampilkan keunggulan teknis.

---

## 2. Target Pengguna & Pemangku Kepentingan
- **Administrator Sistem:** Mengelola perangkat, mengunggah media, membuat playlist, dan memantau waktu aktif (*uptime*).
- **Klien Perangkat (Layar):** Dideploy pada layar jarak jauh (berjalan melalui browser web atau pembungkus desktop Electron) untuk mengambil dan merender konten secara dinamis.
- **Penguji / Peninjau Teknis (MJ Solution Indonesia):** Menilai kerapian kode, ketepatan pemilihan teknologi, implementasi WebSocket real-time, dan kualitas UI/UX.

---

## 3. Tumpukan Teknologi (Technology Stack)
- **Frontend (Dasbor Admin):** React / Next.js dengan Tailwind CSS untuk desain UI/UX yang modern dan cepat.
- **Backend API & Real-time:** Node.js (Express atau NestJS) dengan server WebSocket kustom (Socket.io atau ws native) untuk heartbeat real-time dan perintah push.
- **Database:** Supabase (PostgreSQL).
- **Klien Desktop (Bonus):** Pembungkus Electron.js untuk antarmuka klien perangkat.
- **Autentikasi (Bonus):** JSON Web Tokens (JWT) untuk akses admin yang aman.

---

## 4. Skema Database (Supabase / PostgreSQL)

### Tabel 1: `devices`
| Nama Kolom | Tipe Data | Batasan (Constraints) | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id` | UUID / SERIAL | PRIMARY KEY | Pengenal unik untuk perangkat |
| `nama` | VARCHAR(255) | NOT NULL | Nama ramah/tampilan layar |
| `lokasi` | VARCHAR(255) | NOT NULL | Lokasi fisik atau zona perangkat |
| `status` | VARCHAR(50) | DEFAULT 'offline' | Status koneksi saat ini (`online` / `offline`) |
| `last_seen` | TIMESTAMP | NULLABLE | Stempel waktu aktivitas terakhir (*heartbeat*) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Stempel waktu pembuatan data |

### Tabel 2: `contents`
| Nama Kolom | Tipe Data | Batasan (Constraints) | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id` | UUID / SERIAL | PRIMARY KEY | Pengenal unik untuk item konten |
| `judul` | VARCHAR(255) | NOT NULL | Judul aset konten |
| `tipe` | VARCHAR(50) | NOT NULL | Tipe media (`image`, `video`, `url`) |
| `payload` | TEXT | NOT NULL | URL penyimpanan atau tautan web target (`payload`/`url`) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Stempel waktu unggah |

### (Bonus) Tabel 3: `playlists` & `device_playlists`
- Mendukung pemetaan beberapa konten ke perangkat atau grup tertentu dengan durasi kustom.

---

## 5. Persyaratan Fungsional

### 5.1. Persyaratan Wajib
1. **Integrasi Database Supabase:** Menyediakan tabel untuk `devices` dan `contents` dengan skema yang tepat.
2. **REST API CRUD:**
   - Endpoint untuk Membuat, Membaca, Memperbarui, dan Menghapus perangkat (*Devices*).
   - Endpoint untuk Membuat, Membaca, Memperbarui, dan Menghapus aset konten (*Contents*).
3. **Server WebSocket & Status Real-time:**
   - Membangun koneksi WebSocket yang persisten antara server dan klien perangkat.
   - Melacak heartbeat (*ping/pong*) untuk memperbarui status perangkat (`online`/`offline`) dan `last_seen` secara dinamis pada dasbor admin tanpa memuat ulang halaman.
4. **Dasbor Admin:**
   - Tampilan CRUD untuk mengelola perangkat keras dan pustaka konten.
   - Antarmuka untuk mengunggah media atau melampirkan payload konten ke perangkat.
5. **Halaman Klien Perangkat:**
   - Tampilan layar khusus yang terhubung melalui WebSocket/REST, mendengarkan penugasan konten aktif, serta merender gambar, video, atau URL web secara layar penuh (*full-screen*).

### 5.2. Persyaratan Bonus (Lingkup Implementasi)
1. **Playlist & Perintah Push Konten:** Memungkinkan admin mengantre urutan konten dan langsung mengirimkan perintah tampilan ke perangkat target tertentu.
2. **Aplikasi Desktop Electron:** Membungkus klien perangkat ke dalam cangkang Electron.js untuk penerapan perangkat keras secara native.
3. **Autentikasi JWT:** Mengamankan rute administratif dan endpoint API menggunakan verifikasi berbasis token sederhana.
4. **Penanganan Rekoneksi yang Tangguh:** Menerapkan logika rekoneksi *exponential backoff* pada lapisan WebSocket klien perangkat untuk menangani gangguan jaringan dengan lancar.

---

## 6. Persyaratan Non-Fungsional
- **Kerapian & Pemeliharaan Kode:** Struktur folder modular, pemisahan tugas yang jelas, dan standar penulisan kode yang bersih.
- **Performa:** Propagasi kejadian WebSocket berlatensi rendah (< 200ms pembaruan status).
- **Kualitas UI/UX:** Antarmuka yang kreatif, responsif, dan rapi yang dirancang untuk kemudahan operasional.
- **Linimasa (Timeline):** Diselesaikan dalam batas waktu pengerjaan 4–5 hari kalender.

---

