import React, { useState } from 'react';
import {
  Monitor,
  Plus,
  Send,
  ExternalLink,
  Edit2,
  Trash2,
  Clock,
  MapPin,
  Search,
  Wifi,
  Sparkles,
  Layers
} from 'lucide-react';

export default function DeviceManagement({
  devices = [],
  onOpenAddModal,
  onOpenEditModal,
  onDeleteDevice,
  onOpenPushModal,
  onOpenClientView,
  externalSearch = ''
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const activeSearch = externalSearch || searchTerm;

  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.nama.toLowerCase().includes(activeSearch.toLowerCase()) ||
      device.lokasi.toLowerCase().includes(activeSearch.toLowerCase()) ||
      device.id.toLowerCase().includes(activeSearch.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ? true : device.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Belum terhubung';
    const date = new Date(timestamp);
    const now = new Date();
    const diffSecs = Math.floor((now - date) / 1000);

    if (diffSecs < 15) return 'Baru saja';
    if (diffSecs < 60) return `${diffSecs} detik lalu`;
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins} menit lalu`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderActiveContentCell = (device) => {
    const content = device.active_content;
    if (!content) {
      return (
        <button
          onClick={() => onOpenPushModal(device)}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-200 text-slate-600 hover:text-emerald-700 text-xs font-medium transition"
          title="Pilih foto atau video untuk ditampilkan di TV ini"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-500" />
          <span>+ Pasang Tayangan</span>
        </button>
      );
    }

    // Jika berupa playlist
    if (content.type === 'playlist' || Array.isArray(content.items)) {
      const itemCount = content.items?.length || 0;
      return (
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center shrink-0 text-indigo-600 font-bold shadow-sm">
            <Layers className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] font-mono leading-none">{itemCount}S</span>
          </div>
          <div className="max-w-[180px] truncate">
            <span className="text-slate-800 font-bold block truncate">
              {content.items?.[0]?.judul || 'Playlist Tayang'}
            </span>
            <span className="text-[10px] text-indigo-600 uppercase tracking-wider font-semibold">
              Playlist ({itemCount} slide)
            </span>
          </div>
        </div>
      );
    }

    // Jika konten tunggal
    const tipe = content.tipe || 'image';
    const judul = content.judul || 'Materi Tayang';

    return (
      <div className="flex items-center gap-2.5">
        {tipe === 'image' && content.payload ? (
          <img
            src={content.payload}
            alt={judul}
            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100 shadow-sm"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : tipe === 'video' ? (
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0 text-purple-600 font-bold text-[10px] uppercase shadow-sm">
            VIDEO
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 text-teal-600 font-bold text-[10px] uppercase shadow-sm">
            WEB
          </div>
        )}
        <div className="max-w-[180px] truncate">
          <span className="text-slate-800 font-semibold block truncate" title={judul}>
            {judul}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">
            {tipe === 'image' ? 'Gambar' : tipe === 'video' ? 'Video' : 'Halaman Web'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-8 select-none">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Monitor className="w-4 h-4" />
            </div>
            Daftar Semua Layar TV
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Pantau status TV di setiap ruangan, ubah tayangan, dan atur lokasi layar
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-700 font-medium focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Semua Status</option>
            <option value="online">🟢 Online</option>
            <option value="offline">⚪ Offline</option>
          </select>

          {/* Add Device Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-semibold rounded-2xl shadow-sm transition active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            + Pasang TV Baru
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4 text-left">NAMA LAYAR & RUANGAN</th>
              <th className="py-3.5 px-4 text-center">KONDISI TV</th>
              <th className="py-3.5 px-4 text-left">SEDANG MENAYANGKAN</th>
              <th className="py-3.5 px-4 text-center">TERAKHIR AKTIF</th>
              <th className="py-3.5 px-4 text-center">PILIHAN AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredDevices.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-slate-400 text-xs">
                  Tidak ada layar TV yang cocok dengan pencarian.
                </td>
              </tr>
            ) : (
              filteredDevices.map((device) => {
                const isOnline = device.status === 'online';
                return (
                  <tr
                    key={device.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Device & Location */}
                    <td className="py-4 px-4 text-left">
                      <div>
                        <div className="font-bold text-slate-800 flex items-center gap-2">
                          {device.nama}
                          <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">
                            {device.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{device.lokasi}</span>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge (Centered) */}
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                          isOnline
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                            : 'bg-slate-100 text-slate-500 border-slate-200/60'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isOnline
                              ? 'bg-emerald-500 animate-pulse'
                              : 'bg-slate-400'
                          }`}
                        />
                        {isOnline ? '🟢 Online' : '⚪ Offline'}
                      </span>
                    </td>

                    {/* Active Content */}
                    <td className="py-4 px-4 text-left text-xs">
                      {renderActiveContentCell(device)}
                    </td>

                    {/* Last Seen (Centered) */}
                    <td className="py-4 px-4 text-center text-xs text-slate-400">
                      <div className="inline-flex items-center justify-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatLastSeen(device.last_seen)}</span>
                      </div>
                    </td>

                    {/* Actions (Centered) */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Quick Push Content */}
                        <button
                          title="Ganti tayangan di TV ini"
                          onClick={() => onOpenPushModal(device)}
                          className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                        >
                          <Send className="w-4 h-4" />
                        </button>

                        {/* Open Player View */}
                        <button
                          title="Buka tampilan TV ini (Layar Penuh)"
                          onClick={() => onOpenClientView(device)}
                          className="p-2 rounded-xl text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>

                        {/* Edit Device */}
                        <button
                          title="Ubah nama & lokasi TV"
                          onClick={() => onOpenEditModal(device)}
                          className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete Device */}
                        <button
                          title="Hapus TV ini"
                          onClick={() => onDeleteDevice(device.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
