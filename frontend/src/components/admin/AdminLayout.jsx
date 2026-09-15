import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInstanceId, healthApi } from '../../services/api';
import {
  DashboardIcon,
  BookIcon,
  VideoIcon,
  FolderIcon,
  FeedbackIcon,
  UsersIcon,
  LogoutIcon,
  CloudIcon,
  ServerIcon,
  MenuIcon,
  CloseIcon,
  ShieldIcon,
  RefreshIcon
} from '../common/Icons';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [instanceId, setInstanceId] = useState(getInstanceId());
  const [healthStatus, setHealthStatus] = useState('CHECKING');

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: DashboardIcon, end: true },
    { to: '/admin/categories', label: 'Categories', icon: FolderIcon },
    { to: '/admin/books', label: 'Books & PDFs', icon: BookIcon },
    { to: '/admin/videos', label: 'Videos & Media', icon: VideoIcon },
    { to: '/admin/feedback', label: 'Feedbacks', icon: FeedbackIcon },
    { to: '/admin/users', label: 'Users & Roles', icon: UsersIcon },
  ];

  const checkHealth = async () => {
    try {
      const res = await healthApi.check();
      setHealthStatus(res.status || 'UP');
      setInstanceId(getInstanceId());
    } catch (e) {
      setHealthStatus('UNAVAILABLE');
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100 font-sans">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-600/30">
            EL
          </div>
          <span className="font-bold text-sm tracking-tight text-white">E-Learning Cloud</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          {sidebarOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900/95 md:bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Header */}
          <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-indigo-500/25">
                EL
              </div>
              <div>
                <h1 className="font-bold text-base text-white leading-none">Cloud Learning</h1>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
                  Admin Back-Office
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.end
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Cloud Instance Info & User Profile */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-3">
            {/* Instance Node Badge */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <ServerIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div className="truncate">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Instance Node</p>
                  <p className="font-mono text-emerald-400 font-bold truncate">
                    {instanceId !== 'unknown' ? instanceId : 'backend-pool'}
                  </p>
                </div>
              </div>
              <button
                onClick={checkHealth}
                title="Refresh node health"
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors"
              >
                <RefreshIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* User Session Profile */}
            <div className="flex items-center justify-between pt-1 px-1">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-xs flex-shrink-0">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-200 truncate">{user?.fullName || 'Administrator'}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
              >
                <LogoutIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950">
        {/* Top Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-slate-900/50 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold flex items-center gap-1.5">
              <ShieldIcon className="w-3.5 h-3.5" />
              ROLE_ADMIN
            </div>
            <span className="text-xs text-slate-400">
              Stateless JWT Session Active
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <div
                className={`w-2 h-2 rounded-full ${
                  healthStatus === 'UP' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                }`}
              />
              <span className="text-slate-400">Backend:</span>
              <span className="text-slate-200 font-mono font-semibold">{instanceId}</span>
            </div>
          </div>
        </header>

        {/* Page Viewport */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
