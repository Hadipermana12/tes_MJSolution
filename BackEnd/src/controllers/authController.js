import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mjsolution-secret-key-2026';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';

export const login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan password wajib diisi' });
  }

  // Verifikasi sederhana untuk admin (PRD 5.2.3: "verifikasi berbasis token sederhana")
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign(
      { username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      message: 'Login berhasil',
      token,
      user: {
        username,
        role: 'admin'
      }
    });
  }

  return res.status(401).json({ message: 'Kredensial tidak valid: Username atau password salah' });
};

export const getCurrentUser = (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
};

