import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Maximize, Minimize, Wifi, WifiOff, Tv,
  ArrowLeft, RefreshCw, ChevronRight, ChevronLeft, Layers, Megaphone
} from 'lucide-react';
import { wsService } from '../services/websocket';
import { api, apiClient } from '../services/api';

export default function DeviceClientView({
  devices = [],
  activeDevice,
  initialDeviceId,
  onBackToDashboard,
  runningTicker
}) {
  // Helper to extract device ID from pathname e.g. /player/dev-002
  const getDeviceIdFromUrl = () => {
    if (typeof window !== 'undefined') {
      const match = window.location.pathname.match(/\/player\/([^/?#]+)/);
      if (match && match[1]) return decodeURIComponent(match[1]);
    }
    return null;
  };

  const resolvedInitialId =
    initialDeviceId || getDeviceIdFromUrl() || activeDevice?.id || devices[0]?.id || 'dev-001';

  const [selectedDeviceId, setSelectedDeviceId] = useState(resolvedInitialId);
  const [currentDevice, setCurrentDevice] = useState(activeDevice || null);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

  // ── Single content ─────────────────────────────────────────────
  const [singleContent, setSingleContent] = useState(activeDevice?.active_content || null);

  // ── Playlist slideshow ─────────────────────────────────────────
  const [playlistItems, setPlaylistItems] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [isPlaylist, setIsPlaylist] = useState(false);

  const containerRef = useRef(null);
  const overlayTimerRef = useRef(null);
  const timerRef = useRef(null);

  // Konten yang sedang tampil
  const currentContent = isPlaylist && playlistItems.length > 0
    ? playlistItems[slideIndex]
    : singleContent;

  // ══════════════════════════════════════════════════════════════════
  //  SLIDESHOW TIMER
  // ══════════════════════════════════════════════════════════════════
  useEffect(() => {
    clearInterval(timerRef.current);
    timerRef.current = null;

    if (!isPlaylist || playlistItems.length < 2) return;

    const currentItem = playlistItems[slideIndex];
    const durasiMs = (currentItem?.durasi_detik || 10) * 1000;

    timerRef.current = setTimeout(() => {
      setSlideIndex((prev) => (prev + 1) % playlistItems.length);
    }, durasiMs);

    return () => {
      clearTimeout(timerRef.current);
    };
  }, [slideIndex, isPlaylist, playlistItems]);

  // ── Helper: aktifkan playlist ──────────────────────────────────
  const activatePlaylist = useCallback((items) => {
    clearTimeout(timerRef.current);
    setIsPlaylist(true);
    setPlaylistItems([...items]);
    setSlideIndex(0);
    setSingleContent(null);
  }, []);

  // ── Helper: aktifkan konten tunggal ────────────────────────────
  const activateSingle = useCallback((content) => {
    clearTimeout(timerRef.current);
    setIsPlaylist(false);
    setPlaylistItems([]);
    setSlideIndex(0);
    let parsed = content;
    if (typeof content === 'string') {
      try {
        parsed = JSON.parse(content);
      } catch (e) {}
    }
    setSingleContent(parsed);
  }, []);

  // ── Sinkronisasi bila initialDeviceId / activeDevice berubah ──
  useEffect(() => {
    const urlId = getDeviceIdFromUrl();
    const targetId = initialDeviceId || urlId || activeDevice?.id;
    if (targetId && targetId !== selectedDeviceId) {
      setSelectedDeviceId(targetId);
    }
  }, [initialDeviceId, activeDevice?.id]);

  // ── Tampilkan langsung active_content bila data device sudah ada di memori ──
  useEffect(() => {
    if (!selectedDeviceId) return;

    const matched =
      (activeDevice && activeDevice.id === selectedDeviceId ? activeDevice : null) ||
      devices.find((d) => d.id === selectedDeviceId);

    if (matched) {
      setCurrentDevice(matched);
      if (matched.active_content) {
        if (matched.active_content.type === 'playlist' && Array.isArray(matched.active_content.items)) {
          activatePlaylist(matched.active_content.items);
        } else {
          activateSingle(matched.active_content);
        }
      }
    }
  }, [selectedDeviceId, activeDevice, devices, activatePlaylist, activateSingle]);

  // ── Fetch device detail + konten terakhir dari server ──────────
  const fetchDeviceDetails = async (deviceId) => {
    if (!deviceId) return;
    setLoading(true);
    try {
      const data = await api.getDeviceById(deviceId);
      if (data) {
        setCurrentDevice(data);
        if (data.active_content) {
          const content = data.active_content;
          if (content.type === 'playlist' && Array.isArray(content.items) && content.items.length > 0) {
            activatePlaylist(content.items);
          } else {
            activateSingle(content);
          }
        }
      }
    } catch (err) {
      console.warn('Gagal memuat detail device:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeviceDetails(selectedDeviceId);
    return () => clearTimeout(timerRef.current);
  }, [selectedDeviceId]);

  // ── Handler ganti device via dropdown ─────────────────────────
  const handleSelectDevice = (newId) => {
    setSelectedDeviceId(newId);
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/player')) {
      window.history.replaceState(null, '', `/player/${newId}`);
    }
  };

  // ── WebSocket ──────────────────────────────────────────────────
  useEffect(() => {
    wsService.connect(selectedDeviceId);

    const unsubStatus = wsService.on('connection_status', ({ connected }) => {
      setIsConnected(connected);
    });

    const unsubPush = wsService.on('content_push', (data) => {
      if (data.deviceId !== selectedDeviceId) return;
      const content = data.content;

      if (content?.type === 'playlist' && Array.isArray(content.items) && content.items.length > 0) {
        activatePlaylist(content.items);
      } else if (content) {
        activateSingle(content);
      }
      setShowOverlay(true);
      triggerAutoHideOverlay();
    });

    return () => {
      unsubStatus();
      unsubPush();
      wsService.disconnect();
      clearTimeout(timerRef.current);
    };
  }, [selectedDeviceId]);

  // ── Overlay auto-hide ──────────────────────────────────────────
  const triggerAutoHideOverlay = () => {
    clearTimeout(overlayTimerRef.current);
    overlayTimerRef.current = setTimeout(() => setShowOverlay(false), 4000);
  };

  const handleMouseMove = () => {
    setShowOverlay(true);
    triggerAutoHideOverlay();
  };

  // ── Fullscreen ─────────────────────────────────────────────────
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(console.warn);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(console.warn);
      setIsFullscreen(false);
    }
  };

  // ── Navigasi manual ────────────────────────────────────────────
  const goNextSlide = () => {
    if (!isPlaylist || playlistItems.length < 2) return;
    clearTimeout(timerRef.current);
    setSlideIndex((prev) => (prev + 1) % playlistItems.length);
  };

  const goPrevSlide = () => {
    if (!isPlaylist || playlistItems.length < 2) return;
    clearTimeout(timerRef.current);
    setSlideIndex((prev) => (prev - 1 + playlistItems.length) % playlistItems.length);
  };

  // ── Render media ───────────────────────────────────────────────
  const renderMedia = (content) => {
    if (!content) return null;
    if (content.tipe === 'image') {
      return (
        <img
          key={content.payload + '-' + slideIndex}
          src={content.payload}
          alt={content.judul}
          className="w-full h-full object-cover transition-opacity duration-700"
        />
      );
    }
    if (content.tipe === 'video') {
      return (
        <video
          key={content.payload + '-' + slideIndex}
          src={content.payload}
          autoPlay
          loop={!isPlaylist}
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      );
    }
    if (content.tipe === 'url') {
      return (
        <iframe
          key={content.payload + '-' + slideIndex}
          src={content.payload}
          title={content.judul}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      );
    }
    return null;
  };

  const hasTicker = runningTicker?.enabled !== false && Boolean(runningTicker?.text);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center select-none"
    >
      {/* ── MEDIA AREA ──────────────────────────────────────────── */}
      {currentContent ? (
        <div className="w-full h-full flex items-center justify-center">
          {renderMedia(currentContent)}
        </div>
      ) : (
        <div className="text-center p-8 space-y-4">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-500 shadow-2xl">
            <Tv className="w-10 h-10 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">MJ SOLUTION SIGNAGE</h2>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            {loading ? 'Memuat data layar...' : 'Menunggu penugasan konten dari Dasbor CMS...'}
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-400">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`} />
            Device ID: {selectedDeviceId}
          </div>
        </div>
      )}

      {/* ── RUNNING TEXT TICKER (PITA BERITA BAWAH LAYAR) ───────── */}
      {hasTicker && (
        <div className="absolute bottom-0 inset-x-0 z-20 bg-slate-950/85 border-t border-emerald-500/30 py-2 px-4 backdrop-blur-md flex items-center shadow-2xl overflow-hidden">
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 px-3 py-0.5 rounded-full font-extrabold text-[10px] tracking-wider uppercase shrink-0 shadow-md mr-3">
            <Megaphone className="w-3 h-3 text-slate-950" />
            <span>PENGUMUMAN</span>
          </div>
          <div className="overflow-hidden flex-1 text-white font-medium text-xs tracking-wide">
            <span className="animate-marquee inline-block text-emerald-300">
              {runningTicker.text}
            </span>
          </div>
        </div>
      )}

      {/* ── PROGRESS BAR (playlist 2+ slide) ─────────────────────── */}
      {isPlaylist && playlistItems.length > 1 && (
        <div className={`absolute inset-x-0 z-30 flex gap-1 px-4 ${hasTicker ? 'bottom-10 pb-1' : 'bottom-0 pb-2'}`}>
          {playlistItems.map((_, idx) => (
            <div
              key={idx}
              onClick={() => { clearTimeout(timerRef.current); setSlideIndex(idx); }}
              className={`flex-1 h-1 rounded-full cursor-pointer transition-all duration-300 ${
                idx === slideIndex ? 'bg-emerald-400 shadow-sm' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      )}

      {/* ── TOP OVERLAY ──────────────────────────────────────────── */}
      <div
        className={`absolute inset-x-0 top-0 p-4 bg-gradient-to-b from-black/85 via-black/40 to-transparent transition-opacity duration-300 z-40 flex items-center justify-between ${
          showOverlay ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.opener && !window.opener.closed) {
                window.close();
              } else if (onBackToDashboard) {
                onBackToDashboard();
              } else {
                window.location.href = '/dashboard';
              }
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white text-xs font-semibold border border-slate-700/80 backdrop-blur-md transition shadow cursor-pointer"
            title="Tutup atau kembali ke panel admin"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            {window.opener ? 'Tutup Tab / Ke Dasbor' : 'Kembali ke Dasbor'}
          </button>

          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700/80 px-3 py-1.5 rounded-xl backdrop-blur-md">
            <Tv className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={selectedDeviceId}
              onChange={(e) => handleSelectDevice(e.target.value)}
              className="bg-transparent text-white text-xs font-medium focus:outline-none cursor-pointer"
            >
              {devices.length > 0 ? (
                devices.map((d) => (
                  <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                    {d.nama} ({d.lokasi})
                  </option>
                ))
              ) : currentDevice ? (
                <option value={currentDevice.id} className="bg-slate-900 text-white">
                  {currentDevice.nama || currentDevice.id} ({currentDevice.lokasi || 'Terpilih'})
                </option>
              ) : (
                <option value={selectedDeviceId} className="bg-slate-900 text-white">
                  {selectedDeviceId}
                </option>
              )}
            </select>
          </div>

          <button
            onClick={() => fetchDeviceDetails(selectedDeviceId)}
            disabled={loading}
            className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 backdrop-blur-md transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-md text-xs">
            {isConnected ? (
              <><Wifi className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-300 font-semibold">🟢 Siap Tayang (Online)</span></>
            ) : (
              <><WifiOff className="w-3.5 h-3.5 text-amber-400" /><span className="text-amber-300 font-medium">Menyambungkan...</span></>
            )}
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/80 backdrop-blur-md transition"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── BOTTOM INFO ──────────────────────────────────────────── */}
      {currentContent && (
        <div
          className={`absolute inset-x-0 transition-opacity duration-300 z-20 flex items-end justify-between text-xs text-slate-300 px-4 ${
            hasTicker ? 'bottom-12 pb-2' : 'bottom-0 pb-6'
          } ${showOverlay ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <div className="flex items-center gap-2">
            {isPlaylist && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black uppercase text-[10px] flex items-center gap-1 shadow-sm">
                <Layers className="w-3 h-3" />
                SLIDE {slideIndex + 1}/{playlistItems.length}
              </span>
            )}
            <span className="px-2 py-0.5 rounded bg-slate-800/80 text-emerald-400 font-semibold uppercase text-[10px] border border-slate-700">
              {currentContent.tipe}
            </span>
            <span className="font-bold text-white drop-shadow">{currentContent.judul}</span>
            {isPlaylist && currentContent.durasi_detik && (
              <span className="text-slate-400">· {currentContent.durasi_detik}s</span>
            )}
          </div>

          {isPlaylist && playlistItems.length > 1 && (
            <div className="flex items-center gap-1.5">
              <button onClick={goPrevSlide} className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-700 text-white border border-slate-700/80 transition">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={goNextSlide} className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-700 text-white border border-slate-700/80 transition">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <span className="text-slate-400 text-[11px] font-mono">
            {currentDevice?.nama || selectedDeviceId} · {currentDevice?.lokasi || ''}
          </span>
        </div>
      )}
    </div>
  );
}
