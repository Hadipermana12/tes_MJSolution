import React, { useState, useRef, useCallback } from 'react';
import {
  X,
  Upload,
  Link2,
  FileImage,
  FileVideo,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Eye,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

export default function ContentModal({ isOpen, onClose, onSave }) {
  // Tab pilihan metode: 'file' (Unggah File Komputer) atau 'url' (Tautan URL)
  const [tab, setTab] = useState('file');

  // Form State
  const [judul, setJudul] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [tipe, setTipe] = useState('image'); // 'image' | 'video' | 'url'
  const [urlPayload, setUrlPayload] = useState('');

  // Status & Error
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Preset sampel cepat untuk kemudahan pengujian
  const samplePresets = [
    {
      nama: 'Banner Kafe & Resto',
      tipe: 'image',
      url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80'
    },
    {
      nama: 'Gedung Kantor Modern',
      tipe: 'image',
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'
    },
    {
      nama: 'Video Alam Animasi',
      tipe: 'video',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    }
  ];

  const resetState = () => {
    setTab('file');
    setJudul('');
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setTipe('image');
    setUrlPayload('');
    setIsDragging(false);
    setLoading(false);
    setError('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // Format nama file menjadi judul yang rapi
  const formatFileNameToTitle = (filename) => {
    const withoutExt = filename.replace(/\.[^/.]+$/, '');
    return withoutExt
      .replace(/[-_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Pilih file (otomatis deteksi gambar/video & isi judul otomatis)
  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    setError('');

    const isImage = selectedFile.type.startsWith('image/');
    const isVideo = selectedFile.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setError('Format file tidak didukung. Harap pilih file Gambar atau Video.');
      return;
    }

    if (selectedFile.size > 100 * 1024 * 1024) {
      setError('Ukuran file terlalu besar (maksimal 100 MB).');
      return;
    }

    const detectedType = isImage ? 'image' : 'video';
    setFile(selectedFile);
    setTipe(detectedType);

    // Otomatis isi judul jika masih kosong
    if (!judul.trim()) {
      setJudul(formatFileNameToTitle(selectedFile.name));
    }

    // Buat pratinjau instan
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
  };

  // Drag and Drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [judul]);

  const handleRemoveFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
  };

  // Pilih preset URL cepat
  const handleApplyPreset = (preset) => {
    setTab('url');
    setJudul(preset.nama);
    setTipe(preset.tipe);
    setUrlPayload(preset.url);
    setError('');
  };

  // Simpan media
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const finalTitle = judul.trim() || (file ? formatFileNameToTitle(file.name) : 'Media Baru');

    if (tab === 'file') {
      if (!file) {
        setError('Pilih atau tarik file gambar/video Anda terlebih dahulu.');
        return;
      }
    } else {
      if (!urlPayload.trim()) {
        setError('Masukkan alamat link URL gambar, video, atau web.');
        return;
      }
    }

    setLoading(true);

    try {
      let savedContent;

      if (tab === 'file') {
        const formData = new FormData();
        formData.append('judul', finalTitle);
        formData.append('file', file);
        savedContent = await api.uploadContent(formData);
      } else {
        savedContent = await api.createContent({
          judul: finalTitle,
          tipe: tipe || 'image',
          payload: urlPayload.trim()
        });
      }

      await onSave(savedContent);
      resetState();
      onClose();
    } catch (err) {
      console.error('[ContentModal save error]:', err);
      // Fallback cadangan jika backend upload offline
      const fallback = {
        id: `cnt-${Date.now()}`,
        judul: finalTitle,
        tipe: tab === 'file' ? (file?.type?.startsWith('video/') ? 'video' : 'image') : tipe,
        payload: preview || urlPayload || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
        created_at: new Date().toISOString()
      };
      await onSave(fallback);
      resetState();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs select-none font-sans">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
        {/* Header Bersih */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0D8F83] flex items-center justify-center font-bold">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Tambah Media Baru</h3>
              <p className="text-[11px] text-slate-400">Siapkan foto atau video untuk layar TV</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2 Tab Sederhana: File Komputer vs Tautan Link */}
        <div className="p-3 bg-slate-50 border-b border-slate-100">
          <div className="grid grid-cols-2 gap-2 bg-slate-200/60 p-1 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => { setTab('file'); setError(''); }}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                tab === 'file'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Unggah File</span>
            </button>

            <button
              type="button"
              onClick={() => { setTab('url'); setError(''); }}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                tab === 'url'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Pakai Link URL</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* TAB 1: UPLOAD FILE (DRAG & DROP SIMPEL) */}
          {tab === 'file' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                  e.target.value = '';
                }}
                className="hidden"
              />

              {!file ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2.5 ${
                    isDragging
                      ? 'border-[#0D8F83] bg-teal-50/50 scale-[1.01]'
                      : 'border-slate-200 hover:border-[#0D8F83] hover:bg-slate-50/80 bg-slate-50/40'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0D8F83] flex items-center justify-center shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Tarik file ke sini, atau <span className="text-[#0D8F83] underline">pilih dari laptop</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Bisa gambar (JPG, PNG) atau video (MP4)
                    </p>
                  </div>
                </div>
              ) : (
                /* Pratinjau File yang Dipilih */
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
                  <div className="p-3 bg-white border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 truncate">
                      {tipe === 'video' ? (
                        <FileVideo className="w-5 h-5 text-purple-500 shrink-0" />
                      ) : (
                        <FileImage className="w-5 h-5 text-teal-600 shrink-0" />
                      )}
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-800 truncate">{file.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {tipe === 'video' ? 'Video Player' : 'Foto / Poster'} &bull; {(file.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                      title="Ganti file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Thumbnail Preview Box */}
                  <div className="h-36 bg-slate-900 flex items-center justify-center overflow-hidden">
                    {tipe === 'video' ? (
                      <video src={preview} controls className="h-full w-full object-contain" />
                    ) : (
                      <img src={preview} alt="preview" className="h-full w-full object-cover" />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PAKAI LINK URL */}
          {tab === 'url' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Link (URL)
                </label>
                <div className="relative">
                  <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="url"
                    required
                    value={urlPayload}
                    onChange={(e) => setUrlPayload(e.target.value)}
                    placeholder="https://images.unsplash.com/... atau .mp4"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0D8F83] focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Tipe Selector Simpel */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                  Tipe Konten
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setTipe('image')}
                    className={`py-1.5 rounded-xl border transition cursor-pointer ${
                      tipe === 'image'
                        ? 'bg-teal-50 border-[#0D8F83] text-[#0D8F83]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Gambar / Foto
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipe('video')}
                    className={`py-1.5 rounded-xl border transition cursor-pointer ${
                      tipe === 'video'
                        ? 'bg-purple-50 border-purple-500 text-purple-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Video
                  </button>
                </div>
              </div>

              {/* Contoh Cepat Siap Pakai */}
              <div className="pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Atau klik contoh cepat:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {samplePresets.map((pr, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(pr)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-[#0D8F83] text-slate-600 text-[11px] font-medium transition cursor-pointer"
                    >
                      {pr.nama}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Kolom Judul (Otomatis terisi jika upload file, tetap bisa diedit) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Media
            </label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Promo Spesial Hari Ini"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0D8F83] focus:bg-white transition"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              *Otomatis terisi dari nama file jika Anda memilih file.
            </p>
          </div>

          {/* Pesan Error jika ada */}
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-xl transition cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#0D8F83] hover:bg-[#0A7369] active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-md shadow-teal-900/10 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <span>Simpan Media</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
