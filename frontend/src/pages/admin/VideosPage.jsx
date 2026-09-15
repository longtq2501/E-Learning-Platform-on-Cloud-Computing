import React, { useState, useEffect } from 'react';
import { videoApi, categoryApi } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { Modal } from '../../components/common/Modal';
import {
  VideoIcon,
  PlusIcon,
  SearchIcon,
  EditIcon,
  TrashIcon,
  UploadIcon,
  PlayIcon,
  RefreshIcon
} from '../../components/common/Icons';

export const VideosPage = () => {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewStreamUrl, setPreviewStreamUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { showSuccess, showError, showInfo } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [videoData, catData] = await Promise.all([
        videoApi.getAll(selectedCategoryId || null),
        categoryApi.getAll().catch(() => []),
      ]);
      setVideos(Array.isArray(videoData) ? videoData : []);
      setCategories(Array.isArray(catData) ? catData : []);
    } catch (err) {
      showError('Failed to load videos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategoryId]);

  const openCreateModal = () => {
    setFormTitle('');
    setFormDescription('');
    setFormDuration('600');
    setFormCategoryId(categories[0]?.id ? String(categories[0].id) : '');
    setIsCreateOpen(true);
  };

  const openEditModal = (video) => {
    setSelectedVideo(video);
    setFormTitle(video.title || '');
    setFormDescription(video.description || '');
    setFormDuration(video.durationSeconds ? String(video.durationSeconds) : '0');
    setFormCategoryId(video.categoryId ? String(video.categoryId) : (video.category?.id ? String(video.category.id) : ''));
    setIsEditOpen(true);
  };

  const openUploadModal = (video) => {
    setSelectedVideo(video);
    setUploadFile(null);
    setUploadProgress(0);
    setIsUploadOpen(true);
  };

  const openPreviewModal = async (video) => {
    setSelectedVideo(video);
    setPreviewStreamUrl('');
    setIsPreviewOpen(true);
    try {
      showInfo('Requesting MinIO presigned streaming URL...');
      const streamData = await videoApi.getStreamUrl(video.id);
      const url = streamData.streamUrl || streamData.url;
      if (url) {
        setPreviewStreamUrl(url);
      } else {
        showError('No streaming URL returned for this video');
      }
    } catch (err) {
      showError('Failed to obtain stream URL: ' + err.message);
    }
  };

  const openDeleteModal = (video) => {
    setSelectedVideo(video);
    setIsDeleteOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showError('Video title is required');
      return;
    }
    setSubmitting(true);
    try {
      const created = await videoApi.create({
        title: formTitle.trim(),
        description: formDescription.trim(),
        durationSeconds: formDuration ? Number(formDuration) : 0,
        categoryId: formCategoryId ? Number(formCategoryId) : null,
      });
      showSuccess(`Video "${formTitle.trim()}" created successfully`);
      setIsCreateOpen(false);
      loadData();
      if (created?.id) {
        openUploadModal(created);
      }
    } catch (err) {
      showError(err.message || 'Failed to create video record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showError('Video title is required');
      return;
    }
    setSubmitting(true);
    try {
      await videoApi.update(selectedVideo.id, {
        title: formTitle.trim(),
        description: formDescription.trim(),
        durationSeconds: formDuration ? Number(formDuration) : 0,
        categoryId: formCategoryId ? Number(formCategoryId) : null,
      });
      showSuccess(`Video "${formTitle.trim()}" updated successfully`);
      setIsEditOpen(false);
      loadData();
    } catch (err) {
      showError(err.message || 'Failed to update video');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      showError('Please select an MP4 video file to upload');
      return;
    }
    if (uploadFile.size > 500 * 1024 * 1024) {
      showError('Video file is too large. Maximum size is 500 MB');
      return;
    }
    setSubmitting(true);
    setUploadProgress(10);
    try {
      await videoApi.uploadFile(selectedVideo.id, uploadFile, (progress) => {
        setUploadProgress(progress);
      });
      showSuccess(`MP4 video uploaded to MinIO successfully for "${selectedVideo.title}"`);
      setIsUploadOpen(false);
      loadData();
    } catch (err) {
      showError(err.message || 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await videoApi.delete(selectedVideo.id);
      showSuccess(`Video "${selectedVideo.title}" deleted successfully`);
      setIsDeleteOpen(false);
      loadData();
    } catch (err) {
      showError(err.message || 'Failed to delete video');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredVideos = videos.filter((v) =>
    (v.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Video & Media Management</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage lecture streams, MP4 uploads to MinIO, and presigned streaming verification.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-colors"
            title="Refresh list"
          >
            <RefreshIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Video</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full md:w-2/3">
          <SearchIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search videos by title or topic..."
            className="bg-transparent border-none w-full text-slate-100 text-sm placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 font-semibold uppercase whitespace-nowrap">
            Category:
          </span>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Videos Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Loading video catalog...</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <VideoIcon className="w-10 h-10 mx-auto mb-3 text-slate-600" />
            <p className="text-sm font-medium">No video records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/80 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">Video Title</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Duration</th>
                  <th className="py-3.5 px-6">MinIO Storage Status</th>
                  <th className="py-3.5 px-6">Views</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredVideos.map((video) => {
                  const catName =
                    video.category?.name ||
                    categories.find((c) => c.id === video.categoryId)?.name ||
                    'General';

                  return (
                    <tr key={video.id} className="table-row-hover">
                      <td className="py-4 px-6">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 flex-shrink-0 mt-0.5">
                            <VideoIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-100">{video.title}</p>
                            <p className="text-xs text-slate-400 max-w-sm truncate mt-0.5">
                              {video.description || 'No description provided.'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-blue-300 text-xs font-medium border border-slate-700">
                          {catName}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-300">
                        {formatDuration(video.durationSeconds)}
                      </td>
                      <td className="py-4 px-6">
                        {video.storageKey ? (
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-medium text-xs border border-emerald-500/20">
                              Stream Ready ({formatFileSize(video.fileSize)})
                            </span>
                            <button
                              onClick={() => openPreviewModal(video)}
                              title="Preview Streaming Video"
                              className="p-1 text-slate-400 hover:text-blue-400 rounded transition-colors"
                            >
                              <PlayIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 font-medium text-xs border border-amber-500/20">
                            No MP4 uploaded
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-300">
                        {video.viewCount || 0}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {video.storageKey && (
                            <button
                              onClick={() => openPreviewModal(video)}
                              title="Play Video Stream"
                              className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <PlayIcon className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => openUploadModal(video)}
                            title="Upload MP4 to MinIO"
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <UploadIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(video)}
                            title="Edit Metadata"
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <EditIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(video)}
                            title="Delete Video"
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Video Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Video Record"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Video Title *
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Introduction to Kubernetes & Container Orchestration"
              required
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Duration (Seconds)
              </label>
              <input
                type="number"
                value={formDuration}
                onChange={(e) => setFormDuration(e.target.value)}
                placeholder="600"
                min="0"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Category
              </label>
              <select
                value={formCategoryId}
                onChange={(e) => setFormCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Select Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Lecture notes and overview..."
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              {submitting ? 'Creating...' : 'Create & Proceed to Upload'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Video Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Video Metadata"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Video Title *
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Duration (Seconds)
              </label>
              <input
                type="number"
                value={formDuration}
                onChange={(e) => setFormDuration(e.target.value)}
                min="0"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Category
              </label>
              <select
                value={formCategoryId}
                onChange={(e) => setFormCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Select Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Upload MP4 Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title={`Upload MP4 to MinIO: "${selectedVideo?.title}"`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-dashed border-slate-700 text-center">
            <UploadIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-xs text-slate-300 font-medium mb-1">Select MP4 video file</p>
            <p className="text-[11px] text-slate-500 mb-3">Stored directly in MinIO for S3-compatible streaming</p>
            <input
              type="file"
              accept="video/mp4,.mp4"
              onChange={(e) => setUploadFile(e.target.files[0])}
              className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
            />
          </div>

          {uploadFile && (
            <div className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex justify-between">
              <span>{uploadFile.name}</span>
              <span className="font-mono text-slate-400">{formatFileSize(uploadFile.size)}</span>
            </div>
          )}

          {submitting && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Streaming upload to MinIO...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsUploadOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !uploadFile}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              {submitting ? 'Uploading...' : 'Upload MP4'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Video Streaming Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={`Stream Preview: "${selectedVideo?.title}"`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          {previewStreamUrl ? (
            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
              <video
                src={previewStreamUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          ) : (
            <div className="aspect-video bg-slate-950 rounded-xl flex items-center justify-center text-slate-400">
              <div className="text-center">
                <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs">Fetching Presigned Stream URL...</p>
              </div>
            </div>
          )}

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">MinIO Presigned Stream:</span> The video payload is streamed directly from object storage via secure temporary token.
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium"
            >
              Close Preview
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Video Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Video Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Are you sure you want to delete video{' '}
            <span className="font-bold text-white">"{selectedVideo?.title}"</span>?
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsDeleteOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              {submitting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
