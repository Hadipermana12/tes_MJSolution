import React, { useState, useEffect } from 'react';
import {
  Building2,
  Tv,
  Send,
  Layers,
  CheckCircle2,
  Sparkles,
  MapPin,
  Play,
  Users
} from 'lucide-react';

export default function GroupManagement({ devices = [], playlists = [], onBroadcastToGroup, onShowAlert }) {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(playlists[0]?.id || '');

  useEffect(() => {
    if ((!selectedPlaylistId || !playlists.some((p) => p.id === selectedPlaylistId)) && playlists.length > 0) {
      setSelectedPlaylistId(playlists[0].id);
    }
  }, [playlists, selectedPlaylistId]);

  // Define logical display zones
  const zones = [
    {
      id: 'zone-lobi',
      nama: 'Zona Lobi & Resepsionis',
      deskripsi: 'Display pintu masuk utama penyambutan tamu & klien',
      icon: Building2,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      deviceFilter: (d) => d.lokasi.toLowerCase().includes('lobi') || d.nama.toLowerCase().includes('lobi') || d.lokasi.toLowerCase().includes('lantai 1')
    },
    {
      id: 'zone-meeting',
      nama: 'Zona Ruang Rapat & VIP',
      deskripsi: 'Signage presentasi ruang pertemuan & eksekutif',
      icon: Users,
      color: 'text-teal-600 bg-teal-50 border-teal-100',
      deviceFilter: (d) => d.lokasi.toLowerCase().includes('rapat') || d.nama.toLowerCase().includes('rapat') || d.lokasi.toLowerCase().includes('vip') || d.lokasi.toLowerCase().includes('lantai 2')
    },
    {
      id: 'zone-publik',
      nama: 'Zona Kafetaria & Fasilitas Publik',
      deskripsi: 'Layar promosi menu, rehat staf, dan informasi umum',
      icon: Tv,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      deviceFilter: (d) => d.lokasi.toLowerCase().includes('kafetaria') || d.nama.toLowerCase().includes('kafetaria') || d.lokasi.toLowerCase().includes('dasar')
    }
  ];

  const handleBroadcastZone = (zone) => {
    const targetPlaylist = playlists.find((p) => p.id === selectedPlaylistId);
    if (!targetPlaylist) {
      onShowAlert && onShowAlert({
        type: 'error',
        title: 'Playlist Belum Dipilih',
        message: 'Pilih playlist yang ingin disiarkan ke seluruh zona ini.'
      });
      return;
    }

    const zoneDevices = devices.filter(zone.deviceFilter);
    if (zoneDevices.length === 0) {
      onShowAlert && onShowAlert({
        type: 'error',
        title: 'Tidak Ada Layar di Zona Ini',
        message: `Tidak ada perangkat yang terdaftar di ${zone.nama}.`
      });
      return;
    }

    onBroadcastToGroup && onBroadcastToGroup(zone.nama, zoneDevices, targetPlaylist);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Building2 className="w-4 h-4" />
            </div>
            Kelompok TV & Zona Ruangan
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Kirim tayangan serentak ke semua TV di area yang sama (misal: semua TV di Lobi atau Ruang Rapat)
          </p>
        </div>

        {/* Global Playlist Selector for Bulk Broadcast */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Pilih Tayangan:</span>
          <select
            value={selectedPlaylistId}
            onChange={(e) => setSelectedPlaylistId(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-800 font-semibold focus:outline-none focus:border-emerald-500"
          >
            {playlists.map((pl) => (
              <option key={pl.id} value={pl.id}>
                {pl.nama} ({pl.total_items || 0} slide)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Zones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {zones.map((zone) => {
          const Icon = zone.icon;
          const zoneDevices = devices.filter(zone.deviceFilter);
          const onlineCount = zoneDevices.filter((d) => d.status === 'online').length;

          return (
            <div
              key={zone.id}
              className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Zone Top Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${zone.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-100 text-slate-600">
                    {zoneDevices.length} TV Terpasang
                  </span>
                </div>

                <h4 className="font-bold text-slate-800 text-base">{zone.nama}</h4>
                <p className="text-xs text-slate-400 mt-0.5 mb-4">{zone.deskripsi}</p>

                {/* List of screens in this zone */}
                <div className="space-y-2 mb-5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Daftar TV di Ruangan Ini:
                  </p>
                  {zoneDevices.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Belum ada TV di ruangan ini</p>
                  ) : (
                    zoneDevices.map((dev) => (
                      <div
                        key={dev.id}
                        className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              dev.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                            }`}
                          />
                          <span className="font-semibold text-slate-700 truncate">{dev.nama}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{dev.status === 'online' ? '🟢 Online' : '⚪ Offline'}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Broadcast Button */}
              <button
                type="button"
                onClick={() => handleBroadcastZone(zone)}
                disabled={zoneDevices.length === 0}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-[0.98] text-white rounded-2xl text-xs font-semibold shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Tayangkan ke Semua TV di Ruangan Ini</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

