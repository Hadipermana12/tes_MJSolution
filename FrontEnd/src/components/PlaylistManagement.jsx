import React, { useState, useEffect } from 'react';
import {
  ListMusic,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  Layers,
  Tv,
  Play,
  CheckCircle2,
  X,
  Loader2
} from 'lucide-react';
import { api, apiClient } from '../services/api';

export default function PlaylistManagement({
  playlists = [],
  setPlaylists,
  onRefreshPlaylists,
  contents = [],
  devices = [],
  onShowAlert
}) {
  const [internalPlaylists, setInternalPlaylists] = useState([]);
  const effectivePlaylists = setPlaylists ? playlists : internalPlaylists;
  const updatePlaylists = setPlaylists || setInternalPlaylists;

  const [loading, setLoading] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');

  // Item form state
  const [selectedContentId, setSelectedContentId] = useState(contents[0]?.id || '');
  const [itemDuration, setItemDuration] = useState(10);

  // Push modal state
  const [isPushModalOpen, setIsPushModalOpen] = useState(false);
  const [pushTargetDeviceId, setPushTargetDeviceId] = useState(devices[0]?.id || '');
  const [pushLoading, setPushLoading] = useState(false);

  useEffect(() => {
    if (!selectedContentId && contents.length > 0) {
      setSelectedContentId(contents[0].id);
    }
  }, [contents, selectedContentId]);

  useEffect(() => {
    if (!pushTargetDeviceId && devices.length > 0) {
      setPushTargetDeviceId(devices[0].id);
    }
  }, [devices, pushTargetDeviceId]);

  const fetchPlaylists = async () => {
    if (onRefreshPlaylists) {
      onRefreshPlaylists();
      return;
    }
    setLoading(true);
    try {
      const data = await api.getPlaylists();
      setInternalPlaylists(data);
      if (data.length > 0 && !selectedPlaylist) {
        setSelectedPlaylist(data[0]);
        loadPlaylistDetails(data[0].id);
      }
    } catch (err) {
      console.warn('Gagal memuat playlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPlaylistDetails = async (id) => {
    try {
      const data = await api.getPlaylistById(id);
      if (data) {
        setSelectedPlaylist((prev) => ({
          ...prev,
          ...data,
          items: data.items || []
        }));
      }
    } catch (err) {
      console.warn('Gagal memuat detail playlist:', err);
    }
  };

  useEffect(() => {
    if (effectivePlaylists.length > 0 && !selectedPlaylist) {
      setSelectedPlaylist(effectivePlaylists[0]);
      loadPlaylistDetails(effectivePlaylists[0].id);
    }
  }, [effectivePlaylists, selectedPlaylist]);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const handleSelectPlaylist = (pl) => {
    setSelectedPlaylist({
      ...pl,
      items: selectedPlaylist?.id === pl.id && selectedPlaylist?.items ? selectedPlaylist.items : []
    });
    loadPlaylistDetails(pl.id);
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    try {
      const created = await api.createPlaylist({
        nama: newPlaylistName,
        deskripsi: newPlaylistDesc
      });
      updatePlaylists((prev) => [created, ...prev]);
      setNewPlaylistName('');
      setNewPlaylistDesc('');
      setIsAddModalOpen(false);
      handleSelectPlaylist(created);
      onShowAlert && onShowAlert({
        type: 'success',
        title: 'Playlist Dibuat!',
        message: `Playlist "${created.nama}" berhasil dibuat. Silakan tambahkan slide konten ke dalamnya.`
      });
    } catch (err) {
      onShowAlert && onShowAlert({
        type: 'error',
        title: 'Gagal Membuat Playlist',
        message: err.message
      });
    }
  };

  const handleDeletePlaylist = async (id) => {
    if (window.confirm('Hapus playlist ini beserta seluruh item slide di dalamnya?')) {
      try {
        await apiClient.delete(`/playlists/${id}`);
        updatePlaylists((prev) => prev.filter((p) => p.id !== id));
        setSelectedPlaylist(null);
        onShowAlert && onShowAlert({
          type: 'success',
          title: 'Playlist Dihapus',
          message: 'Playlist dan urutan slide berhasil dihapus dari sistem.'
        });
      } catch (err) {
        onShowAlert && onShowAlert({
          type: 'error',
          title: 'Gagal Menghapus Playlist',
          message: err.message
        });
      }
    }
  };

  const handleAddItemToPlaylist = async (e) => {
    e.preventDefault();
    if (!selectedPlaylist || !selectedContentId) return;

    try {
      await apiClient.post(`/playlists/${selectedPlaylist.id}/items`, {
        content_id: selectedContentId,
        durasi_detik: parseInt(itemDuration, 10) || 10,
        urutan: (selectedPlaylist.items?.length || 0) + 1
      });
      await loadPlaylistDetails(selectedPlaylist.id);
      await fetchPlaylists();
      onShowAlert && onShowAlert({
        type: 'success',
        title: 'Slide Ditambahkan!',
        message: `Konten berhasil dimasukkan ke playlist dengan durasi tayang ${itemDuration} detik.`
      });
    } catch (err) {
      onShowAlert && onShowAlert({
        type: 'error',
        title: 'Gagal Menambahkan Slide',
        message: err.message
      });
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await apiClient.delete(`/playlists/items/${itemId}`);
      await loadPlaylistDetails(selectedPlaylist.id);
      await fetchPlaylists();
      onShowAlert && onShowAlert({
        type: 'success',
        title: 'Slide Dihapus',
        message: 'Item konten berhasil dihapus dari playlist ini.'
      });
    } catch (err) {
      onShowAlert && onShowAlert({
        type: 'error',
        title: 'Gagal Menghapus Item',
        message: err.message
      });
    }
  };

  const handlePushPlaylist = async () => {
    if (!pushTargetDeviceId || !selectedPlaylist) return;
    setPushLoading(true);

    try {
      const res = await apiClient.post(`/playlists/${selectedPlaylist.id}/push`, {
        device_id: pushTargetDeviceId
      });
      setIsPushModalOpen(false);
      onShowAlert && onShowAlert({
        type: 'success',
        title: 'Playlist Sedang Berputar di Layar!',
        message: `Playlist "${selectedPlaylist.nama}" (${selectedPlaylist.items?.length || 0} slide) berhasil di-push ke layar ${pushTargetDeviceId}!`
      });
    } catch (err) {
      onShowAlert && onShowAlert({
        type: 'error',
        title: 'Gagal Push Playlist',
        message: err?.response?.data?.message || err.message
      });
    } finally {
      setPushLoading(false);
    }
  };

  const totalDurasi = (selectedPlaylist?.items || []).reduce(
    (sum, item) => sum + (item.durasi_detik || 10), 0
  );

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600">
              <ListMusic className="w-4 h-4" />
            </div>
            Manajemen Playlist
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Atur playlist gambar atau video untuk diputar bergantian di layar TV secara otomatis
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-semibold rounded-2xl shadow-sm transition active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          + Buat Playlist Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Playlist List */}
        <div className="space-y-2.5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Daftar Playlist Tersimpan
          </p>
          {effectivePlaylists.length === 0 ? (
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center text-xs text-slate-400">
              Belum ada playlist. Klik "+ Buat Playlist Baru" untuk memulai.
            </div>
          ) : (
            effectivePlaylists.map((pl) => {
              const isSelected = selectedPlaylist?.id === pl.id;
              return (
                <div
                  key={pl.id}
                  onClick={() => handleSelectPlaylist(pl)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 select-none ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20 translate-x-1'
                      : 'bg-slate-50 hover:bg-slate-100/80 border border-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm truncate flex items-center gap-2">
                      <Layers className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                      {pl.nama}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-white text-slate-500 border border-slate-200'
                      }`}
                    >
                      {pl.total_items || 0} slide
                    </span>
                  </div>
                  {pl.deskripsi && (
                    <p
                      className={`text-xs mt-1.5 truncate pl-6 ${
                        isSelected ? 'text-emerald-50' : 'text-slate-400'
                      }`}
                    >
                      {pl.deskripsi}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Playlist Detail & Items Sequence */}
        <div className="md:col-span-2 bg-slate-50/60 rounded-3xl border border-slate-100 p-6">
          {selectedPlaylist ? (
            <div>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/60 pb-4 mb-5 gap-3">
                <div>
                  <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
                    {selectedPlaylist.nama}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedPlaylist.deskripsi || 'Tidak ada deskripsi khusus.'}
                  </p>
                  {(selectedPlaylist.items?.length || 0) > 0 && (
                    <p className="text-[11px] font-medium text-emerald-600 mt-1.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Total Durasi Rotasi: {totalDurasi} detik ({Math.floor(totalDurasi / 60)}m {totalDurasi % 60}s)
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      if (!selectedPlaylist.items?.length) {
                        alert('Tambahkan konten ke playlist terlebih dahulu.');
                        return;
                      }
                      setIsPushModalOpen(true);
                    }}
                    disabled={(selectedPlaylist.items?.length || 0) === 0}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-semibold rounded-2xl shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Tayangkan playlist ini di layar TV"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Tayangkan Playlist
                  </button>

                  <button
                    onClick={() => handleDeletePlaylist(selectedPlaylist.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 border border-rose-100 rounded-2xl transition"
                    title="Hapus Urutan Ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add item form */}
              <form
                onSubmit={handleAddItemToPlaylist}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-3 mb-6 text-xs"
              >
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-slate-600 font-semibold mb-1.5">
                    Pilih Foto / Video dari Koleksi:
                  </label>
                  <select
                    value={selectedContentId}
                    onChange={(e) => setSelectedContentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-emerald-500"
                  >
                    {contents.length === 0 ? (
                      <option value="">Belum ada konten di pustaka</option>
                    ) : (
                      contents.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.judul} ({c.tipe === 'image' ? 'Gambar' : c.tipe === 'video' ? 'Video' : 'Web'})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="w-32">
                  <label className="block text-slate-600 font-semibold mb-1.5">
                    Lama Tampil:
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="3"
                      max="300"
                      value={itemDuration}
                      onChange={(e) => setItemDuration(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 font-mono text-xs focus:outline-none focus:border-emerald-500 pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-semibold">
                      detik
                    </span>
                  </div>
                </div>

                <div className="pt-5">
                  <button
                    type="submit"
                    disabled={!selectedContentId || contents.length === 0}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold transition shadow-sm disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    + Masukkan Slide
                  </button>
                </div>
              </form>

              {/* Items sequence list */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Urutan Tayang Konten ({selectedPlaylist.items?.length || 0} slide):
                </p>

                {(!selectedPlaylist.items || selectedPlaylist.items.length === 0) ? (
                  <div className="p-8 bg-white rounded-2xl border border-slate-100 text-center text-xs text-slate-400 shadow-sm">
                    Playlist ini masih kosong. Silakan pilih konten di atas lalu klik <strong>"+ Masukkan Slide"</strong>.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {selectedPlaylist.items.map((item, idx) => (
                      <div
                        key={item.item_id || idx}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm text-xs hover:border-emerald-200 transition"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-xs flex items-center justify-center border border-emerald-100">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{item.judul}</p>
                            <span className="text-[11px] text-slate-400 uppercase tracking-wider flex items-center gap-2 mt-0.5 font-medium">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px]">
                                {item.tipe}
                              </span>
                              &bull;
                              <span className="flex items-center gap-1 text-slate-600">
                                <Clock className="w-3 h-3 text-emerald-500" />
                                {item.durasi_detik} detik
                              </span>
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.item_id)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition"
                          title="Hapus dari Playlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 text-xs">
              Pilih salah satu playlist di sebelah kiri untuk melihat urutan tayang slide.
            </div>
          )}
        </div>
      </div>

      {/* Modal Buat Playlist Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-100 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-scale-in">
            <h3 className="text-base font-bold text-slate-800 mb-4">Buat Playlist Baru</h3>
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Playlist</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Playlist Promosi Pagi"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Deskripsi (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Konten tayang jam 08.00 - 12.00"
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-500 hover:text-slate-800 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl text-xs font-semibold shadow-sm"
                >
                  Simpan Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Push Playlist ke Layar */}
      {isPushModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-100 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 rounded-2xl text-emerald-600">
                  <Play className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-800">Tayangkan Playlist ke Layar</h4>
                  <p className="text-xs text-slate-400">{selectedPlaylist?.nama}</p>
                </div>
              </div>
              <button
                onClick={() => setIsPushModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 mb-5 text-xs text-slate-600 space-y-2 border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Slide:</span>
                <span className="font-bold text-slate-800">{selectedPlaylist?.items?.length || 0} slide</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Waktu 1 Putaran:</span>
                <span className="font-bold text-slate-800">{totalDurasi} detik</span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
                Layar TV akan menampilkan setiap gambar/video secara bergantian dan terus berulang secara otomatis.
              </p>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Pilih Layar TV Tujuan:
              </label>
              <select
                value={pushTargetDeviceId}
                onChange={(e) => setPushTargetDeviceId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 text-xs font-medium focus:outline-none focus:border-emerald-500"
              >
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama} — {d.lokasi} [{d.status === 'online' ? '🟢 Online' : '⚪ Offline'}]
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setIsPushModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handlePushPlaylist}
                disabled={pushLoading || !pushTargetDeviceId}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl text-xs font-semibold shadow-md shadow-emerald-500/20 disabled:opacity-50"
              >
                {pushLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Menyiapkan...</>
                ) : (
                  <><Play className="w-4 h-4" /> Tayangkan Playlist</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
