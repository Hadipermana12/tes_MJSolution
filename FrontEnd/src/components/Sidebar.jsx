import React from 'react';
import {
  LayoutDashboard,
  Film,
  ListMusic,
  Calendar,
  Building2,
  Tv,
  Megaphone,
  LogOut,
  Monitor,
  ExternalLink,
  Sparkles,
  Activity,
  Layers,
  ChevronRight,
  X
} from 'lucide-react';
import { Link } from '../router.jsx';

export default function Sidebar({
  currentView,
  setCurrentView,
  isWsConnected,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onOpenTickerModal,
  devicesCount = 0,
  onlineDevicesCount = 0,
  contentsCount = 0,
  playlistsCount = 0,
  isMobileOpen = false,
  onCloseMobile = () => {}
}) {
  const menuItems = [
    {
      id: 'dashboard',
      path: '/dashboard',
      label: 'Ringkasan',
      icon: LayoutDashboard,
      badge: null,
      gradient: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/25',
      lightBg: 'bg-blue-50 text-blue-600',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      id: 'devices',
      path: '/devices',
      label: 'Layar TV',
      icon: Monitor,
      badge: devicesCount,
      gradient: 'from-emerald-400 to-teal-600',
      shadow: 'shadow-emerald-500/25',
      lightBg: 'bg-emerald-50 text-emerald-600',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      id: 'media',
      path: '/media',
      label: 'Koleksi Konten Media',
      icon: Film,
      badge: contentsCount,
      gradient: 'from-rose-500 to-pink-600',
      shadow: 'shadow-rose-500/25',
      lightBg: 'bg-rose-50 text-rose-600',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200'
    },
    {
      id: 'playlists',
      path: '/playlists',
      label: 'Playlist',
      icon: ListMusic,
      badge: playlistsCount,
      gradient: 'from-purple-500 to-indigo-600',
      shadow: 'shadow-purple-500/25',
      lightBg: 'bg-purple-50 text-purple-600',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      id: 'schedule',
      path: '/schedule',
      label: 'Jadwal Siar',
      icon: Calendar,
      badge: 'Auto',
      gradient: 'from-amber-400 to-orange-500',
      shadow: 'shadow-amber-500/25',
      lightBg: 'bg-amber-50 text-amber-600',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      id: 'groups',
      path: '/groups',
      label: 'Zona Ruangan',
      icon: Building2,
      badge: null,
      gradient: 'from-cyan-400 to-blue-600',
      shadow: 'shadow-cyan-500/25',
      lightBg: 'bg-cyan-50 text-cyan-600',
      badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200'
    },
    {
      id: 'client',
      path: '/player',
      label: 'Tonton di TV',
      icon: Tv,
      badge: 'Live',
      gradient: 'from-teal-400 to-emerald-600',
      shadow: 'shadow-teal-500/25',
      lightBg: 'bg-teal-50 text-teal-600',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200'
    },
    {
      id: 'ticker',
      label: 'Teks Berjalan',
      icon: Megaphone,
      isAction: true,
      action: onOpenTickerModal,
      badge: 'Atur',
      gradient: 'from-pink-500 to-fuchsia-600',
      shadow: 'shadow-pink-500/25',
      lightBg: 'bg-pink-50 text-pink-600',
      badgeColor: 'bg-pink-50 text-pink-700 border-pink-200'
    }
  ];

  return (
    <>
      {/* ── Mobile Backdrop Overlay ── */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 lg:w-64 bg-gradient-to-b from-[#0F8A7E] via-[#0D8F83] to-[#0A7369] text-white flex flex-col justify-between h-screen shrink-0 select-none overflow-y-auto overflow-x-hidden transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* ── 1. Subtle Micro-Dot Matrix Texture Overlay ── */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
            backgroundSize: '18px 18px'
          }}
        />

        {/* ── 2. Architectural Topographic Contour Lines SVG Texture ── */}
        <svg
          className="absolute -bottom-10 -left-10 w-80 h-96 opacity-[0.06] pointer-events-none"
          viewBox="0 0 320 380"
          fill="none"
        >
          <path d="M-40 60 Q 80 180 200 120 T 360 260" stroke="white" strokeWidth="2.5" />
          <path d="M-60 130 Q 60 250 180 190 T 340 330" stroke="white" strokeWidth="1.8" />
          <path d="M-30 200 Q 90 320 210 260 T 370 400" stroke="white" strokeWidth="2" />
          <circle cx="160" cy="220" r="110" stroke="white" strokeWidth="1.2" strokeDasharray="6 6" />
          <circle cx="160" cy="220" r="60" stroke="white" strokeWidth="1" strokeDasharray="3 3" />
        </svg>

        {/* ── 3. Ambient Radiant Glow Accents ── */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-teal-300/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Content wrapper with relative positioning over background textures */}
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            {/* ── Brand Logo Header with Glassmorphism & Mobile Close Button ── */}
            <div className="pt-5 pb-3 px-4 flex items-center justify-between gap-2">
              <Link
                to="/dashboard"
                onClick={() => {
                  setCurrentView('dashboard');
                  onCloseMobile();
                }}
                className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 shadow-md shadow-black/5 flex items-center gap-3 transition cursor-pointer group flex-1"
                title="Kembali ke Ringkasan CMS"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-emerald-300 to-teal-200 p-[2px] shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                  <div className="w-full h-full bg-[#0D8F83] rounded-[10px] flex items-center justify-center">
                    <Tv className="w-5 h-5 text-amber-300" />
                  </div>
                </div>

                <div className="leading-tight truncate flex-1">
                  <div className="flex items-center justify-between">
                    <h1 className="font-extrabold text-sm text-white tracking-tight truncate">
                      MJ Signage
                    </h1>
                    <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse shrink-0" />
                  </div>
                  <p className="text-[10px] text-teal-100/90 font-medium tracking-wide">
                    Smart Digital CMS
                  </p>
                </div>
              </Link>

              {/* Close button for Mobile/Tablet */}
              <button
                type="button"
                onClick={onCloseMobile}
                className="lg:hidden p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer shrink-0"
                title="Tutup Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

          {/* ── Section Label ── */}
          <div className="px-6 pt-2 pb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-bold text-teal-200/70 uppercase tracking-widest">
              Menu Navigasi
            </span>
            <span className="w-8 h-[1px] bg-white/15" />
          </div>

          {/* ── Navigation Menu with Colorful 3D Gradient Icon Badges ── */}
          <nav className="space-y-1 pb-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              if (isActive) {
                return (
                  <div key={item.id} className="relative pl-3">
                    {/* Top Concave Curve */}
                    <svg
                      className="absolute -top-5 right-0 w-5 h-5 pointer-events-none fill-white z-10"
                      viewBox="0 0 20 20"
                    >
                      <path d="M20 0 v20 h-20 A 20 20 0 0 0 20 0 Z" />
                    </svg>

                    {/* Active Tab Body with Link Route */}
                    {item.path ? (
                      <Link
                        to={item.path}
                        onClick={() => {
                          setCurrentView(item.id);
                          onCloseMobile();
                        }}
                        className="relative z-10 w-full flex items-center justify-between pl-4 pr-4 py-2.5 bg-white text-slate-800 font-bold text-xs rounded-l-3xl shadow-xs text-left transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3 truncate">
                          {/* Colorful Gradient Icon Tile */}
                          <div
                            className={`w-8 h-8 rounded-xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center shadow-md ${item.shadow} shrink-0`}
                          >
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="truncate tracking-wide text-slate-800 font-bold text-xs">
                            {item.label}
                          </span>
                        </div>

                        {item.badge !== null && item.badge !== undefined && (
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          setCurrentView(item.id);
                          onCloseMobile();
                        }}
                        className="relative z-10 w-full flex items-center justify-between pl-4 pr-4 py-2.5 bg-white text-slate-800 font-bold text-xs rounded-l-3xl shadow-xs text-left transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div
                            className={`w-8 h-8 rounded-xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center shadow-md ${item.shadow} shrink-0`}
                          >
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="truncate tracking-wide text-slate-800 font-bold text-xs">
                            {item.label}
                          </span>
                        </div>

                        {item.badge !== null && item.badge !== undefined && (
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    )}

                    {/* Bottom Concave Curve */}
                    <svg
                      className="absolute -bottom-5 right-0 w-5 h-5 pointer-events-none fill-white z-10"
                      viewBox="0 0 20 20"
                    >
                      <path d="M20 20 v-20 h-20 A 20 20 0 0 1 20 20 Z" />
                    </svg>
                  </div>
                );
              }

              return (
                <div key={item.id} className="pl-3 pr-3">
                  {item.isAction ? (
                    <button
                      onClick={() => {
                        item.action();
                        onCloseMobile();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-teal-100 hover:text-white hover:bg-white/10 rounded-2xl text-xs font-semibold transition-all text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div
                          className={`w-8 h-8 rounded-xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center shadow-sm opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all shrink-0`}
                        >
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="truncate tracking-wide text-teal-50 group-hover:text-white font-medium">
                          {item.label}
                        </span>
                      </div>

                      {item.badge !== null && item.badge !== undefined && (
                        <span
                          className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-pink-400/30 text-pink-100 font-bold border border-pink-300/30"
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ) : (
                    <Link
                      to={item.path || '/dashboard'}
                      onClick={() => {
                        setCurrentView(item.id);
                        onCloseMobile();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-teal-100 hover:text-white hover:bg-white/10 rounded-2xl text-xs font-semibold transition-all text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 truncate">
                        {/* Colorful Gradient Icon Tile on Inactive Item */}
                        <div
                          className={`w-8 h-8 rounded-xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center shadow-sm opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all shrink-0`}
                        >
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="truncate tracking-wide text-teal-50 group-hover:text-white font-medium">
                          {item.label}
                        </span>
                      </div>

                      {item.badge !== null && item.badge !== undefined && (
                        <span
                          className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white/15 text-teal-100"
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* ── Bottom Section: Telemetry Widget & Elevated User Profile ── */}
        <div className="p-4 pb-6 space-y-2.5 shrink-0">
          {/* Hardware-Grade Telemetry / Signal Status Card */}
          <div className="p-3 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 text-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-300" />
                <span className="text-[10px] font-bold text-teal-100 uppercase tracking-wider">
                  Live Fleet Radar
                </span>
              </div>

              {/* Animated Equalizer / Frequency Bars */}
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-1 bg-emerald-400 rounded-full h-3 animate-pulse" />
                <span className="w-1 bg-emerald-300 rounded-full h-2 animate-bounce" />
                <span className="w-1 bg-teal-200 rounded-full h-3.5 animate-pulse" />
                <span className="w-1 bg-emerald-400 rounded-full h-1.5 animate-bounce" />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/10">
              <span className="text-teal-200 font-medium">
                {onlineDevicesCount > 0 ? `${onlineDevicesCount} Layar Siap Siar` : 'Standby Mode'}
              </span>

              <Link
                to="/player"
                onClick={() => setCurrentView('client')}
                className="text-[10px] font-bold text-amber-300 hover:text-white transition flex items-center gap-1 cursor-pointer"
                title="Buka Player Fullscreen"
              >
                <span>Live TV</span>
                <ExternalLink className="w-3 h-3 text-amber-300" />
              </Link>
            </div>
          </div>

          {/* Elevated User Account Card */}
          <div className="p-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 transition flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5 truncate">
              {/* Colorful Gradient Avatar Initial */}
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-300 via-emerald-300 to-teal-100 text-[#07534B] font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                {currentUser ? currentUser.username.charAt(0).toUpperCase() : 'A'}
              </div>

              <div className="truncate leading-tight">
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-white text-xs truncate">
                    {currentUser ? currentUser.username : 'admin'}
                  </p>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                </div>
                <p className="text-[10px] text-teal-200/90 font-medium mt-0.5">
                  {currentUser ? 'Administrator' : 'Pengelola Layar'}
                </p>
              </div>
            </div>

            {currentUser ? (
              <button
                onClick={onLogout}
                title="Keluar dari Akun (Logout)"
                className="p-1.5 rounded-xl text-teal-200 hover:text-white hover:bg-white/20 transition cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <Link
                to="/login"
                onClick={onOpenAuthModal}
                className="px-2.5 py-1 rounded-xl bg-white text-[#0D8F83] hover:bg-teal-50 text-[11px] font-bold transition shadow-xs cursor-pointer"
              >
                Masuk
              </Link>
            )}
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}
