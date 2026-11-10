import React, { useState, useEffect } from 'react';
import { X, Monitor, MapPin, Sparkles } from 'lucide-react';

export default function DeviceModal({ isOpen, onClose, onSave, editingDevice }) {
  const [nama, setNama] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingDevice) {
      setNama(editingDevice.nama || '');
      setLokasi(editingDevice.lokasi || '');
    } else {
      setNama('');
      setLokasi('');
    }
  }, [editingDevice, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nama.trim() || !lokasi.trim()) return;

    setLoading(true);
    await onSave({ nama, lokasi });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-white border border-slate-100 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {editingDevice ? 'Ubah Informasi Layar TV' : 'Pasang Layar TV Baru'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {editingDevice ? 'Sesuaikan nama atau letak ruangan TV' : 'Daftarkan layar TV baru di ruangan kantor'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Nama Layar TV
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: TV Lobi Utama / Monitor Resepsionis"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Lokasi Ruangan / Lantai
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Lantai 1, Dekat Meja Tamu"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-xs font-medium"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-[0.98] text-white rounded-2xl text-xs font-semibold transition shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : editingDevice ? 'Simpan Perubahan' : 'Pasang Layar TV'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
