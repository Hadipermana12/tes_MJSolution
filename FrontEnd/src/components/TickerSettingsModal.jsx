import React, { useState } from 'react';
import { X, MessageSquare, Sparkles, CheckCircle2, Megaphone } from 'lucide-react';

export default function TickerSettingsModal({ isOpen, onClose, currentTicker, onSave }) {
  const [tickerText, setTickerText] = useState(currentTicker || 'Selamat Datang di MJ Solution Indonesia • Solusi Digital Signage Terintegrasi • Hubungi Tim Resepsionis untuk Informasi Lebih Lanjut');
  const [isEnabled, setIsEnabled] = useState(true);

  if (!isOpen) return null;

  const presets = [
    'Selamat Datang di MJ Solution Indonesia • Solusi Digital Signage Terintegrasi • Layanan Prima & Profesional',
    'Pengumuman: Jam Operasional Kantor 08.00 - 17.00 WIB • Harap Menjaga Ketertiban & Kebersihan',
    'Promo Spesial Bulan Ini: Dapatkan Penawaran Eksklusif Solusi Display Multimedia • Hubungi Sales Kami'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tickerText.trim()) return;
    onSave({
      text: tickerText.trim(),
      enabled: isEnabled
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-white border border-slate-100 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Pengumuman Berjalan di TV (Running Text)
              </h3>
              <p className="text-[11px] text-slate-400">
                Teks pengumuman yang berjalan di bagian bawah seluruh layar TV secara langsung
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
          {/* Status Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-800">Tampilkan Teks Berjalan di TV</p>
              <p className="text-[11px] text-slate-400">Nyalakan atau matikan pita teks berjalan di monitor</p>
            </div>
            <button
              type="button"
              onClick={() => setIsEnabled(!isEnabled)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                isEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md transform" />
            </button>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Pilihan Contoh Pesan (Klik untuk pakai):
            </label>
            <div className="space-y-1.5">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTickerText(preset)}
                  className="w-full text-left p-2.5 bg-slate-50 hover:bg-emerald-50/60 border border-slate-100 hover:border-emerald-200 rounded-xl text-[11px] text-slate-600 transition truncate"
                >
                  &bull; {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Tulis Pesan Pengumuman:
            </label>
            <textarea
              rows="3"
              required
              value={tickerText}
              onChange={(e) => setTickerText(e.target.value)}
              placeholder="Ketik teks berjalan yang ingin disiarkan..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 text-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 font-medium leading-relaxed"
            />
          </div>

          {/* Live Preview Box */}
          <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden text-xs">
            <span className="text-[10px] text-slate-400 font-mono block mb-1">Pratinjau Tampilan di TV:</span>
            <div className="bg-black/60 py-2 px-3 rounded-xl border border-slate-800 overflow-hidden text-emerald-400 font-semibold text-xs whitespace-nowrap">
              <span className="animate-marquee inline-block">{tickerText || 'Teks kosong...'}</span>
            </div>
          </div>

          {/* Footer Buttons */}
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
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl text-xs font-semibold shadow-md shadow-emerald-500/20 transition active:scale-[0.98]"
            >
              Simpan & Tampilkan di Semua TV
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

