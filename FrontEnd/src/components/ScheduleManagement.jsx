import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Play,
  CheckCircle2,
  Sparkles,
  Sun,
  Sunset,
  Moon,
  Tv,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function ScheduleManagement({ playlists = [], devices = [], onApplySchedule, onShowAlert }) {
  // Time-slot definitions with multi-target devices support
  const [schedules, setSchedules] = useState([
    {
      id: 'slot-pagi',
      nama: 'Slot Pagi (08:00 - 12:00)',
      icon: Sun,
      color: 'text-amber-500 bg-amber-50 border-amber-100',
      jamMulai: '08:00',
      jamSelesai: '12:00',
      playlistId: playlists[0]?.id || '',
      targetDeviceIds: devices.map((d) => d.id),
      deskripsi: 'Materi penyambutan tamu, profil perusahaan, dan pengumuman pagi'
    },
    {
      id: 'slot-siang',
      nama: 'Slot Siang (12:00 - 17:00)',
      icon: Sunset,
      color: 'text-emerald-500 bg-emerald-50 border-emerald-100',
      jamMulai: '12:00',
      jamSelesai: '17:00',
      playlistId: playlists[1]?.id || playlists[0]?.id || '',
      targetDeviceIds: devices.map((d) => d.id),
      deskripsi: 'Materi promosi produk digital, penawaran khusus, dan menu kafetaria'
    },
    {
      id: 'slot-malam',
      nama: 'Slot Malam (17:00 - 22:00)',
      icon: Moon,
      color: 'text-indigo-500 bg-indigo-50 border-indigo-100',
      jamMulai: '17:00',
      jamSelesai: '22:00',
      playlistId: playlists[0]?.id || '',
      targetDeviceIds: devices.map((d) => d.id),
      deskripsi: 'Informasi penutupan kantor, event malam, dan kontak darurat'
    }
  ]);

  // Determine current active slot based on local time
  const getCurrentHour = () => new Date().getHours();
  const currentHour = getCurrentHour();

  // Sinkronkan jadwal otomatis jika ada playlist baru ditambahkan atau diubah secara realtime
  useEffect(() => {
    if (playlists.length > 0) {
      setSchedules((prev) =>
        prev.map((s, idx) => ({
          ...s,
          playlistId: s.playlistId && playlists.some((p) => p.id === s.playlistId)
            ? s.playlistId
            : playlists[idx % playlists.length]?.id || playlists[0].id
        }))
      );
    }
  }, [playlists]);

  // Sinkronkan daftar device tujuan saat devices termuat atau berubah
  useEffect(() => {
    if (devices.length > 0) {
      setSchedules((prev) =>
        prev.map((s) => {
          if (!s.targetDeviceIds || s.targetDeviceIds.length === 0) {
            return { ...s, targetDeviceIds: devices.map((d) => d.id) };
          }
          const validIds = s.targetDeviceIds.filter((id) => devices.some((d) => d.id === id));
          return {
            ...s,
            targetDeviceIds: validIds.length > 0 ? validIds : devices.map((d) => d.id)
          };
        })
      );
    }
  }, [devices]);

  const isSlotActive = (slotId) => {
    if (slotId === 'slot-pagi') return currentHour >= 8 && currentHour < 12;
    if (slotId === 'slot-siang') return currentHour >= 12 && currentHour < 17;
    if (slotId === 'slot-malam') return currentHour >= 17 && currentHour < 22;
    return false;
  };

  const handlePlaylistChange = (slotId, newPlaylistId) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, playlistId: newPlaylistId } : s))
    );
  };

  const handleToggleAll = (slotId) => {
    setSchedules((prev) =>
      prev.map((s) => {
        if (s.id !== slotId) return s;
        const currentIds = s.targetDeviceIds || [];
        const isAllSelected = devices.length > 0 && currentIds.length === devices.length;
        return {
          ...s,
          targetDeviceIds: isAllSelected ? [] : devices.map((d) => d.id)
        };
      })
    );
  };

  const handleToggleDevice = (slotId, deviceId) => {
    setSchedules((prev) =>
      prev.map((s) => {
        if (s.id !== slotId) return s;
        const currentIds = s.targetDeviceIds || [];
        const nextIds = currentIds.includes(deviceId)
          ? currentIds.filter((id) => id !== deviceId)
          : [...currentIds, deviceId];
        return {
          ...s,
          targetDeviceIds: nextIds
        };
      })
    );
  };

  const handleApplyNow = (slot) => {
    const targetPlaylist = playlists.find((p) => p.id === slot.playlistId);
    if (!targetPlaylist) {
      onShowAlert && onShowAlert({
        type: 'error',
        title: 'Playlist Belum Dipilih',
        message: 'Pilih playlist yang ingin dijadwalkan pada slot ini terlebih dahulu.'
      });
      return;
    }

    const selectedIds = slot.targetDeviceIds || [];
    const targetDevices = devices.filter((d) => selectedIds.includes(d.id));

    if (targetDevices.length === 0) {
      onShowAlert && onShowAlert({
        type: 'error',
        title: 'Belum Ada Layar Dipilih',
        message: 'Pilih minimal satu layar TV tujuan untuk slot jadwal ini.'
      });
      return;
    }

    const isAll = targetDevices.length === devices.length;
    const targetLabel = isAll
      ? `seluruh (${targetDevices.length}) layar TV`
      : targetDevices.length === 1
      ? `layar ${targetDevices[0].nama}`
      : `${targetDevices.length} layar TV terpilih`;

    onApplySchedule && onApplySchedule(targetPlaylist, targetDevices, targetLabel);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Calendar className="w-4 h-4" />
            </div>
            Jadwal Tayang Otomatis
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Atur tayangan yang otomatis berubah sendiri di layar TV mengikuti waktu pagi, siang, dan malam
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100">
          <Clock className="w-4 h-4 text-emerald-600" />
          <span>Waktu Sekarang: {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
        </div>
      </div>

      {/* Grid of Time Slots */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {schedules.map((slot) => {
          const Icon = slot.icon;
          const active = isSlotActive(slot.id);
          const selectedPlaylistObj = playlists.find((p) => p.id === slot.playlistId);

          return (
            <div
              key={slot.id}
              className={`rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                active
                  ? 'bg-gradient-to-b from-emerald-50/50 to-white border-emerald-300 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-400/20'
                  : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
              }`}
            >
              <div>
                {/* Slot Top Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${slot.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {active ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500 text-white shadow-sm shadow-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      Aktif Sekarang
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-full">
                      Standby
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-slate-800 text-sm mb-1">{slot.nama}</h4>
                <p className="text-xs text-slate-400 mb-4">{slot.deskripsi}</p>

                {/* Playlist Selector for this slot */}
                <div className="mb-4">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Playlist yang Ditugaskan:
                  </label>
                  <select
                    value={slot.playlistId}
                    onChange={(e) => handlePlaylistChange(slot.id, e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500"
                  >
                    {playlists.length === 0 ? (
                      <option value="">Belum ada playlist</option>
                    ) : (
                      playlists.map((pl) => (
                        <option key={pl.id} value={pl.id}>
                          {pl.nama} ({pl.total_items || 0} slide)
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Target Device Multi-Select for this slot */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Target Layar TV:
                    </label>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      {(slot.targetDeviceIds || []).length === devices.length && devices.length > 0
                        ? `Semua TV (${devices.length})`
                        : `${(slot.targetDeviceIds || []).length} dari ${devices.length} TV`}
                    </span>
                  </div>

                  {/* Multi-Select Box */}
                  <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-2.5 space-y-2 text-xs">
                    {/* Toggle All Bar */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-xs">
                        <input
                          type="checkbox"
                          checked={devices.length > 0 && (slot.targetDeviceIds || []).length === devices.length}
                          onChange={() => handleToggleAll(slot.id)}
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                        />
                        <span>Pilih Semua Layar ({devices.length} TV)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleToggleAll(slot.id)}
                        className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 underline"
                      >
                        {(slot.targetDeviceIds || []).length === devices.length ? 'Batal Semua' : 'Centang Semua'}
                      </button>
                    </div>

                    {/* Individual TV Checkboxes */}
                    <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                      {devices.length === 0 ? (
                        <div className="text-[11px] text-slate-400 py-1 italic">Belum ada layar TV terdaftar</div>
                      ) : (
                        devices.map((d) => {
                          const isChecked = (slot.targetDeviceIds || []).includes(d.id);
                          return (
                            <label
                              key={d.id}
                              className={`flex items-center justify-between px-2 py-1.5 rounded-xl cursor-pointer transition select-none ${
                                isChecked
                                  ? 'bg-white border border-emerald-200/90 shadow-2xs font-semibold text-slate-800'
                                  : 'hover:bg-slate-100/70 text-slate-600'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleDevice(slot.id, d.id)}
                                  className="w-3.5 h-3.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                                />
                                <span className="text-[11px] truncate" title={`${d.nama} (${d.lokasi})`}>
                                  {d.nama}
                                </span>
                              </div>
                              <span className="text-[9px] font-mono shrink-0 pl-1">
                                {d.status === 'online' ? (
                                  <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                    Online
                                  </span>
                                ) : (
                                  <span className="text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                    Offline
                                  </span>
                                )}
                              </span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Selected Playlist Summary */}
                {selectedPlaylistObj && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 mb-4 space-y-1">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-500">Materi Tayang:</span>
                      <span className="text-emerald-700">{selectedPlaylistObj.nama}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Total Slide:</span>
                      <span>{selectedPlaylistObj.total_items || 0} konten bergantian</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {(() => {
                const selectedCount = (slot.targetDeviceIds || []).length;
                const isAll = selectedCount === devices.length && devices.length > 0;
                const singleDev = selectedCount === 1 ? devices.find((d) => d.id === slot.targetDeviceIds[0]) : null;

                let buttonLabel = '';
                if (selectedCount === 0) {
                  buttonLabel = 'Pilih Minimal 1 Layar TV';
                } else if (isAll) {
                  buttonLabel = active
                    ? `Tayangkan ke Semua TV (${devices.length}) Sekarang`
                    : `Terapkan Jadwal ke Semua TV (${devices.length})`;
                } else if (singleDev) {
                  buttonLabel = active
                    ? `Tayangkan ke ${singleDev.nama} Sekarang`
                    : `Terapkan Jadwal ke ${singleDev.nama}`;
                } else {
                  buttonLabel = active
                    ? `Tayangkan ke ${selectedCount} Layar Terpilih Sekarang`
                    : `Terapkan Jadwal ke ${selectedCount} Layar Terpilih`;
                }

                return (
                  <button
                    type="button"
                    disabled={selectedCount === 0}
                    onClick={() => handleApplyNow(slot)}
                    className={`w-full py-2.5 px-4 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${
                      active && selectedCount > 0
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20'
                        : selectedCount > 0
                        ? 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700'
                        : 'bg-slate-100 text-slate-400 border border-slate-200/60'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span className="truncate">{buttonLabel}</span>
                  </button>
                );
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

