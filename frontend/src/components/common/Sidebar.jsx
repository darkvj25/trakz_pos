import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, CreditCard, Settings, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';

export const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Order History', path: '/orders', icon: ShoppingBag },
    { label: 'Payment History', path: '/payments', icon: CreditCard },
    { label: 'System Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo Section */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src="/images/trackz_logo.png"
              alt="TRAKZ Logo"
              className="w-9 h-9 object-contain shrink-0"
            />
            {!isCollapsed && (
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">TRAKZ</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase bg-sky-100 text-[#0786C5] dark:bg-sky-950 dark:text-sky-300 rounded border border-sky-200 dark:border-sky-800">
                    PRO
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate">
                  Payment & History
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-sky-50 text-[#0786C5] font-semibold dark:bg-sky-950/60 dark:text-sky-400 shadow-sm border border-sky-100 dark:border-sky-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'
                  }`
                }
              >
                <Icon size={20} className="shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] text-slate-400 dark:text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
              <ShieldCheck size={14} className="text-[#0786C5]" />
              <span className="truncate" title="TrakZ Software Development Corporation">TrakZ Software Development Corporation</span>
            </div>
            <p>SEC: 2026080265253-03</p>
            <p>BIR TIN: 011-019-610-000</p>
          </div>
        )}
      </aside>
    </>
  );
};
