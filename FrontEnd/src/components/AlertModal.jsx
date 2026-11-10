import React from 'react';
import { CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';

export default function AlertModal({ isOpen, onClose, alertData }) {
  if (!isOpen || !alertData) return null;

  const isSuccess = alertData.type === 'success';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 max-w-sm w-full text-center relative overflow-hidden transform transition-all animate-scale-in">
        
        {/* Subtle decorative background gradient glow */}
        <div 
          className={`absolute -top-16 -right-16 w-36 h-36 rounded-full blur-2xl opacity-40 pointer-events-none ${
            isSuccess ? 'bg-emerald-300' : 'bg-rose-300'
          }`} 
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon Circle */}
        <div className="my-2">
          {isSuccess ? (
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-500 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-9 h-9" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-rose-500 shadow-lg shadow-rose-500/10">
              <AlertCircle className="w-9 h-9" />
            </div>
          )}
        </div>

        {/* Title & Message */}
        <h3 className="text-lg font-bold text-slate-800 mt-3 flex items-center justify-center gap-1.5">
          {isSuccess && <Sparkles className="w-4 h-4 text-emerald-500" />}
          {alertData.title || (isSuccess ? 'Aksi Berhasil!' : 'Terjadi Kesalahan!')}
        </h3>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed px-2">
          {alertData.message || (isSuccess ? 'Operasi data berhasil diproses.' : 'Gagal memproses aksi. Silakan coba kembali.')}
        </p>

        {/* Action Button */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className={`w-full py-2.5 px-4 rounded-2xl text-xs font-semibold transition-all shadow-md active:scale-[0.98] ${
              isSuccess
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-emerald-500/25'
                : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-rose-500/25'
            }`}
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

