import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/authContext';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { useSync } from './hooks/useSync';

import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { PaymentHistoryPage } from './pages/PaymentHistoryPage';
import { SystemSettingsPage } from './pages/SystemSettingsPage';

const ProtectedLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const isOnline = useNetworkStatus();
  const { isSyncing, lastSyncTime, triggerSync } = useSync(isOnline);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 font-semibold text-sm gap-3">
        <img src="/images/trackz_logo.png" alt="TRAKZ Logo" className="w-12 h-12 object-contain animate-pulse" />
        <span>Loading TRAKZ PRO POS System...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const getPageTitle = (path) => {
    switch (path) {
      case '/dashboard':
        return 'Dashboard Overview';
      case '/orders':
        return 'Order History';
      case '/payments':
        return 'Payment History';
      case '/settings':
        return 'System & Sync Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Header
          pageTitle={getPageTitle(location.pathname)}
          isOnline={isOnline}
          isSyncing={isSyncing}
          lastSyncTime={lastSyncTime}
          onManualSync={triggerSync}
          setIsMobileOpen={setIsMobileOpen}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route
              path="/dashboard"
              element={
                <DashboardPage
                  isOnline={isOnline}
                  isSyncing={isSyncing}
                  lastSyncTime={lastSyncTime}
                  triggerSync={triggerSync}
                />
              }
            />
            <Route path="/orders" element={<OrderHistoryPage isOnline={isOnline} />} />
            <Route path="/payments" element={<PaymentHistoryPage isOnline={isOnline} />} />
            <Route
              path="/settings"
              element={
                <SystemSettingsPage
                  isOnline={isOnline}
                  isSyncing={isSyncing}
                  triggerSync={triggerSync}
                />
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
