import { supabase, isConfigured } from '../config/supabase.js';
import { pool, checkDbStatus } from '../config/db.js';
import { broadcastContentPush, updateDeviceStatus, broadcastToAdmins } from '../websocket/wsServer.js';
import crypto from 'crypto';

// In-memory fallback
let memoryDevices = [
  {
    id: 'dev-001',
    nama: 'Layar Lobi Utama',
    lokasi: 'Lantai 1 - Gedung A',
    status: 'offline',
    last_seen: null,
    active_content: {
      id: 'cnt-001',
      judul: 'Banner Selamat Datang Tamu',
      tipe: 'image',
      payload: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=80'
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'dev-002',
    nama: 'Signage Ruang Rapat VIP',
    lokasi: 'Lantai 2 - Ruang 204',
    status: 'offline',
    last_seen: null,
    active_content: null,
    created_at: new Date().toISOString()
  },
  {
    id: 'dev-003',
    nama: 'Display Area Kafetaria',
    lokasi: 'Lantai Dasar',
    status: 'offline',
    last_seen: null,
    active_content: {
      id: 'cnt-002',
      judul: 'Video Showcase Produk Digital',
      tipe: 'video',
      payload: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
    created_at: new Date().toISOString()
  }
];

// GET /api/devices
export const getDevices = async (req, res) => {
  // 1. Supabase Client
  if (isConfigured()) {
    try {
      const { data, error } = await supabase
        .from('devices')
        .select(`
          id,
          nama,
          lokasi,
          status,
          last_seen,
          created_at,
          active_content:contents(id, judul, tipe, payload)
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return res.json(data);
      }
      if (error) console.warn('[Supabase getDevices error]:', error.message);
    } catch (err) {
      console.warn('[Supabase getDevices exception]:', err.message);
    }
  }

  // 2. PostgreSQL Pool Direct
  if (checkDbStatus()) {
    try {
      const query = `
        SELECT 
          d.id,
          d.nama,
          d.lokasi,
          d.status,
          d.last_seen,
          d.created_at,
          CASE 
            WHEN c.id IS NOT NULL THEN json_build_object(
              'id', c.id,
              'judul', c.judul,
              'tipe', c.tipe,
              'payload', c.payload
            )
            ELSE NULL 
          END AS active_content
        FROM devices d
        LEFT JOIN contents c ON d.active_content_id = c.id
        ORDER BY d.created_at DESC;
      `;
      const { rows } = await pool.query(query);
      return res.json(rows);
    } catch (err) {
      console.warn(`[DB getDevices fallback]: ${err.message}`);
    }
  }

  // 3. Fallback
  return res.json(memoryDevices);
};

// GET /api/devices/:id
export const getDeviceById = async (req, res) => {
  const { id } = req.params;

  if (isConfigured()) {
    try {
      const { data, error } = await supabase
        .from('devices')
        .select(`
          id,
          nama,
          lokasi,
          status,
          last_seen,
          created_at,
          active_content:contents(id, judul, tipe, payload)
        `)
        .eq('id', id)
        .maybeSingle();

      if (!error && data) return res.json(data);
    } catch (err) {
      console.warn('[Supabase getDeviceById exception]:', err.message);
    }
  }

  if (checkDbStatus()) {
    try {
      const query = `
        SELECT 
          d.id,
          d.nama,
          d.lokasi,
          d.status,
          d.last_seen,
          d.created_at,
          CASE 
            WHEN c.id IS NOT NULL THEN json_build_object(
              'id', c.id,
              'judul', c.judul,
              'tipe', c.tipe,
              'payload', c.payload
            )
            ELSE NULL 
          END AS active_content
        FROM devices d
        LEFT JOIN contents c ON d.active_content_id = c.id
        WHERE d.id = $1;
      `;
      const { rows } = await pool.query(query, [id]);
      if (rows.length > 0) return res.json(rows[0]);
    } catch (err) {
      console.warn(`[DB getDeviceById fallback]: ${err.message}`);
    }
  }

  const found = memoryDevices.find((d) => d.id === id);
  if (!found) return res.status(404).json({ message: 'Perangkat tidak ditemukan' });
  return res.json(found);
};

// GET /api/devices/:id/current-content
export const getCurrentContent = async (req, res) => {
  const { id } = req.params;

  let device = null;
  if (isConfigured()) {
    try {
      const { data } = await supabase
        .from('devices')
        .select(`id, nama, active_content:contents(id, judul, tipe, payload)`)
        .eq('id', id)
        .maybeSingle();
      if (data) device = data;
    } catch (e) {}
  }

  if (!device && checkDbStatus()) {
    try {
      const query = `
        SELECT d.id, d.nama,
          CASE WHEN c.id IS NOT NULL THEN json_build_object('id', c.id, 'judul', c.judul, 'tipe', c.tipe, 'payload', c.payload) ELSE NULL END AS active_content
        FROM devices d
        LEFT JOIN contents c ON d.active_content_id = c.id
        WHERE d.id = $1;
      `;
      const { rows } = await pool.query(query, [id]);
      if (rows.length > 0) device = rows[0];
    } catch (e) {}
  }

  if (!device) {
    device = memoryDevices.find((d) => d.id === id);
  }

  if (!device) {
    return res.status(404).json({ active: false, message: 'Device tidak ditemukan' });
  }

  const content = device.active_content || null;
  return res.json({
    active: Boolean(content),
    content
  });
};

// POST /api/devices
export const createDevice = async (req, res) => {
  const { nama, lokasi, active_content_id } = req.body;
  if (!nama || !lokasi) {
    return res.status(400).json({ message: 'Nama dan lokasi perangkat wajib diisi' });
  }

  const id = `dev-${crypto.randomBytes(3).toString('hex')}`;
  const status = 'offline';
  const createdAt = new Date().toISOString();

  if (isConfigured()) {
    try {
      const { data, error } = await supabase
        .from('devices')
        .insert([
          {
            id,
            nama,
            lokasi,
            status,
            active_content_id: active_content_id || null,
            created_at: createdAt
          }
        ])
        .select()
        .single();

      if (!error && data) {
        broadcastToAdmins({ type: 'device_created', payload: data });
        return res.status(201).json(data);
      }
    } catch (err) {
      console.warn('[Supabase createDevice exception]:', err.message);
    }
  }

  if (checkDbStatus()) {
    try {
      const query = `
        INSERT INTO devices (id, nama, lokasi, status, active_content_id, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      const { rows } = await pool.query(query, [id, nama, lokasi, status, active_content_id || null, createdAt]);
      broadcastToAdmins({ type: 'device_created', payload: rows[0] });
      return res.status(201).json(rows[0]);
    } catch (err) {
      console.warn(`[DB createDevice fallback]: ${err.message}`);
    }
  }

  const newDevice = {
    id,
    nama,
    lokasi,
    status,
    last_seen: null,
    active_content: null,
    created_at: createdAt
  };
  memoryDevices.unshift(newDevice);
  broadcastToAdmins({ type: 'device_created', payload: newDevice });
  return res.status(201).json(newDevice);
};

// PUT /api/devices/:id
export const updateDevice = async (req, res) => {
  const { id } = req.params;
  const { nama, lokasi, status } = req.body;

  if (isConfigured()) {
    try {
      const payload = {};
      if (nama !== undefined) payload.nama = nama;
      if (lokasi !== undefined) payload.lokasi = lokasi;
      if (status !== undefined) payload.status = status;

      const { data, error } = await supabase
        .from('devices')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        broadcastToAdmins({ type: 'device_updated', payload: data });
        return res.json(data);
      }
    } catch (err) {
      console.warn('[Supabase updateDevice exception]:', err.message);
    }
  }

  if (checkDbStatus()) {
    try {
      const query = `
        UPDATE devices
        SET 
          nama = COALESCE($1, nama),
          lokasi = COALESCE($2, lokasi),
          status = COALESCE($3, status)
        WHERE id = $4
        RETURNING *;
      `;
      const { rows } = await pool.query(query, [nama, lokasi, status, id]);
      if (rows.length > 0) {
        broadcastToAdmins({ type: 'device_updated', payload: rows[0] });
        return res.json(rows[0]);
      }
    } catch (err) {
      console.warn(`[DB updateDevice fallback]: ${err.message}`);
    }
  }

  const index = memoryDevices.findIndex((d) => d.id === id);
  if (index === -1) return res.status(404).json({ message: 'Perangkat tidak ditemukan' });

  memoryDevices[index] = {
    ...memoryDevices[index],
    nama: nama || memoryDevices[index].nama,
    lokasi: lokasi || memoryDevices[index].lokasi,
    status: status || memoryDevices[index].status
  };
  broadcastToAdmins({ type: 'device_updated', payload: memoryDevices[index] });
  return res.json(memoryDevices[index]);
};

// DELETE /api/devices/:id
export const deleteDevice = async (req, res) => {
  const { id } = req.params;

  if (isConfigured()) {
    try {
      const { error } = await supabase.from('devices').delete().eq('id', id);
      if (!error) {
        broadcastToAdmins({ type: 'device_deleted', payload: { id } });
        return res.json({ success: true, message: `Perangkat ${id} berhasil dihapus` });
      }
    } catch (err) {
      console.warn('[Supabase deleteDevice exception]:', err.message);
    }
  }

  if (checkDbStatus()) {
    try {
      const { rowCount } = await pool.query('DELETE FROM devices WHERE id = $1', [id]);
      if (rowCount > 0) {
        broadcastToAdmins({ type: 'device_deleted', payload: { id } });
        return res.json({ success: true, message: `Perangkat ${id} berhasil dihapus` });
      }
    } catch (err) {
      console.warn(`[DB deleteDevice fallback]: ${err.message}`);
    }
  }

  memoryDevices = memoryDevices.filter((d) => d.id !== id);
  broadcastToAdmins({ type: 'device_deleted', payload: { id } });
  return res.json({ success: true, message: `Perangkat ${id} berhasil dihapus` });
};

// POST /api/devices/:id/push
export const pushContentToDevice = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: 'Objek aset konten wajib disertakan' });
  }

  if (isConfigured() && content.id) {
    try {
      await supabase.from('devices').update({ active_content_id: content.id }).eq('id', id);
    } catch (e) {}
  } else if (checkDbStatus() && content.id) {
    try {
      await pool.query('UPDATE devices SET active_content_id = $1 WHERE id = $2', [content.id, id]);
    } catch (e) {}
  }

  const memDev = memoryDevices.find((d) => d.id === id);
  if (memDev) memDev.active_content = content;

  broadcastContentPush(id, content);

  return res.json({
    success: true,
    message: `Perintah push konten berhasil dikirim ke perangkat ${id}`,
    deviceId: id,
    content
  });
};

// POST /api/devices/:id/heartbeat
export const heartbeatDevice = async (req, res) => {
  const { id } = req.params;
  const now = new Date().toISOString();

  await updateDeviceStatus(id, 'online');

  return res.json({
    success: true,
    deviceId: id,
    status: 'online',
    last_seen: now
  });
};
