import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoryApi, bookApi, videoApi, feedbackApi, getInstanceId } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import {
  BookIcon,
  VideoIcon,
  FolderIcon,
  FeedbackIcon,
  EyeIcon,
  DownloadIcon,
  ServerIcon,
  CloudIcon,
  DatabaseIcon,
  PlusIcon,
  RefreshIcon
} from '../../components/common/Icons';

export const DashboardPage = () => {
  const [stats, setStats] = useState({
    categoriesCount: 0,
    booksCount: 0,
    videosCount: 0,
    feedbacksCount: 0,
    totalBookViews: 0,
    totalBookDownloads: 0,
    totalVideoViews: 0,
    recentBooks: [],
    recentVideos: [],
  });
  const [loading, setLoading] = useState(true);
  const [instanceId, setInstanceId] = useState(getInstanceId());
  const { showError } = useToast();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [categories, books, videos, feedbacks] = await Promise.all([
        categoryApi.getAll().catch(() => []),
        bookApi.getAll().catch(() => []),
        videoApi.getAll().catch(() => []),
        feedbackApi.getAll().catch(() => []),
      ]);

      const catList = Array.isArray(categories) ? categories : [];
      const bookList = Array.isArray(books) ? books : [];
      const videoList = Array.isArray(videos) ? videos : [];
      const feedbackList = Array.isArray(feedbacks) ? feedbacks : [];

      const totalBookViews = bookList.reduce((acc, b) => acc + (b.viewCount || 0), 0);
      const totalBookDownloads = bookList.reduce((acc, b) => acc + (b.downloadCount || 0), 0);
      const totalVideoViews = videoList.reduce((acc, v) => acc + (v.viewCount || 0), 0);

      setStats({
        categoriesCount: catList.length,
        booksCount: bookList.length,
        videosCount: videoList.length,
        feedbacksCount: feedbackList.length,
        totalBookViews,
        totalBookDownloads,
        totalVideoViews,
        recentBooks: bookList.slice(-5).reverse(),
        recentVideos: videoList.slice(-5).reverse(),
      });
      setInstanceId(getInstanceId());
    } catch (err) {
      showError('Failed to load dashboard metrics: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#193431] tracking-tight">Tổng quan hệ thống</h1>
          <p className="text-sm text-slate-400 mt-1">
            Theo dõi học liệu, mức độ sử dụng và hạ tầng đang phục vụ.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-800 transition-colors flex items-center gap-2"
          >
            <RefreshIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới số liệu</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Books Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tổng số sách</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <BookIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#193431]">{stats.booksCount}</span>
            <p className="text-xs text-slate-400 mt-1">Sách và tài liệu</p>
          </div>
        </div>

        {/* Videos Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tổng số video</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <VideoIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#193431]">{stats.videosCount}</span>
            <p className="text-xs text-slate-400 mt-1">Bài giảng trực tuyến</p>
          </div>
        </div>

        {/* Categories Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Danh mục</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <FolderIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#193431]">{stats.categoriesCount}</span>
            <p className="text-xs text-slate-400 mt-1">Chủ đề học tập</p>
          </div>
        </div>

        {/* Feedback Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Phản hồi</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <FeedbackIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#193431]">{stats.feedbacksCount}</span>
            <p className="text-xs text-slate-400 mt-1">Ý kiến người học</p>
          </div>
        </div>
      </div>

      {/* Cloud & Architecture Telemetry */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-800">
          <CloudIcon className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-[#193431]">Theo dõi hạ tầng cloud</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ServerIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Máy chủ đang phục vụ</p>
              <p className="font-mono text-emerald-400 font-bold mt-1 text-sm">
                {instanceId !== 'unknown' ? instanceId : 'backend-pool'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Phân phối qua Nginx</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <CloudIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Lưu trữ tệp</p>
              <p className="text-slate-100 font-bold mt-1 text-sm">MinIO S3 Bucket</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Kho: elearning-media</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <DatabaseIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Cơ sở dữ liệu</p>
              <p className="text-slate-100 font-bold mt-1 text-sm">PostgreSQL 16</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Tìm kiếm toàn văn</p>
            </div>
          </div>
        </div>
      </div>

      {/* Aggregate Usage Stats & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usage Stats Column */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-[#193431] uppercase tracking-wider text-slate-300">
            Mức độ sử dụng học liệu
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <EyeIcon className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-medium text-slate-300">Lượt xem sách</span>
              </div>
              <span className="font-bold text-sm text-slate-100">{stats.totalBookViews}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <DownloadIcon className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-medium text-slate-300">Lượt tải sách</span>
              </div>
              <span className="font-bold text-sm text-slate-100">{stats.totalBookDownloads}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <EyeIcon className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-medium text-slate-300">Lượt xem video</span>
              </div>
              <span className="font-bold text-sm text-slate-100">{stats.totalVideoViews}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <p className="text-xs text-slate-400 mb-3 font-semibold uppercase">Thao tác nhanh</p>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/admin/books"
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium rounded-xl text-center text-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <PlusIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Thêm sách</span>
              </Link>
              <Link
                to="/admin/videos"
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium rounded-xl text-center text-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <PlusIcon className="w-3.5 h-3.5 text-blue-400" />
                <span>Thêm video</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Books & Videos Table Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Books */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#193431] uppercase tracking-wider text-slate-300">
                Sách mới cập nhật
              </h3>
              <Link to="/admin/books" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                Xem toàn bộ →
              </Link>
            </div>

            {stats.recentBooks.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">Chưa có sách trong thư viện.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="pb-2">Title</th>
                      <th className="pb-2">Author</th>
                      <th className="pb-2">Storage Status</th>
                      <th className="pb-2 text-right">Views</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {stats.recentBooks.map((book) => (
                      <tr key={book.id} className="table-row-hover">
                        <td className="py-2.5 font-medium text-slate-100">{book.title}</td>
                        <td className="py-2.5 text-slate-400">{book.author || 'N/A'}</td>
                        <td className="py-2.5">
                          {book.storageKey ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium text-[11px] border border-emerald-500/20">
                              Uploaded (MinIO)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium text-[11px] border border-amber-500/20">
                              No PDF
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 text-right font-mono">{book.viewCount || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
