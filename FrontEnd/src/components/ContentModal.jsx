import React, { useState, useRef, useCallback } from 'react';
import { X, Image, Video, Globe, Link2, Sparkles, Upload, FileVideo, FileImage, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function ContentModal({ isOpen, onClose, onSave }) {
  const [judul, setJudul] = useState('');
  const [tipe, setTipe] = useState('image');
  const [urlPayload, setUrlPayload] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // ─── Reset seluruh state ───────────────────────────────────────────
  const resetState = () => {
    setJudul('');
    setTipe('image');
    setUrlPayload('');
    setFile(null);
    setPreview(null);
    setIsDragging(false);
    setLoading(false);
    setUploadProgress('');
    setError('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // ─── Pilih file (dari input atau drag-drop) ────────────────────────
  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    setError('');

    const isImage = selectedFile.type.startsWith('image/');
    const isVideo = selectedFile.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setError('Format tidak didukung. Pilih file gambar (JPG, PNG, GIF, WebP) atau video (MP4, WebM, MOV).');
      return;
    }

    if (selectedFile.size > 100 * 1024 * 1024) {
      setError('Ukuran file maksimal 100MB.');
      return;
    }

    setFile(selectedFile);
    setTipe(isImage ? 'image' : 'video');

    // Buat preview lokal menggunakan object URL
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
  };

  const handleInputChange = (e) => {
    handleFileSelect(e.target.files[0]);
    e.target.value = '';
  };

  // ─── Drag & Drop ──────────────────────────────────────────────────
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
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  }, []);

  // ─── Hapus file yang dipilih ──────────────────────────────────────
  const handleRemoveFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setError('');
  };

  // ─── Submit ───────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!judul.trim()) {
      setError('Judul konten wajib diisi.');
      return;
    }

    if (tipe === 'url') {
      if (!urlPayload.trim()) {
        setError('URL wajib diisi untuk tipe Web URL.');
        return;
      }
    } else {
      if (!file) {
        setError('Silakan pilih file gambar atau video terlebih dahulu.');
        return;
      }
    }

    setLoading(true);

    try {
      let savedContent;

      if (tipe === 'url') {
        setUploadProgress('Menyimpan URL konten...');
        savedContent = await api.createContent({ judul: judul.trim(), tipe: 'url', payload: urlPayload.trim() });
      } else {
        setUploadProgress('Mengunggah file ke media storage...');
        const formData = new FormData();
        formData.append('judul', judul.trim());
        formData.append('file', file);
        savedContent = await api.uploadContent(formData);
      }

      setUploadProgress('Selesai!');
      await onSave(savedContent);
      resetState();
      onClose();
    } catch (err) {
      console.error('[ContentModal submit error]:', err);
      setError(err?.response?.data?.message || err.message || 'Gagal menyimpan konten. Silakan coba kembali.');
      setUploadProgress('');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // ─── Render Early Return AFTER all hooks ───────────────────────────
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-white border border-slate-100 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-scale-in">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Unggah Gambar atau Video Baru</h3>
              <p className="text-[11px] text-slate-400">Pilih foto promosi atau video untuk diputar di layar TV</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">

          {/* Judul */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Nama / Judul Gambar atau Video <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Promo Diskon Hari Ini / Sambutan Tamu"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-xs font-medium"
            />
          </div>

          {/* Tipe Media */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Pilih Jenis Berkas</label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'image', label: 'Foto / Gambar', sub: 'JPG, PNG, WebP', icon: Image },
                { id: 'video', label: 'Video', sub: 'MP4, WebM', icon: Video },
                { id: 'url', label: 'Halaman Web', sub: 'Tautan URL', icon: Globe }
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = tipe === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setTipe(item.id);
                      if (item.id === 'url') handleRemoveFile();
                      else setUrlPayload('');
                      setError('');
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-500 text-emerald-700 shadow-sm shadow-emerald-500/10'
                        : 'bg-slate-50 border-slate-200/70 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1 text-emerald-600" />
                    <span>{item.label}</span>
                    <span className="text-[10px] text-slate-400 font-normal mt-0.5">{item.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input tergantung tipe */}
          {tipe === 'url' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                URL Halaman Web <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Link2 className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={urlPayload}
                  onChange={(e) => setUrlPayload(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 text-xs font-mono"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Unggah Berkas {tipe === 'image' ? 'Gambar' : 'Video'} <span className="text-rose-500">*</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept={tipe === 'image' ? 'image/*' : 'video/*'}
                onChange={handleInputChange}
                className="hidden"
              />

              {!file ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`cursor-pointer border-2 border-dashed rounded-3xl p-6 text-center transition-all ${
                    isDragging
                      ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
                      : 'border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/20 bg-slate-50/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                      {tipe === 'image' ? <FileImage className="w-6 h-6" /> : <FileVideo className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">
                        Klik untuk memilih berkas atau seret foto/video ke sini
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {tipe === 'image'
                          ? 'Bisa foto JPG, PNG, GIF, WebP (maksimal 100 MB)'
                          : 'Bisa video MP4, WebM, MOV (maksimal 100 MB)'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      className="mt-1 flex items-center gap-1.5 px-4 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 text-xs font-semibold rounded-xl shadow-sm transition"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-600" />
                      Pilih dari Komputer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
                  <div className="flex items-center gap-3 px-3.5 py-2.5 border-b border-slate-200/80 bg-white">
                    {tipe === 'image' ? (
                      <FileImage className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <FileVideo className="w-4 h-4 text-purple-600 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{file.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition"
                      title="Ganti berkas"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {tipe === 'image' && preview && (
                    <img
                      src={preview}
                      alt="preview"
                      className="w-full h-44 object-contain bg-slate-100 p-2"
                    />
                  )}
                  {tipe === 'video' && preview && (
                    <video
                      src={preview}
                      controls
                      className="w-full h-44 bg-slate-900"
                    />
                  )}

                  <div className="px-3.5 py-2 border-t border-slate-200/80 bg-white">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition"
                    >
                      Pilih file lain...
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-2xl">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-700 font-medium">{error}</p>
            </div>
          )}

          <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl text-xs font-semibold transition shadow-md shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{uploadProgress || 'Sedang mengunggah...'}</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Simpan & Siapkan untuk TV</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
