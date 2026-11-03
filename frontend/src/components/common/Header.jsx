import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, RefreshCw, Wifi, WifiOff, User, LogOut, ChevronDown, Printer } from 'lucide-react';
import { useAuth } from '../../store/authContext';
import { useTheme } from '../../hooks/useTheme';
import { printerService } from '../../services/printerService';

export const Header = ({
  pageTitle,
  isOnline,
  isSyncing,
  lastSyncTime,
  onManualSync,
  setIsMobileOpen,
}) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [printerStatus, setPrinterStatus] = useState(printerService.getStatus());

  useEffect(() => {
    const unsubscribe = printerService.subscribe((updated) => {
      setPrinterStatus(updated);
    });
    return () => unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-4 lg:px-8 flex items-center justify-between gap-2">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Right: Controls & Profile */}
      <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-4 shrink-0">
        {/* Network Online Status */}
        <div
          className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-xs font-semibold ${
            isOnline
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'
              : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800'
          }`}
        >
          {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span className="hidden sm:inline">{isOnline ? 'System Online' : 'System Offline'}</span>
        </div>

        {/* Thermal Printer Connection Status Icon / Badge */}
        <button
          onClick={() => navigate('/settings')}
          title={
            printerStatus.connectionType === 'browser'
              ? 'Printer Mode: Browser Standard (Click for Printer Settings)'
              : printerStatus.isConnected
              ? `Thermal Printer Connected: ${printerStatus.deviceName || printerStatus.connectionType} (Click for Settings)`
              : `Thermal Printer Disconnected: ${printerStatus.connectionType.toUpperCase()} (Click to Configure)`
          }
          className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-xs font-semibold transition-all hover:opacity-80 ${
            printerStatus.isConnected
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'
              : printerStatus.connectionType === 'browser'
              ? 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
              : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800'
          }`}
        >
          <div className="relative flex items-center">
            <Printer size={14} />
            <span
              className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${
                printerStatus.isConnected
                  ? 'bg-emerald-500 animate-pulse'
                  : printerStatus.connectionType === 'browser'
                  ? 'bg-slate-400'
                  : 'bg-amber-500'
              }`}
            />
          </div>
          <span className="hidden sm:inline">
            {printerStatus.isConnected
              ? 'Thermal Connected'
              : printerStatus.connectionType === 'browser'
              ? 'Browser Print'
              : 'Thermal Disconnected'}
          </span>
        </button>

        {/* Sync Trigger Button */}
        <button
          onClick={onManualSync}
          disabled={isSyncing || !isOnline}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          title={lastSyncTime ? `Last sync: ${new Date(lastSyncTime).toLocaleTimeString()}` : 'Sync now'}
        >
          <RefreshCw size={14} className={isSyncing ? 'animate-spin text-[#0786C5]' : ''} />
          <span className="hidden md:inline">{isSyncing ? 'Syncing...' : 'Sync'}</span>
        </button>

        {/* Light/Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
          title="Toggle Light / Dark mode"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User Profile & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#0786C5] text-white flex items-center justify-center font-bold text-xs">
              {user?.name ? user.name.charAt(0) : 'A'}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {user?.name || 'Store Personnel'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium truncate max-w-[140px]">
                {user?.merchantName || 'Merchant Store'} • {user?.role || 'CASHIER'}
              </span>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                {user?.merchantName && (
                  <p className="text-[10px] font-bold text-[#0786C5] pt-0.5 truncate">{user.merchantName}</p>
                )}
              </div>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
