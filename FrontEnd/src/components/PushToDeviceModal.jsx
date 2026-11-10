import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Tv,
  CheckCircle2,
  MapPin,
  Sparkles,
  Layers,
  Radio,
  Check,
  CheckSquare,
  Square
} from 'lucide-react';

export default function PushToDeviceModal({
  isOpen,
  onClose,
  content,
  devices = [],
  onPush
}) {
  const [selectedDeviceIds, setSelectedDeviceIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Set default device saat modal terbuka
  useEffect(() => {
    if (isOpen && devices.length > 0) {
      // Prioritaskan TV yang sedang online, jika ada
      const firstOnline = devices.find((d) => d.status === 'online');
      setSelectedDeviceIds([firstOnline?.id || devices[0]?.id]);
      setSuccess(false);
      setLoading(false);
    }
  }, [isOpen, devices]);

  if (!isOpen || !content) return null;

  // Toggle seleksi device
  const toggleDevice = (devId) => {
    setSelectedDeviceIds((prev) => {
      if (prev.includes(devId)) {
        if (prev.length === 1) return prev; // Minimal 1 device terpilih
        return prev.filter((id) => id !== devId);
      } else {
        return [...prev, devId];
      }
    });
  };

  // Pilih Semua TV
  const selectAll = () => {
    setSelectedDeviceIds(devices.map((d) => d.id));
  };

  // Pilih TV Online Saja
  const selectOnlineOnly = () => {
    const onlineIds = devices.filter((d) => d.status === 'online').map((d) => d.id);
    if (onlineIds.length > 0) {
      setSelectedDeviceIds(onlineIds);
    } else {
      setSelectedDeviceIds(devices.map((d) => d.id));
    }
  };

  const handlePush = async () => {
    if (selectedDeviceIds.length === 0) return;

    setLoading(true);
    try {
      for (const devId of selectedDeviceIds) {
        await onPush(devId, content);
      }
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 900);
    } catch (err) {
      setLoading(false);
      console.error('Gagal mengirim tayangan:', err);
    }
  };

  const onlineCount = devices.filter((d) => d.status === 'online').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in select-none">
      <div className="bg-white border border-slate-100 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-scale-in flex flex-col max-h-[90vh]">
        {/* ── Modal Header ── */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50/50 via-white to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0D8F83] flex items-center justify-center shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Tayangkan Konten ke Layar TV
              </h3>
              <p className="text-[11px] text-slate-400">
                Pilih layar TV tujuan untuk menyiarkan konten ini secara real-time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Modal Body (Scrollable) ── */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Card Info Konten yang Dipilih */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3.5 shadow-2xs">
            <div className="w-16 h-12 rounded-xl bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center">
              {content.tipe === 'image' && (
                <img
                  src={content.payload}
                  alt={content.judul}
                  className="w-full h-full object-cover"
                />
              )}
              {content.tipe === 'video' && (
                <video
                  src={content.payload}
                  className="w-full h-full object-cover opacity-75"
                  muted
                />
              )}
              {content.tipe === 'url' && (
                <div className="text-[10px] text-teal-400 font-mono px-1 text-center">
                  WEB
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-100 text-[#0D8F83]">
                {content.tipe === 'image' ? 'Gambar' : content.tipe === 'video' ? 'Video' : 'Web URL'}
              </span>
              <h4 className="text-xs font-bold text-slate-800 truncate mt-1" title={content.judul}>
                {content.judul}
              </h4>
              <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                {content.payload}
              </p>
            </div>
          </div>

          {/* Quick Selection Buttons */}
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <Tv className="w-4 h-4 text-[#0D8F83]" />
              <span>Pilih Layar TV Tujuan ({selectedDeviceIds.length} dipilih):</span>
            </label>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={selectAll}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-[#0D8F83] transition cursor-pointer"
              >
                Semua TV ({devices.length})
              </button>
              {onlineCount > 0 && (
                <button
                  type="button"
                  onClick={selectOnlineOnly}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition cursor-pointer"
                >
                  🟢 Online Saja ({onlineCount})
                </button>
              )}
            </div>
          </div>

          {/* Device Selection List */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {devices.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                Belum ada layar TV yang terdaftar di sistem.
              </div>
            ) : (
              devices.map((device) => {
                const isSelected = selectedDeviceIds.includes(device.id);
                const isOnline = device.status === 'online';

                return (
                  <div
                    key={device.id}
                    onClick={() => toggleDevice(device.id)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50/70 border-[#0D8F83] text-teal-950 shadow-2xs'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Checkbox Icon */}
                      <div className="shrink-0">
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-lg bg-[#0D8F83] text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-lg border-2 border-slate-300 bg-white" />
                        )}
                      </div>

                      {/* Device Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold truncate text-slate-800">
                            {device.nama}
                          </p>
                          <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                            {device.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{device.lokasi}</span>
                          {device.active_content?.judul && (
                            <>
                              <span>•</span>
                              <span className="truncate text-slate-500 font-medium">
                                Saat ini: {device.active_content.judul}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 border ${
                        isOnline
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {isOnline ? '🟢 Online' : '⚪ Offline'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Modal Footer ── */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={loading || selectedDeviceIds.length === 0}
            onClick={handlePush}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0D8F83] hover:bg-[#0A7369] active:scale-[0.98] text-white rounded-2xl text-xs font-bold transition shadow-md shadow-teal-900/10 disabled:opacity-50 cursor-pointer"
          >
            {success ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Berhasil Ditayangkan!</span>
              </>
            ) : (
              <>
                <Send className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>
                  {loading
                    ? 'Menyiarkan ke TV...'
                    : `Tayangkan ke ${selectedDeviceIds.length} Layar TV`}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

