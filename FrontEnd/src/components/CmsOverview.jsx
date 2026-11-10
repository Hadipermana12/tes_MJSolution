import React, { useState } from 'react';
import {
  Monitor,
  Wifi,
  WifiOff,
  Film,
  ListMusic,
  Megaphone,
  Plus,
  Play,
  Layers,
  Send,
  ExternalLink,
  Clock,
  Tv,
  MapPin,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import DeviceManagement from './DeviceManagement';

export default function CmsOverview({
  devices = [],
  contents = [],
  playlists = [],
  runningTicker,
  onOpenAddDevice,
  onOpenAddContent,
  onOpenTickerModal,
  onOpenClientView,
  onOpenPushModal,
  setCurrentView,
  showTable = true,
  onOpenEditDevice,
  onDeleteDevice,
  globalSearch = ''
}) {
  const [deviceFilter, setDeviceFilter] = useState('all'); // 'all' | 'online' | 'offline'

  const totalDevices = devices.length;
  const onlineDevices = devices.filter((d) => d.status === 'online');
  const offlineDevices = devices.filter((d) => d.status === 'offline');
  const onlineCount = onlineDevices.length;
  const offlineCount = offlineDevices.length;

  const totalContents = contents.length;
  const imageCount = contents.filter((c) => c.tipe === 'image').length;
  const videoCount = contents.filter((c) => c.tipe === 'video').length;
  const urlCount = contents.filter((c) => c.tipe === 'url').length;

  const totalPlaylists = playlists.length;

  const filteredDevices = devices.filter((d) => {
    if (deviceFilter === 'online') return d.status === 'online';
    if (deviceFilter === 'offline') return d.status === 'offline';
    return true;
  });

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Belum terhubung';
    const date = new Date(timestamp);
    const now = new Date();
    const diffSecs = Math.floor((now - date) / 1000);
    if (diffSecs < 15) return 'Baru saja';
    if (diffSecs < 60) return `${diffSecs}s lalu`;
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m lalu`;
    return date.toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  // Current Hour Slot info
  const currentHour = new Date().getHours();
  const currentSlotName =
    currentHour >= 8 && currentHour < 12
      ? 'Slot Pagi (08:00 - 12:00)'
      : currentHour >= 12 && currentHour < 17
      ? 'Slot Siang (12:00 - 17:00)'
      : 'Slot Malam (17:00 - 22:00)';

  return (
    <div className="space-y-6 select-none font-sans">

      {/* ── 1. Minimalist Running Ticker Bar (Clean Vercel/Stripe Style) ── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl px-5 py-3 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-hidden flex-1">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Megaphone className="w-3.5 h-3.5 text-emerald-600" />
            <span>PENGUMUMAN DI SEMUA TV</span>
          </div>
          <p className="text-xs text-slate-600 font-medium truncate">
            {runningTicker?.text || 'Selamat Datang di MJ Solution Indonesia • Solusi Digital Signage Terintegrasi'}
          </p>
        </div>

        <button
          onClick={onOpenTickerModal}
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-semibold transition shrink-0"
        >
          Ubah Pengumuman &rarr;
        </button>
      </div>

      {/* ── 2. Modern Minimalist Stat KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Devices */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Total Layar TV</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
              <Monitor className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-slate-800">{totalDevices}</p>
            <span className="text-[11px] text-slate-400 font-medium">unit terpasang</span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-emerald-600 font-semibold">{onlineCount} Online</span>
            <span className="text-slate-400">{offlineCount} Offline</span>
          </div>
        </div>

        {/* Card 2: Online Status */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:border-emerald-300 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Koneksi Layar (Online)</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Wifi className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-emerald-600">{onlineCount}</p>
            <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              {totalDevices > 0 ? `${Math.round((onlineCount / totalDevices) * 100)}% Siap Tayang` : '0%'}
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Terhubung Langsung (Siap Siar)</span>
          </div>
        </div>

        {/* Card 3: Media Library */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Koleksi Gambar & Video</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-slate-800">{totalContents}</p>
            <span className="text-[11px] text-slate-400 font-medium">berkas tersimpan</span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{imageCount} Gambar</span>
            <span>&bull;</span>
            <span>{videoCount} Video</span>
            <span>&bull;</span>
            <span>{urlCount} Web</span>
          </div>
        </div>

        {/* Card 4: Playlist Studio */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Playlist Siap Putar</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <ListMusic className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-slate-800">{totalPlaylists}</p>
            <span className="text-[11px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md">
              Putar Otomatis (Multi-Slide)
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Rotasi Otomatis</span>
            <span className="text-indigo-600 font-medium cursor-pointer" onClick={() => setCurrentView('playlists')}>
              Kelola Playlist &rarr;
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. Quick Actions Toolbar (Minimalist Pill Style) ── */}
      <div className="bg-white rounded-2xl px-5 py-3 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-slate-500 font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Menu Cepat:
        </span>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenAddContent}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Unggah Foto / Video
          </button>
          <button
            onClick={onOpenAddDevice}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700 font-medium transition"
          >
            + Pasang TV Baru
          </button>
          <button
            onClick={() => setCurrentView('playlists')}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700 font-medium transition"
          >
            + Buat Playlist
          </button>
          <button
            onClick={() => setCurrentView('schedule')}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700 font-medium transition flex items-center gap-1"
          >
            <Calendar className="w-3 h-3 text-slate-400" />
            Jadwal: {currentSlotName}
          </button>
        </div>
      </div>

      {/* ── 4. TENGAH DASHBOARD: TABEL PERANGKAT LAYAR (ONLINE / OFFLINE) ── */}
      {showTable && (
        <DeviceManagement
          devices={devices}
          onOpenAddModal={onOpenAddDevice}
          onOpenEditModal={onOpenEditDevice}
          onDeleteDevice={onDeleteDevice}
          onOpenPushModal={onOpenPushModal}
          onOpenClientView={onOpenClientView}
          externalSearch={globalSearch}
        />
      )}

      {/* ── 5. Matriks Visual Kartu Layar Real-Time ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Header Section */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Tv className="w-4 h-4 text-emerald-600" />
              Tampilan Layar TV Saat Ini (Siaran Langsung)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Lihat foto atau video apa yang sedang diputar di setiap layar TV kantor secara langsung
            </p>
          </div>

          {/* Device Filter Tabs (Semua / Online / Offline) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setDeviceFilter('all')}
              className={`px-3 py-1 rounded-lg transition ${
                deviceFilter === 'all'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Semua ({totalDevices})
            </button>
            <button
              onClick={() => setDeviceFilter('online')}
              className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${
                deviceFilter === 'online'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-700 hover:text-emerald-800'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${deviceFilter === 'online' ? 'bg-white' : 'bg-emerald-500'}`} />
              Online ({onlineCount})
            </button>
            <button
              onClick={() => setDeviceFilter('offline')}
              className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${
                deviceFilter === 'offline'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Offline ({offlineCount})
            </button>
          </div>
        </div>

        {/* Device Cards Grid (Minimalist & Modern) */}
        <div className="p-6">
          {filteredDevices.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Tidak ada layar TV dengan status "{deviceFilter === 'online' ? 'Online' : deviceFilter === 'offline' ? 'Offline' : 'Semua'}".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {filteredDevices.map((device) => {
                const isOnline = device.status === 'online';
                const content = device.active_content;

                return (
                  <div
                    key={device.id}
                    className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                      isOnline
                        ? 'bg-white border-emerald-200/90 shadow-sm hover:shadow-md ring-1 ring-emerald-500/10'
                        : 'bg-slate-50/60 border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    {/* Top Device Header: Status dot + ID */}
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}
                        />
                        <span
                          className={`text-xs font-bold uppercase tracking-wider ${
                            isOnline ? 'text-emerald-700' : 'text-slate-500'
                          }`}
                        >
                          {isOnline ? '🟢 ONLINE' : '⚪ OFFLINE'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-semibold">
                        {device.id}
                      </span>
                    </div>

                    {/* Preview Media Box (Minimalist 16:9 Clean View) */}
                    <div className="h-32 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                      {content ? (
                        content.tipe === 'image' || (!content.tipe && content.payload?.match(/\.(jpeg|jpg|gif|png|webp)/i)) ? (
                          <img
                            src={content.payload}
                            alt={content.judul}
                            className="w-full h-full object-cover"
                          />
                        ) : content.tipe === 'video' || content.payload?.match(/\.(mp4|webm|ogg|mov)/i) ? (
                          <div className="text-center text-white">
                            <Film className="w-7 h-7 text-emerald-400 mx-auto mb-1" />
                            <span className="text-[10px] font-medium text-slate-300">Video Sedang Diputar</span>
                          </div>
                        ) : content.type === 'playlist' || Array.isArray(content.items) ? (
                          <div className="text-center text-white">
                            <ListMusic className="w-7 h-7 text-indigo-400 mx-auto mb-1" />
                            <span className="text-[10px] font-medium text-slate-300">Playlist ({content.items?.length || 0} slide)</span>
                          </div>
                        ) : (
                          <div className="text-center text-white">
                            <ExternalLink className="w-7 h-7 text-teal-400 mx-auto mb-1" />
                            <span className="text-[10px] font-medium text-slate-300">Tampilan Web</span>
                          </div>
                        )
                      ) : (
                        <div className="text-center text-slate-400 text-xs px-4">
                          <Tv className="w-6 h-6 mx-auto mb-1.5 opacity-40 text-slate-300" />
                          <span className="text-[11px] block text-slate-400 font-medium">Layar Kosong (Belum ada tayangan)</span>
                        </div>
                      )}

                      {/* Content Type Badge */}
                      {content && (
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-semibold text-emerald-300 uppercase">
                          {content.type === 'playlist' ? 'Playlist' : (content.tipe || 'Media')}
                        </div>
                      )}
                    </div>

                    {/* Device Details Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm truncate" title={device.nama}>
                          {device.nama}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5 mb-3 truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{device.lokasi}</span>
                        </div>

                        {/* Active Content Info Box */}
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs mb-3">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                            Sedang Ditayangkan:
                          </span>
                          <p className="font-semibold text-slate-700 truncate" title={content?.judul || content?.items?.[0]?.judul}>
                            {content?.judul || content?.items?.[0]?.judul || 'Belum ada tayangan'}
                          </p>
                        </div>
                      </div>

                      {/* Last seen Status */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Terakhir Aktif:
                        </span>
                        <span className="font-medium text-slate-600">{formatLastSeen(device.last_seen)}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => onOpenPushModal(device)}
                          className="py-1.5 px-3 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                          title="Ganti foto atau video yang sedang tayang di TV ini"
                        >
                          <Send className="w-3 h-3 text-emerald-600" />
                          Ganti Tayangan
                        </button>
                        <button
                          onClick={() => onOpenClientView(device)}
                          className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-sm"
                          title="Tonton tampilan TV ini dalam mode layar penuh"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Tonton di TV
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
