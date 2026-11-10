import React from 'react';
import {
  Search,
  RefreshCw,
  Plus,
  Calendar,
  Megaphone,
  ChevronRight,
  Home
} from 'lucide-react';
import { Link } from '../router.jsx';

export default function TopHeader({
  currentView,
  onRefresh,
  isRefreshing,
  onOpenAddDevice,
  onOpenAddContent,
  onOpenTickerModal,
  searchTerm,
  setSearchTerm,
  currentUser
}) {
  const getViewMeta = () => {
    switch (currentView) {
      case 'media':
        return {
          section: 'Koleksi Media',
          title: 'Gambar & Video TV',
          actionText: '+ Unggah Foto/Video',
          onAction: onOpenAddContent
        };
      case 'playlists':
        return {
          section: 'Tayangan Otomatis',
          title: 'Playlist',
          actionText: null,
          onAction: null
        };
      case 'schedule':
        return {
          section: 'Tayangan Otomatis',
          title: 'Jadwal Siar TV',
          actionText: null,
          onAction: null
        };
      case 'groups':
        return {
          section: 'Lokasi & Ruangan',
          title: 'Kelompok TV per Ruangan',
          actionText: null,
          onAction: null
        };
      case 'devices':
        return {
          section: 'Layar & Display',
          title: 'Daftar Semua TV',
          actionText: '+ Pasang TV Baru',
          onAction: onOpenAddDevice
        };
      case 'client':
        return {
          section: 'Tampilan Display',
          title: 'Tonton Siaran TV (Layar Penuh)',
          actionText: null,
          onAction: null
        };
      default:
        return {
          section: 'Beranda',
          title: 'Ringkasan Layar TV',
          actionText: '+ Unggah Foto/Video',
          onAction: onOpenAddContent
        };
    }
  };

  const meta = getViewMeta();
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 flex items-center justify-between select-none sticky top-0 z-30 shrink-0">
      {/* ── Standard CMS Breadcrumb with Active Route Links ── */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 text-slate-400 hover:text-[#0D8F83] transition"
          title="Beranda CMS"
        >
          <Home className="w-3.5 h-3.5" />
          <span className="font-semibold text-slate-600 hover:text-[#0D8F83]">CMS</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <Link
          to="/dashboard"
          className="text-slate-500 hover:text-[#0D8F83] transition"
        >
          {meta.section}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="font-bold text-slate-800">{meta.title}</span>
      </div>

      {/* ── Right Actions & Search (Standard CMS Toolbar) ── */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari TV, gambar, video..."
            value={searchTerm || ''}
            onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0D8F83] w-44 md:w-56 font-medium transition"
          />
        </div>

        {/* Date Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentDate}</span>
        </div>

        {/* Ticker Quick Launcher */}
        <button
          onClick={onOpenTickerModal}
          title="Ubah Pengumuman Berjalan di TV"
          className="p-1.5 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 text-slate-600 hover:text-[#0D8F83] transition"
        >
          <Megaphone className="w-4 h-4 text-[#0D8F83]" />
        </button>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Perbarui Data Terbaru"
          className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-[#0D8F83] transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#0D8F83]' : ''}`} />
        </button>

        {/* Primary Action Button (Standard CMS Clean Style) */}
        {meta.actionText && (
          <button
            onClick={meta.onAction}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0D8F83] hover:bg-[#0B7D72] active:scale-[0.98] text-white text-xs font-semibold rounded-xl shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{meta.actionText}</span>
          </button>
        )}

        {/* User Profile Pill (PinHome Reference Header Style) */}
        <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200/80">
          <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200/80 flex items-center justify-center text-[#0D8F83] font-bold text-xs shrink-0 shadow-2xs">
            {currentUser ? currentUser.username.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="leading-tight text-left">
            <span className="block text-xs font-bold text-slate-800 leading-none">
              {currentUser ? currentUser.username : 'admin'}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">Online</span>
          </div>
        </div>
      </div>
    </header>
  );
}
