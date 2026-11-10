import React from 'react';
import { Monitor, Tv, LayoutDashboard, ListMusic, Lock, UserCheck, RefreshCw } from 'lucide-react';

export default function Navbar({
  currentView,
  setCurrentView,
  isWsConnected,
  onOpenAuthModal,
  currentUser,
  onLogout,
  onRefreshData,
  isRefreshing
}) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Tv className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                MJ Solution <span className="text-blue-400 font-semibold text-xs px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">Signage</span>
              </span>
              <p className="text-xs text-slate-400">Real-Time Control Panel</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                currentView === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dasbor Admin
            </button>

            <button
              onClick={() => setCurrentView('playlists')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                currentView === 'playlists'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ListMusic className="w-4 h-4" />
              Playlist
            </button>

            <button
              onClick={() => setCurrentView('client')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                currentView === 'client'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Monitor className="w-4 h-4" />
              Layar Klien
            </button>
          </div>

          {/* Right Actions: Refresh, Auth, WS Status */}
          <div className="flex items-center gap-2.5">
            {/* Refresh Data via Axios */}
            <button
              onClick={onRefreshData}
              disabled={isRefreshing}
              title="Refresh Data dari API (Axios)"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
            </button>

            {/* JWT Auth Button */}
            {currentUser ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-200 font-medium">{currentUser.username}</span>
                <button
                  onClick={onLogout}
                  className="text-[10px] text-slate-400 hover:text-rose-400 ml-1 underline"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white text-xs transition"
              >
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>Login JWT</span>
              </button>
            )}

            {/* WebSocket Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isWsConnected ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isWsConnected ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
              </span>
              <span className="font-mono text-slate-300">
                {isWsConnected ? 'WS Live' : 'WS Local'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
