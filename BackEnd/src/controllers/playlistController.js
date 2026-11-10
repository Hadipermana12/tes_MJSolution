import { supabase, isConfigured } from '../config/supabase.js';
import { pool, checkDbStatus } from '../config/db.js';
import { broadcastContentPush, broadcastToAdmins } from '../websocket/wsServer.js';
import crypto from 'crypto';

let memoryPlaylists = [];
let memoryPlaylistItems = [];

// GET /api/playlists
export const getPlaylists = async (req, res) => {
  // 1. Supabase
  if (isConfigured()) {
    try {
      const { data: plData, error: plErr } = await supabase
        .from('playlists')
        .select('*')
        .order('created_at', { ascending: false });

      if (!plErr && plData) {
        // Hitung total item per playlist
        const { data: itemsData } = await supabase
          .from('playlist_items')
          .select('playlist_id');

        const counts = {};
        (itemsData || []).forEach((item) => {
          counts[item.playlist_id] = (counts[item.playlist_id] || 0) + 1;
        });

        const formatted = plData.map((pl) => ({
          ...pl,
          total_items: counts[pl.id] || 0
        }));

        return res.json(formatted);
      }
    } catch (err) {
      console.warn('[Supabase getPlaylists exception]:', err.message);
    }
  }

  // 2. Direct PostgreSQL
  if (checkDbStatus()) {
    try {
      const query = `
        SELECT 
          p.id,
          p.nama,
          p.deskripsi,
          p.created_at,
          COUNT(pi.id)::int AS total_items
        FROM playlists p
        LEFT JOIN playlist_items pi ON p.id = pi.playlist_id
        GROUP BY p.id
        ORDER BY p.created_at DESC;
      `;
      const { rows } = await pool.query(query);
      return res.json(rows);
    } catch (err) {
      console.warn(`[DB getPlaylists fallback]: ${err.message}`);
    }
  }

  return res.json(memoryPlaylists);
};

// GET /api/playlists/:id
export const getPlaylistById = async (req, res) => {
  const { id } = req.params;

  // 1. Supabase
  if (isConfigured()) {
    try {
      const { data: pl, error: plErr } = await supabase
        .from('playlists')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!plErr && pl) {
        // Ambil item dengan join contents
        const { data: items, error: itemsErr } = await supabase
          .from('playlist_items')
          .select(`
            id,
            urutan,
            durasi_detik,
            content_id,
            contents (
              id,
              judul,
              tipe,
              payload
            )
          `)
          .eq('playlist_id', id)
          .order('urutan', { ascending: true });

        const formattedItems = (items || []).map((it) => ({
          item_id: it.id,
          urutan: it.urutan,
          durasi_detik: it.durasi_detik,
          content_id: it.content_id,
          judul: it.contents?.judul || 'Konten',
          tipe: it.contents?.tipe || 'image',
          payload: it.contents?.payload || ''
        }));

        return res.json({
          ...pl,
          items: formattedItems
        });
      }
    } catch (err) {
      console.warn('[Supabase getPlaylistById exception]:', err.message);
    }
  }

  // 2. Direct PostgreSQL
  if (checkDbStatus()) {
    try {
      const plQuery = 'SELECT * FROM playlists WHERE id = $1';
      const plRes = await pool.query(plQuery, [id]);
      if (plRes.rows.length === 0) {
        return res.status(404).json({ message: 'Playlist tidak ditemukan' });
      }

      const itemsQuery = `
        SELECT 
          pi.id AS item_id,
          pi.urutan,
          pi.durasi_detik,
          c.id AS content_id,
          c.judul,
          c.tipe,
          c.payload
        FROM playlist_items pi
        JOIN contents c ON pi.content_id = c.id
        WHERE pi.playlist_id = $1
        ORDER BY pi.urutan ASC;
      `;
      const itemsRes = await pool.query(itemsQuery, [id]);

      return res.json({
        ...plRes.rows[0],
        items: itemsRes.rows
      });
    } catch (err) {
      console.warn(`[DB getPlaylistById fallback]: ${err.message}`);
    }
  }

  const found = memoryPlaylists.find((p) => p.id === id);
  if (!found) return res.status(404).json({ message: 'Playlist tidak ditemukan' });
  const items = memoryPlaylistItems.filter((i) => i.playlist_id === id);
  return res.json({ ...found, items });
};

// POST /api/playlists
export const createPlaylist = async (req, res) => {
  const { nama, deskripsi } = req.body;
  if (!nama) {
    return res.status(400).json({ message: 'Nama playlist wajib diisi' });
  }

  const id = `pl-${crypto.randomBytes(3).toString('hex')}`;
  const createdAt = new Date().toISOString();

  // 1. Supabase
  if (isConfigured()) {
    try {
      const { data, error } = await supabase
        .from('playlists')
        .insert([{ id, nama, deskripsi: deskripsi || null, created_at: createdAt }])
        .select()
        .single();

      if (!error && data) {
        const result = { ...data, total_items: 0, items: [] };
        broadcastToAdmins({ type: 'playlist_created', payload: result });
        return res.status(201).json(result);
      }
    } catch (err) {
      console.warn('[Supabase createPlaylist exception]:', err.message);
    }
  }

  // 2. PostgreSQL Direct
  if (checkDbStatus()) {
    try {
      const query = `
        INSERT INTO playlists (id, nama, deskripsi, created_at)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;
      const { rows } = await pool.query(query, [id, nama, deskripsi || null, createdAt]);
      const result = { ...rows[0], total_items: 0, items: [] };
      broadcastToAdmins({ type: 'playlist_created', payload: result });
      return res.status(201).json(result);
    } catch (err) {
      console.warn(`[DB createPlaylist fallback]: ${err.message}`);
    }
  }

  const newPl = { id, nama, deskripsi: deskripsi || null, created_at: createdAt, total_items: 0, items: [] };
  memoryPlaylists.unshift(newPl);
  broadcastToAdmins({ type: 'playlist_created', payload: newPl });
  return res.status(201).json(newPl);
};

// PUT /api/playlists/:id
export const updatePlaylist = async (req, res) => {
  const { id } = req.params;
  const { nama, deskripsi } = req.body;

  if (isConfigured()) {
    try {
      const payload = {};
      if (nama !== undefined) payload.nama = nama;
      if (deskripsi !== undefined) payload.deskripsi = deskripsi;

      const { data, error } = await supabase
        .from('playlists')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        broadcastToAdmins({ type: 'playlist_updated', payload: data });
        return res.json(data);
      }
    } catch (err) {
      console.warn('[Supabase updatePlaylist exception]:', err.message);
    }
  }

  if (checkDbStatus()) {
    try {
      const query = `
        UPDATE playlists
        SET nama = COALESCE($1, nama), deskripsi = COALESCE($2, deskripsi)
        WHERE id = $3
        RETURNING *;
      `;
      const { rows } = await pool.query(query, [nama, deskripsi, id]);
      if (rows.length > 0) {
        broadcastToAdmins({ type: 'playlist_updated', payload: rows[0] });
        return res.json(rows[0]);
      }
    } catch (err) {
      console.warn(`[DB updatePlaylist fallback]: ${err.message}`);
    }
  }

  const index = memoryPlaylists.findIndex((p) => p.id === id);
  if (index === -1) return res.status(404).json({ message: 'Playlist tidak ditemukan' });
  memoryPlaylists[index] = { ...memoryPlaylists[index], nama: nama || memoryPlaylists[index].nama };
  broadcastToAdmins({ type: 'playlist_updated', payload: memoryPlaylists[index] });
  return res.json(memoryPlaylists[index]);
};

// DELETE /api/playlists/:id
export const deletePlaylist = async (req, res) => {
  const { id } = req.params;

  if (isConfigured()) {
    try {
      const { error } = await supabase.from('playlists').delete().eq('id', id);
      if (!error) {
        broadcastToAdmins({ type: 'playlist_deleted', payload: { id } });
        return res.json({ success: true, message: `Playlist ${id} berhasil dihapus` });
      }
    } catch (err) {
      console.warn('[Supabase deletePlaylist exception]:', err.message);
    }
  }

  if (checkDbStatus()) {
    try {
      const { rowCount } = await pool.query('DELETE FROM playlists WHERE id = $1', [id]);
      if (rowCount > 0) {
        broadcastToAdmins({ type: 'playlist_deleted', payload: { id } });
        return res.json({ success: true, message: `Playlist ${id} berhasil dihapus` });
      }
    } catch (err) {
      console.warn(`[DB deletePlaylist fallback]: ${err.message}`);
    }
  }

  memoryPlaylists = memoryPlaylists.filter((p) => p.id !== id);
  broadcastToAdmins({ type: 'playlist_deleted', payload: { id } });
  return res.json({ success: true, message: `Playlist ${id} berhasil dihapus` });
};

// POST /api/playlists/:id/items
export const addPlaylistItem = async (req, res) => {
  const { id: playlist_id } = req.params;
  const { content_id, urutan = 1, durasi_detik = 10 } = req.body;

  if (!content_id) {
    return res.status(400).json({ message: 'content_id wajib diisi' });
  }

  const itemId = `pi-${crypto.randomBytes(3).toString('hex')}`;
  const createdAt = new Date().toISOString();

  if (isConfigured()) {
    try {
      const { data, error } = await supabase
        .from('playlist_items')
        .insert([
          {
            id: itemId,
            playlist_id,
            content_id,
            urutan: parseInt(urutan, 10) || 1,
            durasi_detik: parseInt(durasi_detik, 10) || 10,
            created_at: createdAt
          }
        ])
        .select()
        .single();

      if (!error && data) {
        broadcastToAdmins({ type: 'playlist_items_updated', payload: { playlist_id } });
        return res.status(201).json(data);
      }
    } catch (err) {
      console.warn('[Supabase addPlaylistItem exception]:', err.message);
    }
  }

  if (checkDbStatus()) {
    try {
      const query = `
        INSERT INTO playlist_items (id, playlist_id, content_id, urutan, durasi_detik, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      const { rows } = await pool.query(query, [itemId, playlist_id, content_id, urutan, durasi_detik, createdAt]);
      broadcastToAdmins({ type: 'playlist_items_updated', payload: { playlist_id } });
      return res.status(201).json(rows[0]);
    } catch (err) {
      console.warn(`[DB addPlaylistItem fallback]: ${err.message}`);
    }
  }

  const newItem = { id: itemId, playlist_id, content_id, urutan, durasi_detik, created_at: createdAt };
  memoryPlaylistItems.push(newItem);
  broadcastToAdmins({ type: 'playlist_items_updated', payload: { playlist_id } });
  return res.status(201).json(newItem);
};

// DELETE /api/playlists/items/:itemId
export const removePlaylistItem = async (req, res) => {
  const { itemId } = req.params;

  if (isConfigured()) {
    try {
      const { error } = await supabase.from('playlist_items').delete().eq('id', itemId);
      if (!error) {
        broadcastToAdmins({ type: 'playlist_items_updated', payload: { itemId } });
        return res.json({ success: true, message: 'Item playlist berhasil dihapus' });
      }
    } catch (err) {
      console.warn('[Supabase removePlaylistItem exception]:', err.message);
    }
  }

  if (checkDbStatus()) {
    try {
      const { rowCount } = await pool.query('DELETE FROM playlist_items WHERE id = $1', [itemId]);
      if (rowCount > 0) {
        broadcastToAdmins({ type: 'playlist_items_updated', payload: { itemId } });
        return res.json({ success: true, message: 'Item playlist berhasil dihapus' });
      }
    } catch (err) {
      console.warn(`[DB removePlaylistItem fallback]: ${err.message}`);
    }
  }

  memoryPlaylistItems = memoryPlaylistItems.filter((i) => i.id !== itemId);
  broadcastToAdmins({ type: 'playlist_items_updated', payload: { itemId } });
  return res.json({ success: true, message: 'Item playlist berhasil dihapus' });
};

// POST /api/playlists/:id/push — push semua item playlist ke device via WebSocket
export const pushPlaylistToDevice = async (req, res) => {
  const { id } = req.params;
  const { device_id } = req.body;

  if (!device_id) {
    return res.status(400).json({ message: 'device_id wajib diisi' });
  }

  // Ambil semua item playlist beserta data konten
  let items = [];

  if (isConfigured()) {
    try {
      const { data, error } = await supabase
        .from('playlist_items')
        .select('id, urutan, durasi_detik, content_id, contents(id, judul, tipe, payload)')
        .eq('playlist_id', id)
        .order('urutan', { ascending: true });

      if (!error && data) {
        items = data.map((item) => ({
          item_id: item.id,
          urutan: item.urutan,
          durasi_detik: item.durasi_detik || 10,
          content_id: item.content_id,
          judul: item.contents?.judul || '-',
          tipe: item.contents?.tipe || 'image',
          payload: item.contents?.payload || ''
        }));
      }
    } catch (err) {
      console.warn('[Supabase pushPlaylist exception]:', err.message);
    }
  }

  if (items.length === 0) {
    return res.status(400).json({ message: 'Playlist kosong atau tidak ditemukan' });
  }

  // Kirim event "playlist_push" ke device via WebSocket
  broadcastContentPush(device_id, {
    type: 'playlist',
    playlist_id: id,
    items
  });

  return res.json({
    success: true,
    message: `Playlist berhasil di-push ke device ${device_id}`,
    total_items: items.length,
    device_id
  });
};
