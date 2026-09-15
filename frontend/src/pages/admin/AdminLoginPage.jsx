import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { ShieldIcon, ServerIcon } from '../../components/common/Icons';

export const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showError('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role !== 'ADMIN') {
        showError('Access denied: Account is not an administrator');
        setLoading(false);
        return;
      }
      showSuccess(`Welcome back, ${user.fullName}`);
      navigate(from, { replace: true });
    } catch (err) {
      showError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (quickEmail, quickPass) => {
    setEmail(quickEmail);
    setPassword(quickPass);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-600/30 text-white font-extrabold text-xl mb-4 border border-indigo-400/30">
            EL
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Back-Office</h1>
          <p className="text-slate-400 text-sm mt-1.5">
            Cloud E-Learning Platform Administration Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Administrator Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@elearning.com"
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-750 border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-750 border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <ShieldIcon className="w-4 h-4" />
                  <span>Sign In as Administrator</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-xs text-slate-400 font-medium mb-3 text-center">
              Quick Demo Credentials:
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin@elearning.com', 'admin123')}
                className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-750 hover:bg-slate-700/80 text-xs font-medium text-slate-300 rounded-lg border border-slate-700 transition-colors text-center"
              >
                Default Admin
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('teacher@elearning.com', 'admin123')}
                className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-750 hover:bg-slate-700/80 text-xs font-medium text-slate-300 rounded-lg border border-slate-700 transition-colors text-center"
              >
                Teacher Admin
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <ServerIcon className="w-4 h-4 text-slate-400" />
          <span>Stateless JWT Authentication via Spring Security 6</span>
        </div>
      </div>
    </div>
  );
};
