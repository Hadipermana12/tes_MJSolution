import React from 'react';
import {
  Search,
  RefreshCw,
  Plus,
  Calendar,
  Megaphone,
  ChevronRight,
  Home,
  Menu
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
  currentUser,
  onToggleMobileSidebar
}) {
  const getViewMeta = () => {
    switch (currentView) {
      case 'media':
        return {
          section: 'Koleksi Konten Media',
          title: 'Daftar Konten Media',
          actionText: '+ Tambah Media',
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
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/70 px-4 sm:px-6 flex items-center justify-between select-none sticky top-0 z-30 shrink-0 gap-2 sm:gap-4 shadow-2xs">
      {/* ── Standard CMS Breadcrumb with Mobile Hamburger ── */}
      <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-medium text-slate-500 min-w-0">
        {/* Mobile/Tablet Hamburger Toggle */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition -ml-1 shrink-0 cursor-pointer"
          title="Buka Menu Navigasi"
        >
          <Menu className="w-5 h-5 text-[#0D8F83]" />
        </button>

        {/* Breadcrumb Links */}
        <div className="flex items-center gap-1.5 sm:gap-2 truncate">
          <Link
            to="/dashboard"
            className="hidden sm:flex items-center gap-1.5 text-slate-400 hover:text-[#0D8F83] transition shrink-0"
            title="Beranda CMS"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="font-semibold text-slate-600 hover:text-[#0D8F83]">CMS</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden sm:block shrink-0" />
          <Link
            to="/dashboard"
            className="text-slate-500 hover:text-[#0D8F83] transition hidden md:block truncate"
          >
            {meta.section}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden md:block shrink-0" />
          <span className="font-bold text-slate-800 truncate">{meta.title}</span>
        </div>
      </div>

      {/* ── Right Actions & Search (Standard CMS Toolbar) ── */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Search Input (Responsive Width) */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari..."
            value={searchTerm || ''}
            onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0D8F83] w-24 xs:w-32 sm:w-44 md:w-56 font-medium transition"
          />
        </div>

        {/* Date Badge (Laptop & Desktop) */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentDate}</span>
        </div>

        {/* Ticker Quick Launcher */}
        <button
          onClick={onOpenTickerModal}
          title="Ubah Pengumuman Berjalan di TV"
          className="p-1.5 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 text-slate-600 hover:text-[#0D8F83] transition cursor-pointer"
        >
          <Megaphone className="w-4 h-4 text-[#0D8F83]" />
        </button>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Perbarui Data Terbaru"
          className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-[#0D8F83] transition disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#0D8F83]' : ''}`} />
        </button>

        {/* Primary Action Button (Desktop & Tablet) */}
        {meta.actionText && (
          <button
            onClick={meta.onAction}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0D8F83] hover:bg-[#0B7D72] active:scale-[0.98] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{meta.actionText}</span>
          </button>
        )}

        {/* User Profile Pill */}
        <div className="hidden sm:flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200/80">
          <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200/80 flex items-center justify-center text-[#0D8F83] font-bold text-xs shrink-0 shadow-2xs">
            {currentUser ? currentUser.username.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="leading-tight text-left hidden md:block">
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
