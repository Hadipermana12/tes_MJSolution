import React, { useState } from 'react';
import {
  Film,
  Plus,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
  Video,
  Globe,
  Eye,
  X,
  Sparkles
} from 'lucide-react';

export default function ContentManagement({
  contents = [],
  onOpenAddModal,
  onDeleteContent,
  externalSearch = ''
}) {
  const [previewItem, setPreviewItem] = useState(null);

  const filteredContents = contents.filter((item) => {
    if (!externalSearch) return true;
    return (
      item.judul.toLowerCase().includes(externalSearch.toLowerCase()) ||
      item.tipe.toLowerCase().includes(externalSearch.toLowerCase()) ||
      item.payload.toLowerCase().includes(externalSearch.toLowerCase())
    );
  });

  const getBadgeForType = (type) => {
    switch (type) {
      case 'video':
        return {
          icon: Video,
          text: 'Video MP4',
          bg: 'bg-purple-50 text-purple-700 border-purple-200/60'
        };
      case 'url':
        return {
          icon: Globe,
          text: 'Web iFrame',
          bg: 'bg-teal-50 text-teal-700 border-teal-200/60'
        };
      default:
        return {
          icon: ImageIcon,
          text: 'Gambar',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
        };
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Film className="w-4 h-4" />
            </div>
            Koleksi Gambar & Video
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Semua foto promosi, video informasi, dan halaman web yang siap diputar di layar TV
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-semibold rounded-2xl shadow-sm transition active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          + Unggah Foto / Video
        </button>
      </div>

      {/* Grid of Contents */}
      {filteredContents.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-xs">
          Belum ada foto atau video tersimpan. Klik tombol "+ Unggah Foto / Video" di atas untuk menambahkan.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredContents.map((item) => {
            const badge = getBadgeForType(item.tipe);
            const BadgeIcon = badge.icon;
            return (
              <div
                key={item.id}
                className="bg-white border border-slate-100 rounded-3xl overflow-hidden flex flex-col group hover:shadow-lg hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all duration-200"
              >
                {/* Visual Thumbnail */}
                <div className="h-44 bg-slate-50 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                  {item.tipe === 'image' ? (
                    <img
                      src={item.payload}
                      alt={item.judul}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : item.tipe === 'video' ? (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 mb-1.5 shadow-sm">
                        <Video className="w-8 h-8" />
                      </div>
                      <span className="text-[10px] font-mono font-medium text-slate-500">Video Media Asset</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="p-3 rounded-2xl bg-teal-50 text-teal-600 mb-1.5 shadow-sm">
                        <Globe className="w-8 h-8" />
                      </div>
                      <span className="text-[10px] font-mono font-medium text-slate-500">Web URL Portal</span>
                    </div>
                  )}

                  {/* Type Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold border backdrop-blur-md shadow-sm ${badge.bg}`}
                    >
                      <BadgeIcon className="w-3 h-3" />
                      {badge.text}
                    </span>
                  </div>

                  {/* Hover Quick Preview Action */}
                  <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 backdrop-blur-[2px]">
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="p-2.5 rounded-2xl bg-white text-slate-700 hover:text-emerald-600 shadow-md hover:scale-105 transition"
                      title="Pratinjau Layar"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <a
                      href={item.payload}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-2xl bg-white text-slate-700 hover:text-teal-600 shadow-md hover:scale-105 transition"
                      title="Buka File Asli"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Content Info */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm truncate" title={item.judul}>
                      {item.judul}
                    </h4>
                    <p
                      className="text-xs text-slate-400 truncate font-mono mt-1"
                      title={item.payload}
                    >
                      {item.payload}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-medium text-slate-400">
                      {new Date(item.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                    <button
                      onClick={() => onDeleteContent(item.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Hapus Aset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-100 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl animate-scale-in">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800 truncate">
                  Pratinjau: {previewItem.judul}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-lg">
                  {previewItem.payload}
                </p>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-50 flex items-center justify-center min-h-[360px]">
              {previewItem.tipe === 'image' && (
                <img
                  src={previewItem.payload}
                  alt={previewItem.judul}
                  className="max-h-[500px] w-auto max-w-full rounded-2xl object-contain shadow-md"
                />
              )}
              {previewItem.tipe === 'video' && (
                <video
                  src={previewItem.payload}
                  controls
                  autoPlay
                  className="max-h-[500px] w-full rounded-2xl shadow-md"
                />
              )}
              {previewItem.tipe === 'url' && (
                <iframe
                  src={previewItem.payload}
                  title={previewItem.judul}
                  className="w-full h-[450px] rounded-2xl border border-slate-200 bg-white"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
