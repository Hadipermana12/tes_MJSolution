import { supabase, isConfigured } from '../config/supabase.js';
import { pool, checkDbStatus } from '../config/db.js';
import { broadcastToAdmins } from '../websocket/wsServer.js';
import crypto from 'crypto';

let memoryContents = [
  {
    id: 'cnt-001',
    judul: 'Banner Selamat Datang Tamu',
    tipe: 'image',
    payload: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 'cnt-002',
    judul: 'Video Showcase Produk Digital',
    tipe: 'video',
    payload: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    created_at: new Date().toISOString()
  },
  {
    id: 'cnt-003',
    judul: 'Live Dashboard Web Portal',
    tipe: 'url',
    payload: 'https://wikipedia.org',
    created_at: new Date().toISOString()
  }
];

export const getContents = async (req, res) => {
  // 1. Supabase Client
  if (isConfigured()) {
    try {
      const { data, error } = await supabase
        .from('contents')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) return res.json(data);
    } catch (err) {
      console.warn('[Supabase getContents exception]:', err.message);
    }
  }

  // 2. PostgreSQL Direct
  if (checkDbStatus()) {
    try {
      const { rows } = await pool.query('SELECT * FROM contents ORDER BY created_at DESC');
      return res.json(rows);
    } catch (err) {
      console.warn(`[DB getContents fallback]: ${err.message}`);
    }
  }

  return res.json(memoryContents);
};

export const getContentById = async (req, res) => {
  const { id } = req.params;

  if (isConfigured()) {
    try {
      const { data, error } = await supabase
        .from('contents')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) return res.json(data);
    } catch (err) {
      console.warn('[Supabase getContentById exception]:', err.message);
    }
  }

  if (checkDbStatus()) {
    try {
      const { rows } = await pool.query('SELECT * FROM contents WHERE id = $1', [id]);
      if (rows.length > 0) return res.json(rows[0]);
    } catch (err) {
      console.warn(`[DB getContentById fallback]: ${err.message}`);
    }
  }

  const found = memoryContents.find((c) => c.id === id);
  if (!found) return res.status(404).json({ message: 'Konten tidak ditemukan' });
  return res.json(found);
};

export const createContent = async (req, res) => {
  const { judul, tipe, payload } = req.body;
  if (!judul || !tipe || !payload) {
    return res.status(400).json({ message: 'Judul, tipe, dan payload wajib diisi' });
  }

  if (!['image', 'video', 'url'].includes(tipe)) {
    return res.status(400).json({ message: 'Tipe harus bernilai image, video, atau url' });
  }

  const id = `cnt-${crypto.randomBytes(3).toString('hex')}`;
  const createdAt = new Date().toISOString();

  if (isConfigured()) {
    try {
      const { data, error } = await supabase
        .from('contents')
        .insert([{ id, judul, tipe, payload, created_at: createdAt }])
        .select()
        .single();

      if (!error && data) {
        broadcastToAdmins({ type: 'content_created', payload: data });
        return res.status(201).json(data);
      }
    } catch (err) {
      console.warn('[Supabase createContent exception]:', err.message);
    }
  }

  if (checkDbStatus()) {
    try {
      const query = `
        INSERT INTO contents (id, judul, tipe, payload, created_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      const { rows } = await pool.query(query, [id, judul, tipe, payload, createdAt]);
      broadcastToAdmins({ type: 'content_created', payload: rows[0] });
      return res.status(201).json(rows[0]);
    } catch (err) {
      console.warn(`[DB createContent fallback]: ${err.message}`);
    }
  }

  const newContent = { id, judul, tipe, payload, created_at: createdAt };
  memoryContents.unshift(newContent);
  broadcastToAdmins({ type: 'content_created', payload: newContent });
  return res.status(201).json(newContent);
};

export const updateContent = async (req, res) => {
  const { id } = req.params;
  const { judul, tipe, payload } = req.body;

  if (isConfigured()) {
    try {
      const updateData = {};
      if (judul !== undefined) updateData.judul = judul;
      if (tipe !== undefined) updateData.tipe = tipe;
      if (payload !== undefined) updateData.payload = payload;

      const { data, error } = await supabase
        .from('contents')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) return res.json(data);
    } catch (err) {
      console.warn('[Supabase updateContent exception]:', err.message);
    }
  }

  if (checkDbStatus()) {
    try {
      const query = `
        UPDATE contents
        SET judul = COALESCE($1, judul),
            tipe = COALESCE($2, tipe),
            payload = COALESCE($3, payload)
        WHERE id = $4
        RETURNING *;
      `;
      const { rows } = await pool.query(query, [judul, tipe, payload, id]);
      if (rows.length > 0) return res.json(rows[0]);
    } catch (err) {
      console.warn(`[DB updateContent fallback]: ${err.message}`);
    }
  }

  const index = memoryContents.findIndex((c) => c.id === id);
  if (index === -1) return res.status(404).json({ message: 'Konten tidak ditemukan' });

  memoryContents[index] = {
    ...memoryContents[index],
    judul: judul || memoryContents[index].judul,
    tipe: tipe || memoryContents[index].tipe,
    payload: payload || memoryContents[index].payload
  };
  return res.json(memoryContents[index]);
};

// Upload File (image/video) → simpan ke folder uploads/ → catat ke database
export const uploadContent = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'File wajib diunggah' });
    }

    const { judul } = req.body;
    if (!judul || !judul.trim()) {
      return res.status(400).json({ message: 'Judul konten wajib diisi' });
    }

    // Deteksi tipe dari mimetype
    const tipe = req.file.mimetype.startsWith('image/') ? 'image' : 'video';

    // Payload: URL publik file yang di-serve dari /uploads/
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const payload = `${baseUrl}/uploads/${req.file.filename}`;

    const id = `cnt-${crypto.randomBytes(3).toString('hex')}`;
    const createdAt = new Date().toISOString();

    if (isConfigured()) {
      try {
        const { data, error } = await supabase
          .from('contents')
          .insert([{ id, judul: judul.trim(), tipe, payload, created_at: createdAt }])
          .select()
          .single();

        if (!error && data) {
          broadcastToAdmins({ type: 'content_created', payload: data });
          return res.status(201).json(data);
        }
        console.warn('[Supabase uploadContent error]:', error?.message);
      } catch (err) {
        console.warn('[Supabase uploadContent exception]:', err.message);
      }
    }

    if (checkDbStatus()) {
      try {
        const query = `
          INSERT INTO contents (id, judul, tipe, payload, created_at)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *;
        `;
        const { rows } = await pool.query(query, [id, judul.trim(), tipe, payload, createdAt]);
        broadcastToAdmins({ type: 'content_created', payload: rows[0] });
        return res.status(201).json(rows[0]);
      } catch (err) {
        console.warn(`[DB uploadContent fallback]: ${err.message}`);
      }
    }

    // Fallback in-memory
    const newContent = { id, judul: judul.trim(), tipe, payload, created_at: createdAt };
    memoryContents.unshift(newContent);
    broadcastToAdmins({ type: 'content_created', payload: newContent });
    return res.status(201).json(newContent);

  } catch (err) {
    console.error('[uploadContent error]:', err.message);
    return res.status(500).json({ message: 'Gagal mengunggah file', error: err.message });
  }
};

export const deleteContent = async (req, res) => {
  const { id } = req.params;

  if (isConfigured()) {
    try {
      const { error } = await supabase.from('contents').delete().eq('id', id);
      if (!error) {
        broadcastToAdmins({ type: 'content_deleted', payload: { id } });
        return res.json({ success: true, message: `Konten ${id} berhasil dihapus` });
      }
    } catch (err) {
      console.warn('[Supabase deleteContent exception]:', err.message);
    }
  }

  if (checkDbStatus()) {
    try {
      const { rowCount } = await pool.query('DELETE FROM contents WHERE id = $1', [id]);
      if (rowCount > 0) {
        broadcastToAdmins({ type: 'content_deleted', payload: { id } });
        return res.json({ success: true, message: `Konten ${id} berhasil dihapus` });
      }
    } catch (err) {
      console.warn(`[DB deleteContent fallback]: ${err.message}`);
    }
  }

  memoryContents = memoryContents.filter((c) => c.id !== id);
  broadcastToAdmins({ type: 'content_deleted', payload: { id } });
  return res.json({ success: true, message: `Konten ${id} berhasil dihapus` });
};
