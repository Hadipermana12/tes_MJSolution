import { WebSocketServer, WebSocket } from 'ws';
import { supabase, isConfigured } from '../config/supabase.js';
import { pool, checkDbStatus } from '../config/db.js';

let wss = null;
const deviceSockets = new Map();
const adminSockets = new Set();
const heartbeatTimestamps = new Map();

// ── Simpan konten/playlist terakhir yang di-push per device ──────
const deviceLastContent = new Map();

// Export getter agar controller bisa akses
export const getDeviceLastContent = (deviceId) => deviceLastContent.get(deviceId) || null;

export const initWebSocket = (server) => {
  wss = new WebSocketServer({ server });

  console.log('[WebSocket] Server diinisialisasi pada port yang sama dengan HTTP.');

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const deviceId = url.searchParams.get('deviceId');

    if (deviceId === 'admin-dashboard' || !deviceId) {
      adminSockets.add(ws);
      ws.isDashboard = true;
      console.log('[WebSocket] Klien Admin Dashboard terhubung.');

      ws.on('close', () => {
        adminSockets.delete(ws);
      });
    } else {
      ws.deviceId = deviceId;
      deviceSockets.set(deviceId, ws);
      heartbeatTimestamps.set(deviceId, Date.now());
      console.log(`[WebSocket] Perangkat Layar terhubung: ${deviceId}`);

      updateDeviceStatus(deviceId, 'online');

      // ── Kirim ulang konten/playlist terakhir saat device reconnect ──
      const lastContent = deviceLastContent.get(deviceId);
      if (lastContent && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'content_push',
          deviceId,
          content: lastContent
        }));
        console.log(`[WebSocket] Konten terakhir dikirim ulang ke device: ${deviceId}`);
      }

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          handleIncomingMessage(ws, data);
        } catch (e) {
          console.warn('[WebSocket] Pesan non-JSON:', message.toString());
        }
      });

      ws.on('close', () => {
        console.log(`[WebSocket] Perangkat Layar terputus: ${deviceId}`);
        deviceSockets.delete(deviceId);
        heartbeatTimestamps.delete(deviceId);
        updateDeviceStatus(deviceId, 'offline');
      });

      ws.on('error', (err) => {
        console.error(`[WebSocket Error pada ${deviceId}]:`, err.message);
      });
    }

    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });
  });

  setInterval(() => {
    const now = Date.now();
    for (const [devId, lastBeat] of heartbeatTimestamps.entries()) {
      if (now - lastBeat > 25000) {
        console.warn(`[WebSocket] Heartbeat timeout untuk device: ${devId}`);
        const socket = deviceSockets.get(devId);
        if (socket) {
          socket.terminate();
        }
        deviceSockets.delete(devId);
        heartbeatTimestamps.delete(devId);
        updateDeviceStatus(devId, 'offline');
      }
    }
  }, 10000);
};

const handleIncomingMessage = (ws, data) => {
  if (data.type === 'heartbeat' && ws.deviceId) {
    heartbeatTimestamps.set(ws.deviceId, Date.now());
    updateDeviceStatus(ws.deviceId, 'online');
    
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'heartbeat_ack', timestamp: new Date().toISOString() }));
    }
  } else if (data.type === 'content_push' && data.deviceId && data.content) {
    broadcastContentPush(data.deviceId, data.content);
  }
};

export const updateDeviceStatus = async (deviceId, status) => {
  const lastSeen = new Date().toISOString();

  // 1. Supabase
  if (isConfigured()) {
    try {
      await supabase
        .from('devices')
        .update({ status, last_seen: lastSeen })
        .eq('id', deviceId);
    } catch (err) {
      console.warn(`[Supabase Error Update Status]: ${err.message}`);
    }
  } else if (checkDbStatus()) {
    // 2. Direct PostgreSQL
    try {
      await pool.query(
        'UPDATE devices SET status = $1, last_seen = $2 WHERE id = $3',
        [status, lastSeen, deviceId]
      );
    } catch (err) {
      console.warn(`[DB Error Update Status]: ${err.message}`);
    }
  }

  broadcastToAdmins({
    type: 'device_status_update',
    payload: {
      id: deviceId,
      status,
      last_seen: lastSeen
    }
  });
};

export const broadcastContentPush = (deviceId, content) => {
  // ── Simpan konten terakhir agar bisa dikirim ulang saat reconnect ──
  deviceLastContent.set(deviceId, content);

  const message = JSON.stringify({
    type: 'content_push',
    deviceId,
    content
  });

  const targetSocket = deviceSockets.get(deviceId);
  if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
    targetSocket.send(message);
    console.log(`[WebSocket] Content/Playlist di-push ke layar: ${deviceId}`);
  }

  broadcastToAdmins({
    type: 'content_push',
    deviceId,
    content
  });
};

export const broadcastToAdmins = (payload) => {
  const message = JSON.stringify(payload);
  adminSockets.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};
