import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import { AdminGuard } from './components/admin/AdminGuard';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { CategoriesPage } from './pages/admin/CategoriesPage';
import { BooksPage } from './pages/admin/BooksPage';
import { VideosPage } from './pages/admin/VideosPage';
import { FeedbackPage } from './pages/admin/FeedbackPage';
import { UsersPage } from './pages/admin/UsersPage';
import { ShieldIcon, ServerIcon, CloudIcon } from './components/common/Icons';
import { AuthProvider as StudentAuthProvider, ProtectedRoute as StudentProtectedRoute } from './auth.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { StudentHomePage } from './pages/student/StudentHomePage.tsx';
import { StudentDetailPage } from './pages/student/StudentDetailPage.tsx';

const LandingPortalHub = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 relative overflow-hidden">
      <div className="max-w-2xl w-full text-center space-y-8 relative z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 shadow-2xl shadow-indigo-600/40 text-white font-extrabold text-2xl border border-indigo-400/30">
          EL
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400 mb-3">
            Không gian học tập số
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Cloud Learning
          </h1>
          <p className="text-slate-400 text-base mt-3 max-w-lg mx-auto">
            Nền tảng quản lý học liệu trên hạ tầng cloud, nơi nội dung được tổ chức gọn gàng và sẵn sàng phục vụ người học.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {/* Branch B Card */}
          <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <ShieldIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Khu vực quản trị</h3>
                <span className="text-[11px] font-semibold text-indigo-400 uppercase">Đang hoạt động</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Quản lý danh mục, sách, video, phản hồi và người dùng trong một không gian tập trung.
            </p>
            <Link
              to="/admin"
              className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all"
            >
              Vào khu vực quản trị →
            </Link>
          </div>

<<<<<<< HEAD
          {/* Branch A Card */}
=======
          {/* Student portal */}
>>>>>>> 5c7bb6ee5517a8e81d8f1700798938b8da1056c0
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-800 text-slate-400 border border-slate-700">
                <CloudIcon className="w-5 h-5" />
              </div>
              <div>
<<<<<<< HEAD
                <h3 className="text-base font-bold text-slate-200">Không gian người học</h3>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Đang hoàn thiện</span>
=======
                <h3 className="text-base font-bold text-slate-200">Student Learning Portal</h3>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Student Learning Portal</span>
>>>>>>> 5c7bb6ee5517a8e81d8f1700798938b8da1056c0
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Khám phá học liệu, tìm kiếm sách, xem video bài giảng và gửi phản hồi.
            </p>
            <Link
              to="/login"
<<<<<<< HEAD
              className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold text-center hover:bg-slate-700"
            >
              Vào không gian người học →
=======
              className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-semibold transition-all"
            >
              Sign in as Student →
>>>>>>> 5c7bb6ee5517a8e81d8f1700798938b8da1056c0
            </Link>
          </div>
        </div>

        <div className="text-xs text-slate-500 flex items-center justify-center gap-2">
          <ServerIcon className="w-4 h-4 text-slate-400" />
          <span>Hạ tầng Spring Boot + Nginx + MinIO</span>
        </div>
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Root Hub */}
            <Route path="/" element={<LandingPortalHub />} />

            {/* Admin Login */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Student flow from Phase 4 Branch A */}
            <Route path="/login" element={<StudentAuthProvider><LoginPage /></StudentAuthProvider>} />
            <Route path="/register" element={<StudentAuthProvider><RegisterPage /></StudentAuthProvider>} />
            <Route path="/student" element={<StudentAuthProvider><StudentProtectedRoute><StudentHomePage /></StudentProtectedRoute></StudentAuthProvider>} />
            <Route path="/student/:type/:id" element={<StudentAuthProvider><StudentProtectedRoute><StudentDetailPage /></StudentProtectedRoute></StudentAuthProvider>} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminLayout />
                </AdminGuard>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="books" element={<BooksPage />} />
              <Route path="videos" element={<VideosPage />} />
              <Route path="feedback" element={<FeedbackPage />} />
              <Route path="users" element={<UsersPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
