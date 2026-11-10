import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb, checkDbStatus } from './config/db.js';
import { isConfigured as isSupabaseConfigured } from './config/supabase.js';
import { initWebSocket, getDeviceLastContent } from './websocket/wsServer.js';
import deviceRoutes from './routes/deviceRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import playlistRoutes from './routes/playlistRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static uploaded files (Images & Videos)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes Mount
app.use('/api/devices', deviceRoutes);
app.use('/api/contents', contentRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/auth', authRoutes);

// API: Ambil konten/playlist terakhir yang di-push ke device
app.get('/api/devices/:deviceId/current-content', (req, res) => {
  const content = getDeviceLastContent(req.params.deviceId);
  if (!content) {
    return res.json({ active: false, content: null });
  }
  return res.json({ active: true, content });
});

// Health Check API
app.get('/api/health', (req, res) => {
  const isSupa = isSupabaseConfigured();
  const isPg = checkDbStatus();

  res.json({
    status: 'ok',
    service: 'Panel Kontrol Signage API (MJ Solution)',
    database: {
      provider: isSupa ? 'Supabase (Cloud)' : isPg ? 'PostgreSQL (Direct)' : 'Local Fallback',
      connected: isSupa || isPg
    },
    websocket: 'active',
    features: {
      devices_crud: true,
      contents_crud: true,
      playlists: true,
      push_command: true,
      jwt_auth: true
    },
    timestamp: new Date().toISOString()
  });
});

// Root Info Route
app.get('/', (req, res) => {
  res.json({
    message: 'Selamat datang di API Panel Kontrol Signage - MJ Solution Indonesia',
    docs: '/api/health'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Create HTTP server
const server = http.createServer(app);

// Attach WebSocket Server
initWebSocket(server);

// Start Server & Connect Database
server.listen(PORT, async () => {
  const isSupa = isSupabaseConfigured();
  console.log(`\n=================================================`);
  console.log(`🚀 MJ Solution Signage Backend Server`);
  console.log(`📡 HTTP API: http://localhost:${PORT}/api`);
  console.log(`⚡ WebSocket: ws://localhost:${PORT}`);
  console.log(`💾 Database Provider: ${isSupa ? '⚡ Supabase (Cloud)' : '🐘 PostgreSQL (DB: ' + (process.env.DB_NAME || 'MjSolustion') + ')'}`);
  console.log(`=================================================\n`);

  await initDb();
});

export default app;
