import React, { useState } from 'react';
import { X, Send, Film, CheckCircle2 } from 'lucide-react';

export default function PushContentModal({
  isOpen,
  onClose,
  targetDevice,
  contents = [],
  onPush
}) {
  const [selectedContentId, setSelectedContentId] = useState(
    contents[0]?.id || ''
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !targetDevice) return null;

  const handlePush = async () => {
    const content = contents.find((c) => c.id === selectedContentId);
    if (!content) return;

    setLoading(true);
    await onPush(targetDevice.id, content);
    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-white border border-slate-100 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Tayangkan ke Layar TV
              </h3>
              <p className="text-[11px] text-slate-400">
                Layar Tujuan: <strong className="text-slate-600">{targetDevice.nama}</strong> ({targetDevice.lokasi})
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

        {/* Content Selector */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Pilih Foto atau Video yang Ingin Diputar:
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {contents.map((content) => {
                const isSelected = selectedContentId === content.id;
                return (
                  <div
                    key={content.id}
                    onClick={() => setSelectedContentId(content.id)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-500 text-emerald-900 shadow-sm'
                        : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>
                        <Film className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold truncate">
                          {content.judul}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold">
                          Jenis: {content.tipe === 'image' ? 'Gambar' : content.tipe === 'video' ? 'Video' : 'Web URL'}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
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
              type="button"
              disabled={loading || !selectedContentId}
              onClick={handlePush}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl text-xs font-semibold transition shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              {success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  Berhasil Ditayangkan!
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {loading ? 'Menayangkan...' : 'Tampilkan di TV Sekarang'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
