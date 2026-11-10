import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, X, Sparkles, Info } from 'lucide-react';

export default function AlertModal({ isOpen, onClose, alertData, duration = 3200 }) {
  // Auto-dismiss otomatis tanpa perlu klik tombol
  useEffect(() => {
    if (!isOpen || !alertData) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [isOpen, alertData, duration, onClose]);

  if (!isOpen || !alertData) return null;

  const isSuccess = alertData.type === 'success';
  const isError = alertData.type === 'error';
  const isInfo = alertData.type === 'info';

  return (
    <aside
      aria-label="Pemberitahuan Sistem"
      className="fixed top-4 right-4 sm:top-5 sm:right-6 z-[100] max-w-sm w-[calc(100%-2rem)] sm:w-96 pointer-events-none select-none animate-slide-in-right"
    >
      <div
        className={`pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 shadow-xl shadow-slate-900/10 border flex items-start gap-3 relative overflow-hidden transition-all duration-300 ${
          isSuccess
            ? 'border-emerald-200/90 ring-1 ring-emerald-500/15'
            : isError
            ? 'border-rose-200/90 ring-1 ring-rose-500/15'
            : 'border-teal-200/90 ring-1 ring-teal-500/15'
        }`}
      >
        {/* Indikator Aksen Garis Kiri */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1.5 ${
            isSuccess ? 'bg-[#0D8F83]' : isError ? 'bg-rose-500' : 'bg-blue-500'
          }`}
        />

        {/* Ikon Bulat Status */}
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ml-1 shadow-2xs ${
            isSuccess
              ? 'bg-emerald-50 text-[#0D8F83]'
              : isError
              ? 'bg-rose-50 text-rose-500'
              : 'bg-teal-50 text-teal-600'
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 className="w-5 h-5 text-[#0D8F83]" />
          ) : isError ? (
            <AlertCircle className="w-5 h-5 text-rose-500" />
          ) : (
            <Sparkles className="w-5 h-5 text-teal-600" />
          )}
        </div>

        {/* Konten Teks Pesan */}
        <div className="flex-1 min-w-0 pr-1">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 truncate">
            {alertData.title || (isSuccess ? 'Aksi Berhasil' : isError ? 'Terjadi Kesalahan' : 'Pemberitahuan')}
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
            {alertData.message || (isSuccess ? 'Operasi berhasil diproses.' : '')}
          </p>
        </div>

        {/* Tombol Tutup Opsional (Hanya jika ingin ditutup lebih cepat) */}
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-lg transition shrink-0 cursor-pointer"
          title="Tutup pesan"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Progress bar animasi durasi otomatis di bagian bawah */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100 overflow-hidden">
          <div
            className={`h-full ${isSuccess ? 'bg-[#0D8F83]' : isError ? 'bg-rose-500' : 'bg-blue-500'}`}
            style={{
              animation: `shrinkWidth ${duration}ms linear forwards`
            }}
          />
        </div>
      </div>
    </aside>
  );
}
