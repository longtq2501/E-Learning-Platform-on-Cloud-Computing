import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldIcon } from '../common/Icons';

export const AdminGuard = ({ children }) => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">Verifying credentials and cloud session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel p-8 rounded-2xl text-center border border-rose-500/20">
          <div className="w-14 h-14 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-rose-500/20">
            <ShieldIcon className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">Access Restricted</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Your current account ({user?.email}) has role <span className="text-slate-200 font-semibold">{user?.role}</span>. Administrator privileges (<span className="text-indigo-400 font-semibold">ROLE_ADMIN</span>) are required to access this portal.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                localStorage.removeItem('elearning_token');
                localStorage.removeItem('elearning_user');
                window.location.href = '/admin/login';
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Sign In as Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};
