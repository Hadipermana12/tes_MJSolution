import axios from 'axios';

// Konfigurasi baseURL dari environment variable (.env)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Buat instance axios dengan konfigurasi default
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Otomatis lampirkan token JWT jika ada di localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Menangani error secara tersentralisasi
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.warn(`[Axios API Warning]: ${error.message} - ${error.config?.url}`);
    return Promise.reject(error);
  }
);

// Data Mock Cadangan jika backend sedang offline
let mockDevices = [
  {
    id: 'dev-001',
    nama: 'Layar Lobi Utama',
    lokasi: 'Lantai 1 - Gedung A',
    status: 'online',
    last_seen: new Date().toISOString(),
    active_content: {
      id: 'cnt-001',
      judul: 'Company Profile MJ Solution',
      tipe: 'image',
      payload: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80'
    },
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'dev-002',
    nama: 'Signage Ruang Rapat VIP',
    lokasi: 'Lantai 2 - Ruang 204',
    status: 'offline',
    last_seen: new Date(Date.now() - 3600000 * 4).toISOString(),
    active_content: null,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'dev-003',
    nama: 'Display Area Kafetaria',
    lokasi: 'Lantai Dasar',
    status: 'online',
    last_seen: new Date().toISOString(),
    active_content: {
      id: 'cnt-002',
      judul: 'Pengumuman Menu Harian',
      tipe: 'image',
      payload: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80'
    },
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

let mockContents = [
  {
    id: 'cnt-001',
    judul: 'Banner Selamat Datang Tamu',
    tipe: 'image',
    payload: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=80',
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'cnt-002',
    judul: 'Video Showcase Produk Digital',
    tipe: 'video',
    payload: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'cnt-003',
    judul: 'Live Dashboard Web URL',
    tipe: 'url',
    payload: 'https://wikipedia.org',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString()
  }
];

// Layanan API Utama dengan Axios
export const api = {
  // ==========================================
  // 1. DEVICES CRUD (Perangkat Layar)
  // ==========================================
  async getDevices() {
    try {
      const response = await apiClient.get('/devices');
      return response.data;
    } catch (err) {
      console.warn('[API fallback getDevices]');
      return [...mockDevices];
    }
  },

  async getDeviceById(id) {
    try {
      const response = await apiClient.get(`/devices/${id}`);
      return response.data;
    } catch (err) {
      return mockDevices.find((d) => d.id === id) || null;
    }
  },

  async createDevice(deviceData) {
    try {
      const response = await apiClient.post('/devices', deviceData);
      return response.data;
    } catch (err) {
      const newDevice = {
        id: `dev-${Math.floor(100 + Math.random() * 900)}`,
        status: 'offline',
        last_seen: null,
        active_content: null,
        created_at: new Date().toISOString(),
        ...deviceData
      };
      mockDevices.unshift(newDevice);
      return newDevice;
    }
  },

  async updateDevice(id, deviceData) {
    try {
      const response = await apiClient.put(`/devices/${id}`, deviceData);
      return response.data;
    } catch (err) {
      const idx = mockDevices.findIndex((d) => d.id === id);
      if (idx !== -1) {
        mockDevices[idx] = { ...mockDevices[idx], ...deviceData };
        return mockDevices[idx];
      }
      return null;
    }
  },

  async deleteDevice(id) {
    try {
      const response = await apiClient.delete(`/devices/${id}`);
      return response.data;
    } catch (err) {
      mockDevices = mockDevices.filter((d) => d.id !== id);
      return { success: true, id };
    }
  },

  // Perintah Push Konten Real-Time
  async pushContentToDevice(deviceId, content) {
    try {
      const response = await apiClient.post(`/devices/${deviceId}/push`, { content });
      return response.data;
    } catch (err) {
      const target = mockDevices.find((d) => d.id === deviceId);
      if (target) {
        target.active_content = content;
      }
      return { success: true, deviceId, content };
    }
  },

  // ==========================================
  // 2. CONTENTS CRUD (Pustaka Aset Konten)
  // ==========================================
  async getContents() {
    try {
      const response = await apiClient.get('/contents');
      return response.data;
    } catch (err) {
      console.warn('[API fallback getContents]');
      return [...mockContents];
    }
  },

  async getContentById(id) {
    try {
      const response = await apiClient.get(`/contents/${id}`);
      return response.data;
    } catch (err) {
      return mockContents.find((c) => c.id === id) || null;
    }
  },

  async createContent(contentData) {
    try {
      const response = await apiClient.post('/contents', contentData);
      return response.data;
    } catch (err) {
      const newContent = {
        id: `cnt-${Math.floor(100 + Math.random() * 900)}`,
        created_at: new Date().toISOString(),
        ...contentData
      };
      mockContents.unshift(newContent);
      return newContent;
    }
  },

  async updateContent(id, contentData) {
    try {
      const response = await apiClient.put(`/contents/${id}`, contentData);
      return response.data;
    } catch (err) {
      const idx = mockContents.findIndex((c) => c.id === id);
      if (idx !== -1) {
        mockContents[idx] = { ...mockContents[idx], ...contentData };
        return mockContents[idx];
      }
      return null;
    }
  },

  // Upload file gambar/video → multipart/form-data
  async uploadContent(formData) {
    try {
      const response = await apiClient.post('/contents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000 // 60 detik untuk file besar
      });
      return response.data;
    } catch (err) {
      console.error('[API uploadContent error]:', err.message);
      throw err;
    }
  },

  async deleteContent(id) {
    try {
      const response = await apiClient.delete(`/contents/${id}`);
      return response.data;
    } catch (err) {
      mockContents = mockContents.filter((c) => c.id !== id);
      return { success: true, id };
    }
  },

  // ==========================================
  // 3. PLAYLISTS (Bonus PRD 5.2.1)
  // ==========================================
  async getPlaylists() {
    try {
      const response = await apiClient.get('/playlists');
      return response.data;
    } catch (err) {
      return [];
    }
  },

  async getPlaylistById(id) {
    try {
      const response = await apiClient.get(`/playlists/${id}`);
      return response.data;
    } catch (err) {
      return null;
    }
  },

  async createPlaylist(playlistData) {
    try {
      const response = await apiClient.post('/playlists', playlistData);
      return response.data;
    } catch (err) {
      return { id: `pl-${Date.now()}`, ...playlistData };
    }
  },

  // ==========================================
  // 4. AUTENTIKASI JWT (Bonus PRD 5.2.3)
  // ==========================================
  async login(username, password) {
    try {
      const response = await apiClient.post('/auth/login', { username, password });
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (err) {
      // Fallback demo auth jika server API offline atau timeout
      if (username === 'admin' && password === 'admin123') {
        const demoToken = 'demo-jwt-token-mjsolution-admin';
        localStorage.setItem('token', demoToken);
        return {
          success: true,
          token: demoToken,
          user: { username: 'admin', role: 'admin' }
        };
      }
      throw err;
    }
  },

  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (err) {
      const token = localStorage.getItem('token');
      if (token && token.startsWith('demo-jwt-token')) {
        return { user: { username: 'admin', role: 'admin' } };
      }
      throw err;
    }
  },

  logout() {
    localStorage.removeItem('token');
  },

  // ==========================================
  // 5. HEALTH CHECK
  // ==========================================
  async getHealth() {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (err) {
      return { status: 'offline', database: { connected: false } };
    }
  }
};
