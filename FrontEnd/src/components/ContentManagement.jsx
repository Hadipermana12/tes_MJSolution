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
  Play,
  Layers,
  Search,
  Send,
  Tv
} from 'lucide-react';
import PushToDeviceModal from './PushToDeviceModal';

export default function ContentManagement({
  contents = [],
  devices = [],
  onPushContent,
  onOpenAddModal,
  onDeleteContent,
  externalSearch = ''
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'image' | 'video' | 'url'
  const [previewItem, setPreviewItem] = useState(null);
  const [pushItem, setPushItem] = useState(null);

  // Filter berdasarkan pencarian global dan tab filter
  const filteredContents = contents.filter((item) => {
    // Filter tab
    if (activeTab !== 'all' && item.tipe !== activeTab) {
      return false;
    }

    // Filter search
    if (!externalSearch) return true;
    const query = externalSearch.toLowerCase();
    return (
      item.judul?.toLowerCase().includes(query) ||
      item.tipe?.toLowerCase().includes(query) ||
      item.payload?.toLowerCase().includes(query)
    );
  });

  // Hitung jumlah tiap jenis konten
  const countAll = contents.length;
  const countImages = contents.filter((c) => c.tipe === 'image').length;
  const countVideos = contents.filter((c) => c.tipe === 'video').length;
  const countUrls = contents.filter((c) => c.tipe === 'url').length;

  const getTypeBadge = (type) => {
    switch (type) {
      case 'video':
        return {
          text: 'Video',
          icon: Video,
          badgeClass: 'bg-purple-500/90 text-white'
        };
      case 'url':
        return {
          text: 'Web',
          icon: Globe,
          badgeClass: 'bg-blue-500/90 text-white'
        };
      default:
        return {
          text: 'Gambar',
          icon: ImageIcon,
          badgeClass: 'bg-emerald-600/90 text-white'
        };
    }
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* ── Top Bar: Judul Halaman & Tombol Tambah Media ── */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0D8F83] flex items-center justify-center font-bold shrink-0">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">
              Koleksi Konten Media
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Kelola gambar, video, dan tautan web yang siap disiarkan ke seluruh layar TV
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAddModal}
          className="px-4 py-2.5 bg-[#0D8F83] hover:bg-[#0A7369] active:scale-[0.98] text-white text-xs font-bold rounded-2xl shadow-md shadow-teal-900/10 transition flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Media</span>
        </button>
      </div>

      {/* ── Filter Tabs Ringkas ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
        {[
          { id: 'all', label: 'Semua Konten', count: countAll },
          { id: 'image', label: 'Gambar / Poster', count: countImages },
          { id: 'video', label: 'Video', count: countVideos },
          { id: 'url', label: 'Tautan Web', count: countUrls }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-2xl transition flex items-center gap-2 cursor-pointer shrink-0 border ${
                isActive
                  ? 'bg-white border-[#0D8F83] text-[#0D8F83] shadow-xs'
                  : 'bg-white/70 border-slate-200/80 text-slate-500 hover:bg-white hover:text-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                  isActive ? 'bg-teal-50 text-[#0D8F83]' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Grid Koleksi Konten Media yang Simpel & Bersih ── */}
      {filteredContents.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center mx-auto mb-3">
            <Film className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">Belum ada konten media</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {externalSearch
              ? `Tidak ditemukan media dengan kata kunci "${externalSearch}".`
              : 'Tambahkan gambar, video, atau tautan web pertama Anda untuk disiarkan ke TV.'}
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 px-4 py-2 bg-teal-50 hover:bg-teal-100 text-[#0D8F83] text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Media Sekarang</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredContents.map((item) => {
            const badge = getTypeBadge(item.tipe);
            const BadgeIcon = badge.icon;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200/80 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-950/5 transition-all overflow-hidden flex flex-col group"
              >
                {/* 16:9 Thumbnail Area */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden flex items-center justify-center">
                  {item.tipe === 'image' && (
                    <img
                      src={item.payload}
                      alt={item.judul}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  )}

                  {item.tipe === 'video' && (
                    <div className="relative w-full h-full bg-slate-950 flex items-center justify-center">
                      <video
                        src={item.payload}
                        className="w-full h-full object-cover opacity-75"
                        muted
                        preload="metadata"
                      />
                      <div className="absolute w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 ml-0.5" />
                      </div>
                    </div>
                  )}

                  {item.tipe === 'url' && (
                    <div className="w-full h-full bg-gradient-to-br from-blue-900 to-slate-900 flex flex-col items-center justify-center text-white/80 p-4 text-center">
                      <Globe className="w-8 h-8 text-blue-400 mb-1.5" />
                      <span className="text-[11px] font-mono text-blue-200 truncate max-w-full">
                        {item.payload}
                      </span>
                    </div>
                  )}

                  {/* Type Badge on Top-Left */}
                  <div className="absolute top-2.5 left-2.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs backdrop-blur-md ${badge.badgeClass}`}
                    >
                      <BadgeIcon className="w-3 h-3" />
                      <span>{badge.text}</span>
                    </span>
                  </div>

                  {/* Quick Preview Hover Trigger */}
                  <button
                    onClick={() => setPreviewItem(item)}
                    className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
                    title="Klik untuk melihat pratinjau"
                  >
                    <span className="px-3 py-1.5 rounded-xl bg-white/95 text-slate-800 font-bold text-xs shadow-md flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[#0D8F83]" />
                      Lihat
                    </span>
                  </button>
                </div>

                {/* Card Content Footer (Simpel & Rapi) */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      className="font-bold text-slate-800 text-xs line-clamp-1 group-hover:text-[#0D8F83] transition"
                      title={item.judul}
                    >
                      {item.judul}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {new Date(item.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* Action Buttons: Preview, Tayangkan ke TV & Hapus */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Pratinjau</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPushItem(item)}
                        className="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-[#0D8F83] text-[#0D8F83] hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs"
                        title="Tayangkan konten ini ke layar TV"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Tayangkan</span>
                      </button>

                      <button
                        onClick={() => onDeleteContent(item.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Hapus Konten"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal Pratinjau Bersih ── */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-scale-in">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="truncate mr-4">
                <h4 className="text-sm font-bold text-slate-800 truncate">
                  {previewItem.judul}
                </h4>
                <p className="text-[11px] text-slate-400 truncate max-w-md font-mono mt-0.5">
                  {previewItem.payload}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={previewItem.payload}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl text-slate-400 hover:text-[#0D8F83] hover:bg-teal-50 transition"
                  title="Buka di tab baru"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  title="Tutup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Media Display */}
            <div className="p-4 bg-slate-950 flex items-center justify-center min-h-[340px] max-h-[70vh] overflow-hidden">
              {previewItem.tipe === 'image' && (
                <img
                  src={previewItem.payload}
                  alt={previewItem.judul}
                  className="max-h-[60vh] w-auto max-w-full rounded-2xl object-contain shadow-lg"
                />
              )}

              {previewItem.tipe === 'video' && (
                <video
                  src={previewItem.payload}
                  controls
                  autoPlay
                  className="max-h-[60vh] w-full rounded-2xl shadow-lg"
                />
              )}

              {previewItem.tipe === 'url' && (
                <iframe
                  src={previewItem.payload}
                  title={previewItem.judul}
                  className="w-full h-[400px] rounded-2xl border border-slate-800 bg-white"
                />
              )}
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Tipe: <strong className="text-slate-800 capitalize">{previewItem.tipe}</strong></span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const target = previewItem;
                    setPreviewItem(null);
                    setPushItem(target);
                  }}
                  className="px-3.5 py-1.5 bg-[#0D8F83] hover:bg-[#0A7369] text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Tayangkan ke TV</span>
                </button>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Tayangkan Konten ke Layar TV ── */}
      <PushToDeviceModal
        isOpen={Boolean(pushItem)}
        onClose={() => setPushItem(null)}
        content={pushItem}
        devices={devices}
        onPush={onPushContent}
      />
    </div>
  );
}
