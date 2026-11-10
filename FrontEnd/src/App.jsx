import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import CmsOverview from './components/CmsOverview';
import DeviceManagement from './components/DeviceManagement';
import ContentManagement from './components/ContentManagement';
import PlaylistManagement from './components/PlaylistManagement';
import ScheduleManagement from './components/ScheduleManagement';
import GroupManagement from './components/GroupManagement';
import DeviceModal from './components/DeviceModal';
import ContentModal from './components/ContentModal';
import PushContentModal from './components/PushContentModal';
import AuthModal from './components/AuthModal';
import AlertModal from './components/AlertModal';
import TickerSettingsModal from './components/TickerSettingsModal';
import DeviceClientView from './components/DeviceClientView';
import LoginPage from './components/LoginPage';
import { useRouter } from './router.jsx';
import { api, apiClient } from './services/api';
import { wsService } from './services/websocket';

function App() {
  const { path, navigate } = useRouter();

  // Helper konversi path URL <-> view module CMS
  const pathToView = (pathname) => {
    if (pathname === '/login') return 'login';
    if (pathname === '/devices') return 'devices';
    if (pathname === '/media') return 'media';
    if (pathname === '/playlists') return 'playlists';
    if (pathname === '/schedule') return 'schedule';
    if (pathname === '/groups') return 'groups';
    if (pathname.startsWith('/player') || pathname === '/client') return 'client';
    return 'dashboard';
  };

  const viewToPath = (view) => {
    switch (view) {
      case 'devices': return '/devices';
      case 'media': return '/media';
      case 'playlists': return '/playlists';
      case 'schedule': return '/schedule';
      case 'groups': return '/groups';
      case 'client': return '/player';
      case 'login': return '/login';
      default: return '/dashboard';
    }
  };

  // CMS Module Views: 'dashboard' | 'media' | 'playlists' | 'schedule' | 'groups' | 'devices' | 'client'
  const [currentView, setCurrentView] = useState(() => pathToView(window.location.pathname));
  const [devices, setDevices] = useState([]);
  const [contents, setContents] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [activePlayerDevice, setActivePlayerDevice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sinkronisasi otomatis bila URL browser berubah via Back / Forward (popstate)
  useEffect(() => {
    const targetView = pathToView(path);
    if (targetView !== currentView && targetView !== 'login') {
      setCurrentView(targetView);
    }
    // Jika path /player/:deviceId, pasang device aktif yang sesuai
    if (path.startsWith('/player')) {
      const match = path.match(/^\/player\/([^/?#]+)/);
      const devId = match ? decodeURIComponent(match[1]) : null;
      if (devId) {
        const found = devices.find((d) => d.id === devId);
        if (found) setActivePlayerDevice(found);
      }
    }
  }, [path, devices]);

  // Handler pergantian tampilan yang otomatis mengubah URL rute browser
  const handleViewChange = (view, targetPath = null) => {
    setCurrentView(view);
    setIsMobileSidebarOpen(false);
    const destination = targetPath || viewToPath(view);
    navigate(destination);
  };

  // ── Running Text Ticker State ───────────────────────────────────────
  const [runningTicker, setRunningTicker] = useState({
    text: 'Selamat Datang di MJ Solution Indonesia • Solusi Digital Signage Terintegrasi • Layanan Prima & Profesional',
    enabled: true
  });
  const [isTickerModalOpen, setIsTickerModalOpen] = useState(false);

  // ── Beautiful Alert Modal State ─────────────────────────────────────
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    data: null
  });

  const showAlert = (alertData) => {
    setAlertModal({
      isOpen: true,
      data: alertData
    });
  };

  const closeAlert = () => {
    setAlertModal((prev) => ({ ...prev, isOpen: false }));
  };

  // ── Auth state ──────────────────────────────────────────────────────
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // ── Modals state ────────────────────────────────────────────────────
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [isPushModalOpen, setIsPushModalOpen] = useState(false);
  const [targetPushDevice, setTargetPushDevice] = useState(null);

  // ── Load initial data via Axios ─────────────────────────────────────
  const fetchData = async (showUserAlert = false) => {
    if (showUserAlert) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [devs, cnts, pls] = await Promise.all([
        api.getDevices(),
        api.getContents(),
        api.getPlaylists()
      ]);
      setDevices(devs);
      setContents(cnts);
      setPlaylists(pls);
      if (showUserAlert) {
        showAlert({
          type: 'success',
          title: 'Data Disinkronkan!',
          message: 'Semua data perangkat layar, pustaka konten, dan playlist berhasil diperbarui dari server.'
        });
      }
    } catch (err) {
      console.warn('Gagal memuat data via Axios:', err);
      if (showUserAlert) {
        showAlert({
          type: 'error',
          title: 'Gagal Memuat Data',
          message: err.message || 'Terjadi kendala saat menghubungi server API.'
        });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Cek status autentikasi JWT
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      api.getCurrentUser()
        .then((res) => {
          if (res?.user) setCurrentUser(res.user);
        })
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setAuthChecked(true));
    } else {
      setAuthChecked(true);
    }

    // Connect to WebSocket server as Admin dashboard
    wsService.connect('admin-dashboard');

    const unsubStatus = wsService.on('connection_status', ({ connected }) => {
      setIsWsConnected(connected);
    });

    // Real-time device status update
    const unsubDeviceStatus = wsService.on('device_status_update', (updatedDev) => {
      setDevices((prev) =>
        prev.map((d) => (d.id === updatedDev.id ? { ...d, ...updatedDev } : d))
      );
    });

    // Real-time content push listener
    const unsubContentPush = wsService.on('content_push', ({ deviceId, content }) => {
      setDevices((prev) =>
        prev.map((d) =>
          d.id === deviceId ? { ...d, active_content: content } : d
        )
      );
    });

    // ── Real-time Playlist Event Listeners ───────────────────────────
    const unsubPlaylistCreated = wsService.on('playlist_created', (newPl) => {
      setPlaylists((prev) => {
        if (prev.some((p) => p.id === newPl.id)) return prev;
        return [newPl, ...prev];
      });
    });

    const unsubPlaylistUpdated = wsService.on('playlist_updated', (upPl) => {
      setPlaylists((prev) =>
        prev.map((p) => (p.id === upPl.id ? { ...p, ...upPl } : p))
      );
    });

    const unsubPlaylistDeleted = wsService.on('playlist_deleted', ({ id }) => {
      setPlaylists((prev) => prev.filter((p) => p.id !== id));
    });

    const unsubPlaylistItems = wsService.on('playlist_items_updated', () => {
      api.getPlaylists()
        .then((pls) => setPlaylists(pls))
        .catch((e) => console.warn('Gagal sinkron playlist realtime:', e));
    });

    // ── Real-time Content Media Event Listeners ───────────────────────
    const unsubContentCreated = wsService.on('content_created', (newContent) => {
      setContents((prev) => {
        if (prev.some((c) => c.id === newContent.id)) return prev;
        return [newContent, ...prev];
      });
    });

    const unsubContentDeleted = wsService.on('content_deleted', ({ id }) => {
      setContents((prev) => prev.filter((c) => c.id !== id));
    });

    // ── Real-time Device Event Listeners ─────────────────────────────
    const unsubDeviceCreated = wsService.on('device_created', (newDev) => {
      setDevices((prev) => {
        if (prev.some((d) => d.id === newDev.id)) return prev;
        return [newDev, ...prev];
      });
    });

    const unsubDeviceUpdated = wsService.on('device_updated', (upDev) => {
      setDevices((prev) =>
        prev.map((d) => (d.id === upDev.id ? { ...d, ...upDev } : d))
      );
    });

    const unsubDeviceDeleted = wsService.on('device_deleted', ({ id }) => {
      setDevices((prev) => prev.filter((d) => d.id !== id));
    });

    return () => {
      unsubStatus();
      unsubDeviceStatus();
      unsubContentPush();
      unsubPlaylistCreated();
      unsubPlaylistUpdated();
      unsubPlaylistDeleted();
      unsubPlaylistItems();
      unsubContentCreated();
      unsubContentDeleted();
      unsubDeviceCreated();
      unsubDeviceUpdated();
      unsubDeviceDeleted();
      wsService.disconnect();
    };
  }, []);

  // ── DEVICE CRUD ACTIONS ─────────────────────────────────────────────
  const handleSaveDevice = async (formData) => {
    try {
      if (editingDevice) {
        const updated = await api.updateDevice(editingDevice.id, formData);
        setDevices((prev) =>
          prev.map((d) => (d.id === editingDevice.id ? { ...d, ...updated } : d))
        );
        showAlert({
          type: 'success',
          title: 'Layar TV Diperbarui!',
          message: `Informasi layar "${formData.nama}" (${formData.lokasi}) berhasil diperbarui.`
        });
      } else {
        const created = await api.createDevice(formData);
        setDevices((prev) => [created, ...prev]);
        showAlert({
          type: 'success',
          title: 'Layar TV Baru Ditambahkan!',
          message: `Layar "${formData.nama}" berhasil dipasang dan siap menerima tayangan.`
        });
      }
    } catch (err) {
      showAlert({
        type: 'error',
        title: 'Gagal Menyimpan Layar TV',
        message: err.message || 'Terjadi kesalahan sistem saat menyimpan data layar TV.'
      });
    }
  };

  const handleDeleteDevice = async (id) => {
    const target = devices.find((d) => d.id === id);
    const targetName = target ? target.nama : id;

    if (window.confirm(`Apakah Anda yakin ingin menghapus layar TV "${targetName}"?`)) {
      try {
        await api.deleteDevice(id);
        setDevices((prev) => prev.filter((d) => d.id !== id));
        showAlert({
          type: 'success',
          title: 'Layar TV Dihapus',
          message: `Layar TV "${targetName}" berhasil dihapus dari daftar.`
        });
      } catch (err) {
        showAlert({
          type: 'error',
          title: 'Gagal Menghapus Layar TV',
          message: err.message || 'Gagal menghapus data layar TV.'
        });
      }
    }
  };

  const handleOpenEditDevice = (device) => {
    setEditingDevice(device);
    setIsDeviceModalOpen(true);
  };

  const handleOpenAddDevice = () => {
    setEditingDevice(null);
    setIsDeviceModalOpen(true);
  };

  // ── CONTENT CRUD ACTIONS ────────────────────────────────────────────
  const handleSaveContent = async (formDataOrResult) => {
    try {
      let created = formDataOrResult;
      if (!formDataOrResult?.id) {
        created = await api.createContent(formDataOrResult);
      }
      setContents((prev) => [created, ...prev]);
      showAlert({
        type: 'success',
        title: 'Gambar / Video Disimpan!',
        message: `Materi "${created.judul}" berhasil disimpan dan siap ditayangkan di TV.`
      });
    } catch (err) {
      showAlert({
        type: 'error',
        title: 'Gagal Menyimpan Berkas',
        message: err.message || 'Gagal menyimpan file gambar/video.'
      });
    }
  };

  const handleDeleteContent = async (id) => {
    const target = contents.find((c) => c.id === id);
    const targetTitle = target ? target.judul : id;

    if (window.confirm(`Hapus gambar/video "${targetTitle}" dari koleksi?`)) {
      try {
        await api.deleteContent(id);
        setContents((prev) => prev.filter((c) => c.id !== id));
        showAlert({
          type: 'success',
          title: 'Gambar / Video Dihapus',
          message: `Berkas "${targetTitle}" berhasil dihapus dari koleksi.`
        });
      } catch (err) {
        showAlert({
          type: 'error',
          title: 'Gagal Menghapus Berkas',
          message: err.message || 'Terjadi kesalahan saat menghapus berkas.'
        });
      }
    }
  };

  // ── PUSH COMMAND ACTIONS ────────────────────────────────────────────
  const handleOpenPushModal = (device) => {
    setTargetPushDevice(device);
    setIsPushModalOpen(true);
  };

  const handlePushContent = async (deviceId, content) => {
    try {
      await api.pushContentToDevice(deviceId, content);
      wsService.send({
        type: 'content_push',
        deviceId,
        content
      });
      setDevices((prev) =>
        prev.map((d) => (d.id === deviceId ? { ...d, active_content: content } : d))
      );
      showAlert({
        type: 'success',
        title: 'Tayangan Berhasil Ditampilkan!',
        message: `"${content.judul}" sekarang sedang diputar di layar ${targetPushDevice?.nama || deviceId}.`
      });
    } catch (err) {
      showAlert({
        type: 'error',
        title: 'Gagal Menayangkan ke TV',
        message: err.message || 'Layar TV mungkin sedang mati atau tidak terhubung internet.'
      });
    }
  };

  // ── BULK BROADCAST TO ZONE / GROUP ──────────────────────────────────
  const handleBroadcastToGroup = async (zoneName, targetDevices, playlist) => {
    try {
      for (const dev of targetDevices) {
        await apiClient.post(`/playlists/${playlist.id}/push`, { device_id: dev.id });
      }
      showAlert({
        type: 'success',
        title: 'Siaran Serentak Berhasil!',
        message: `Tayangan "${playlist.nama}" (${playlist.items?.length || 0} slide) berhasil diputar serentak di ${targetDevices.length} TV di ${zoneName}!`
      });
    } catch (err) {
      showAlert({
        type: 'error',
        title: 'Gagal Siaran Bersama',
        message: err.message || 'Terjadi kendala saat menyiarkan ke kelompok TV.'
      });
    }
  };

  // ── APPLY AUTOMATIC SCHEDULE ────────────────────────────────────────
  const handleApplySchedule = async (playlist, targetDevices, targetLabel) => {
    try {
      for (const dev of targetDevices) {
        await apiClient.post(`/playlists/${playlist.id}/push`, { device_id: dev.id });
      }
      showAlert({
        type: 'success',
        title: 'Jadwal Tayang Diterapkan!',
        message: `Tayangan "${playlist.nama}" sekarang aktif berputar di ${targetLabel || `${targetDevices.length} layar TV`}.`
      });
    } catch (err) {
      showAlert({
        type: 'error',
        title: 'Gagal Menerapkan Jadwal',
        message: err.message || 'Terjadi kesalahan saat menerapkan jadwal siar.'
      });
    }
  };

  // ── OPEN SIGNAGE PLAYER VIEW IN NEW BROWSER TAB ────────────────────
  const handleOpenClientView = (device) => {
    const dev = device || devices[0];
    const targetUrl = dev?.id ? `/player/${dev.id}` : '/player';
    window.open(targetUrl, '_blank');
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setIsGuest(false);
    navigate('/login');
    showAlert({
      type: 'info',
      title: 'Berhasil Keluar',
      message: 'Sesi administrator CMS Anda telah ditutup dengan aman.'
    });
  };

  // ── Cek apakah rute adalah player TV (layar display publik, tidak di-lock login admin) ──
  const isPlayerRoute = path.startsWith('/player') || path === '/client' || currentView === 'client';

  // ── Protected Route: Tampilkan LoginPage jika di route /login atau belum login dan bukan mode guest ──
  const isLoginPage = !isPlayerRoute && (path === '/login' || (authChecked && !currentUser && !isGuest));

  if (isLoginPage) {
    return (
      <>
        <LoginPage
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            fetchData();
            handleViewChange('dashboard');
            showAlert({
              type: 'success',
              title: `Selamat Datang, ${user.username}!`,
              message: 'Selamat datang kembali di MJ Signage CMS.'
            });
          }}
          onGuestAccess={() => {
            setIsGuest(true);
            handleViewChange('dashboard');
            showAlert({
              type: 'info',
              title: 'Mode Pratinjau',
              message: 'Anda masuk dalam mode pratinjau untuk menjelajahi fitur CMS.'
            });
          }}
        />
        <AlertModal
          isOpen={alertModal.isOpen}
          onClose={closeAlert}
          alertData={alertModal.data}
        />
      </>
    );
  }

  // ── Ekstrak Device ID dari rute player (misal: /player/dev-002) ───────────
  const playerMatch = path.match(/^\/player\/([^/?#]+)/);
  const playerDeviceId = playerMatch ? decodeURIComponent(playerMatch[1]) : null;
  const currentActivePlayerDevice =
    (playerDeviceId && devices.find((d) => d.id === playerDeviceId)) ||
    activePlayerDevice ||
    (playerDeviceId ? { id: playerDeviceId } : devices[0]);

  // If in client/player view mode
  if (isPlayerRoute || currentView === 'client') {
    return (
      <DeviceClientView
        devices={devices}
        activeDevice={currentActivePlayerDevice}
        initialDeviceId={playerDeviceId || activePlayerDevice?.id}
        onBackToDashboard={() => handleViewChange('dashboard')}
        runningTicker={runningTicker}
      />
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-white text-slate-800 flex font-sans antialiased">
      {/* ── Left Modern CMS Sidebar (Responsive Mobile Drawer + Desktop Fixed) ── */}
      <Sidebar
        currentView={currentView}
        setCurrentView={handleViewChange}
        isWsConnected={isWsConnected}
        currentUser={currentUser}
        onOpenAuthModal={() => handleViewChange('login', '/login')}
        onLogout={handleLogout}
        onOpenTickerModal={() => setIsTickerModalOpen(true)}
        devicesCount={devices.length}
        onlineDevicesCount={devices.filter((d) => d.status === 'online').length}
        contentsCount={contents.length}
        playlistsCount={playlists.length}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* ── Main Content Area (Modern Pearl-Mint Canvas with Rich Motif Details) ── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-gradient-to-br from-[#F5F9F8] via-[#EFF6F4] to-[#E8F3F1] relative">
        {/* ── Motif 1: Precision Blueprint Tech Grid Pattern (Clearly Visible & Elegant) ── */}
        <div
          className="absolute inset-0 pointer-events-none opacity-100"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(13, 143, 131, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(13, 143, 131, 0.05) 1px, transparent 1px),
              radial-gradient(circle at 1px 1px, rgba(13, 143, 131, 0.16) 1.5px, transparent 0)
            `,
            backgroundSize: '36px 36px, 36px 36px, 36px 36px'
          }}
        />

        {/* ── Motif 2: Architectural Topographic Contour Lines SVG Motif ── */}
        <svg
          className="absolute top-0 right-0 w-[550px] h-[550px] opacity-[0.09] pointer-events-none"
          viewBox="0 0 600 600"
          fill="none"
        >
          <path d="M100 0 C 250 180, 380 60, 600 220" stroke="#0D8F83" strokeWidth="2.5" strokeDasharray="6 6" />
          <path d="M0 140 C 220 320, 420 140, 600 340" stroke="#0D8F83" strokeWidth="1.8" />
          <path d="M60 280 C 260 460, 460 240, 600 480" stroke="#0D8F83" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx="460" cy="200" r="160" stroke="#0D8F83" strokeWidth="1.5" strokeDasharray="8 6" />
          <circle cx="460" cy="200" r="100" stroke="#0D8F83" strokeWidth="1.2" />
          <circle cx="460" cy="200" r="40" stroke="#0D8F83" strokeWidth="1" strokeDasharray="3 3" />
        </svg>

        {/* ── Motif 3: Bottom Left Wave Contour Accent ── */}
        <svg
          className="absolute bottom-0 left-0 w-[450px] h-[400px] opacity-[0.07] pointer-events-none"
          viewBox="0 0 500 450"
          fill="none"
        >
          <path d="M-50 400 C 150 250, 300 450, 500 250" stroke="#0D8F83" strokeWidth="2" strokeDasharray="5 5" />
          <path d="M-50 320 C 120 180, 260 380, 500 180" stroke="#0D8F83" strokeWidth="1.5" />
          <circle cx="120" cy="350" r="90" stroke="#0D8F83" strokeWidth="1" strokeDasharray="6 6" />
        </svg>

        {/* ── Motif 4: Ambient Soft Aurora Glow Orbs ── */}
        <div className="absolute top-10 right-20 w-[450px] h-[450px] bg-teal-400/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Bar (Sticky at top of content area) */}
        <TopHeader
          currentView={currentView}
          onRefresh={() => fetchData(true)}
          isRefreshing={isRefreshing}
          onOpenAddDevice={handleOpenAddDevice}
          onOpenAddContent={() => setIsContentModalOpen(true)}
          onOpenTickerModal={() => setIsTickerModalOpen(true)}
          searchTerm={globalSearch}
          setSearchTerm={setGlobalSearch}
          currentUser={currentUser}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        />

        {/* Content Body Container */}
        <main className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-5 sm:space-y-6 relative z-10">
          {currentView === 'dashboard' && (
            <CmsOverview
              devices={devices}
              contents={contents}
              playlists={playlists}
              runningTicker={runningTicker}
              onOpenAddDevice={handleOpenAddDevice}
              onOpenAddContent={() => setIsContentModalOpen(true)}
              onOpenTickerModal={() => setIsTickerModalOpen(true)}
              onOpenClientView={handleOpenClientView}
              onOpenPushModal={handleOpenPushModal}
              setCurrentView={handleViewChange}
              showTable={true}
              onOpenEditDevice={handleOpenEditDevice}
              onDeleteDevice={handleDeleteDevice}
              globalSearch={globalSearch}
            />
          )}

          {currentView === 'media' && (
            <ContentManagement
              contents={contents}
              devices={devices}
              onPushContent={handlePushContent}
              onOpenAddModal={() => setIsContentModalOpen(true)}
              onDeleteContent={handleDeleteContent}
              externalSearch={globalSearch}
            />
          )}

          {currentView === 'playlists' && (
            <PlaylistManagement
              playlists={playlists}
              setPlaylists={setPlaylists}
              onRefreshPlaylists={() => {
                api.getPlaylists()
                  .then((pls) => setPlaylists(pls))
                  .catch((e) => console.warn('Gagal sinkron playlist:', e));
              }}
              contents={contents}
              devices={devices}
              onShowAlert={showAlert}
            />
          )}

          {currentView === 'schedule' && (
            <ScheduleManagement
              playlists={playlists}
              devices={devices}
              onApplySchedule={handleApplySchedule}
              onShowAlert={showAlert}
            />
          )}

          {currentView === 'groups' && (
            <GroupManagement
              devices={devices}
              playlists={playlists}
              onBroadcastToGroup={handleBroadcastToGroup}
              onShowAlert={showAlert}
            />
          )}

          {currentView === 'devices' && (
            <DeviceManagement
              devices={devices}
              onOpenAddModal={handleOpenAddDevice}
              onOpenEditModal={handleOpenEditDevice}
              onDeleteDevice={handleDeleteDevice}
              onOpenPushModal={handleOpenPushModal}
              onOpenClientView={handleOpenClientView}
              externalSearch={globalSearch}
            />
          )}
        </main>

        {/* Aesthetic Footer */}
        <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/70 select-none bg-white/70 backdrop-blur-xs relative z-10">
          MJ Solution Indonesia &bull; Enterprise Digital Signage CMS &bull; Real-time WebSocket + Cloud Engine
        </footer>
      </div>

      {/* ── Beautiful Alert Modal for all CRUD operations ── */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        alertData={alertModal.data}
      />

      {/* ── Running Text Ticker Modal ── */}
      <TickerSettingsModal
        isOpen={isTickerModalOpen}
        onClose={() => setIsTickerModalOpen(false)}
        currentTicker={runningTicker.text}
        onSave={(data) => {
          setRunningTicker(data);
          showAlert({
            type: 'success',
            title: 'Running Text Disiarkan!',
            message: 'Pita running text ticker berhasil diperbarui dan aktif di seluruh tampilan player.'
          });
        }}
      />

      {/* ── Form Modals ── */}
      <DeviceModal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
        onSave={handleSaveDevice}
        editingDevice={editingDevice}
      />

      <ContentModal
        isOpen={isContentModalOpen}
        onClose={() => setIsContentModalOpen(false)}
        onSave={handleSaveContent}
      />

      <PushContentModal
        isOpen={isPushModalOpen}
        onClose={() => setIsPushModalOpen(false)}
        targetDevice={targetPushDevice}
        contents={contents}
        onPush={handlePushContent}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showAlert({
            type: 'success',
            title: `Selamat Datang, ${user.username}!`,
            message: 'Anda berhasil terautentikasi dengan token JWT administrator.'
          });
        }}
      />
    </div>
  );
}

export default App;
