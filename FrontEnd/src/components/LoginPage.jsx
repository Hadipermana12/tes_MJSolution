import React, { useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  Tv,
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2,
  Radio,
  Server
} from 'lucide-react';
import { api } from '../services/api';

export default function LoginPage({ onLoginSuccess, onGuestAccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFillDemo = () => {
    setUsername('admin');
    setPassword('admin123');
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const data = await api.login(username.trim(), password);
      if (data && data.user) {
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
        'Kredensial tidak valid. Gunakan akun demo: admin / admin123'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#F0F6F5] flex items-center justify-center p-4 sm:p-6 select-none font-sans relative overflow-hidden">
      {/* ── Background Subtle Tech Grid Texture ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #0D8F83 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* ── Ambient Soft Glow Orbs ── */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ── Main Dual-Card Authentication Container ── */}
      <div className="relative z-10 w-full max-w-4xl bg-white rounded-3xl shadow-2xl shadow-teal-950/10 border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[560px]">
        
        {/* ── Left Column: Brand Hero & Live System Highlights (5 cols) ── */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#0F8A7E] via-[#0D8F83] to-[#0A7369] p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle architectural contour lines in hero */}
          <svg
            className="absolute -bottom-12 -left-12 w-80 h-80 opacity-[0.08] pointer-events-none"
            viewBox="0 0 200 200"
            fill="none"
          >
            <circle cx="100" cy="100" r="80" stroke="white" strokeWidth="2" strokeDasharray="6 6" />
            <circle cx="100" cy="100" r="50" stroke="white" strokeWidth="1.5" />
            <path d="M0 60 Q 100 140 200 60" stroke="white" strokeWidth="2" />
          </svg>

          <div>
            {/* Brand Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-emerald-300 to-teal-100 p-0.5 shadow-md shrink-0">
                <div className="w-full h-full bg-[#0D8F83] rounded-[14px] flex items-center justify-center">
                  <Tv className="w-5 h-5 text-amber-300" />
                </div>
              </div>
              <div className="leading-tight">
                <h1 className="font-extrabold text-lg text-white tracking-tight flex items-center gap-2">
                  MJ Signage
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                </h1>
                <p className="text-xs text-teal-100 font-medium">Digital Display CMS</p>
              </div>
            </div>

            {/* Hero Copy */}
            <div className="space-y-2 mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[11px] font-bold text-teal-100 border border-white/20">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                Autentikasi Token JWT (PRD 5.2.3)
              </span>
              <h2 className="text-2xl font-black text-white leading-snug">
                Pusat Kendali Layar Digital Terpadu
              </h2>
              <p className="text-xs text-teal-100/90 leading-relaxed">
                Kelola konten visual, susun playlist dinamis, dan jadwalkan siaran TV di seluruh gedung secara real-time.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-xs text-white/95 bg-white/10 p-2.5 rounded-2xl border border-white/10">
                <div className="w-6 h-6 rounded-lg bg-emerald-400/20 flex items-center justify-center text-emerald-300 shrink-0">
                  <Radio className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">WebSocket Live Real-time Broadcast</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-white/95 bg-white/10 p-2.5 rounded-2xl border border-white/10">
                <div className="w-6 h-6 rounded-lg bg-amber-400/20 flex items-center justify-center text-amber-300 shrink-0">
                  <KeyRound className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">Keamanan Sesi Token JWT 24 Jam</span>
              </div>
            </div>
          </div>

          {/* Bottom Telemetry Note */}
          <div className="pt-6 border-t border-white/15 flex items-center justify-between text-[11px] text-teal-100/80">
            <span>MJ Solution Indonesia</span>
            <span className="font-mono text-emerald-300 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Engine v2.4
            </span>
          </div>
        </div>

        {/* ── Right Column: Interactive Login Form (7 cols) ── */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-between bg-white">
          <div>
            {/* Header */}
            <div className="mb-6">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                Masuk ke Portal CMS
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Silakan masukkan kredensial administrator Anda untuk melanjutkan.
              </p>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2.5 animate-shake">
                <span className="p-0.5 rounded-full bg-rose-200 text-rose-800 font-bold shrink-0">!</span>
                <span className="flex-1">{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Username Administrator
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username (contoh: admin)"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white rounded-2xl text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#0D8F83] transition"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Kata Sandi (Password)
                  </label>
                  <button
                    type="button"
                    onClick={handleFillDemo}
                    className="text-[11px] font-bold text-[#0D8F83] hover:underline"
                  >
                    Gunakan Akun Demo
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi (contoh: admin123)"
                    className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white rounded-2xl text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#0D8F83] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Demo Account Helper Quick Card */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs">
                <div className="text-slate-600">
                  <span className="font-bold text-slate-800">Akun Bawaan:</span> admin &bull; admin123
                </div>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="px-2.5 py-1 rounded-xl bg-teal-50 border border-teal-200 text-[#0D8F83] hover:bg-teal-100 font-bold text-[11px] transition"
                >
                  Isi Otomatis
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-5 bg-gradient-to-r from-[#0D8F83] to-[#0A7369] hover:from-[#0B7D72] hover:to-[#09665D] active:scale-[0.99] text-white rounded-2xl text-xs font-bold shadow-lg shadow-teal-900/15 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memverifikasi Token JWT...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Dashboard CMS</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Guest / Demo Bypass Option */}
          {onGuestAccess && (
            <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Hanya ingin meninjau tampilan?</span>
              <button
                type="button"
                onClick={onGuestAccess}
                className="font-bold text-slate-600 hover:text-[#0D8F83] transition"
              >
                Masuk sebagai Tamu &rarr;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

