import React, { useState, useEffect } from 'react';
import { bookApi, categoryApi } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { Modal } from '../../components/common/Modal';
import {
  BookIcon,
  PlusIcon,
  SearchIcon,
  EditIcon,
  TrashIcon,
  UploadIcon,
  DownloadIcon,
  EyeIcon,
  RefreshIcon
} from '../../components/common/Icons';

export const BooksPage = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const { showSuccess, showError, showInfo } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookData, catData] = await Promise.all([
        bookApi.getAll(selectedCategoryId || null),
        categoryApi.getAll().catch(() => []),
      ]);
      setBooks(Array.isArray(bookData) ? bookData : []);
      setCategories(Array.isArray(catData) ? catData : []);
    } catch (err) {
      showError('Failed to load books: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategoryId]);

  const openCreateModal = () => {
    setFormTitle('');
    setFormAuthor('');
    setFormDescription('');
    setFormCategoryId(categories[0]?.id ? String(categories[0].id) : '');
    setIsCreateOpen(true);
  };

  const openEditModal = (book) => {
    setSelectedBook(book);
    setFormTitle(book.title || '');
    setFormAuthor(book.author || '');
    setFormDescription(book.description || '');
    setFormCategoryId(book.categoryId ? String(book.categoryId) : (book.category?.id ? String(book.category.id) : ''));
    setIsEditOpen(true);
  };

  const openUploadModal = (book) => {
    setSelectedBook(book);
    setUploadFile(null);
    setUploadProgress(0);
    setIsUploadOpen(true);
  };

  const openDeleteModal = (book) => {
    setSelectedBook(book);
    setIsDeleteOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showError('Book title is required');
      return;
    }
    if (!formAuthor.trim()) {
      showError('Book author is required');
      return;
    }
    if (!formCategoryId) {
      showError('Create a category first, then select it for this book');
      return;
    }
    setSubmitting(true);
    try {
      const created = await bookApi.create({
        title: formTitle.trim(),
        author: formAuthor.trim(),
        description: formDescription.trim(),
        categoryId: formCategoryId ? Number(formCategoryId) : null,
      });
      showSuccess(`Book "${formTitle.trim()}" created successfully`);
      setIsCreateOpen(false);
      loadData();
      // Prompt upload immediately
      if (created?.id) {
        openUploadModal(created);
      }
    } catch (err) {
      showError(err.message || 'Failed to create book metadata');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showError('Book title is required');
      return;
    }
    if (!formAuthor.trim()) {
      showError('Book author is required');
      return;
    }
    if (!formCategoryId) {
      showError('Select a category for this book');
      return;
    }
    setSubmitting(true);
    try {
      await bookApi.update(selectedBook.id, {
        title: formTitle.trim(),
        author: formAuthor.trim(),
        description: formDescription.trim(),
        categoryId: formCategoryId ? Number(formCategoryId) : null,
      });
      showSuccess(`Book "${formTitle.trim()}" updated successfully`);
      setIsEditOpen(false);
      loadData();
    } catch (err) {
      showError(err.message || 'Failed to update book');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      showError('Please select a PDF file to upload');
      return;
    }
    setSubmitting(true);
    setUploadProgress(10);
    try {
      await bookApi.uploadFile(selectedBook.id, uploadFile, (progress) => {
        setUploadProgress(progress);
      });
      showSuccess(`PDF file uploaded to MinIO successfully for "${selectedBook.title}"`);
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
      await bookApi.delete(selectedBook.id);
      showSuccess(`Book "${selectedBook.title}" deleted successfully`);
      setIsDeleteOpen(false);
      loadData();
    } catch (err) {
      showError(err.message || 'Failed to delete book');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadCheck = async (book) => {
    try {
      showInfo('Fetching MinIO presigned download URL...');
      const downloadData = await bookApi.getDownloadUrl(book.id);
      const url = downloadData.downloadUrl || downloadData.url;
      if (url) {
        window.open(url, '_blank');
      } else {
        showError('No download URL returned from object storage');
      }
    } catch (err) {
      showError('Failed to get download URL: ' + err.message);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredBooks = books.filter((b) =>
    (b.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.author || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Book & Document Management</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage e-books, metadata records, and MinIO object storage PDF uploads.
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
            <span>Add Book</span>
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
            placeholder="Search books by title, author, or keyword..."
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

      {/* Books Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Querying books catalog...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <BookIcon className="w-10 h-10 mx-auto mb-3 text-slate-600" />
            <p className="text-sm font-medium">No books found in this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/80 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">Book Title & Author</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Storage Status</th>
                  <th className="py-3.5 px-6">Size</th>
                  <th className="py-3.5 px-6">Views / Downloads</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredBooks.map((book) => {
                  const catName =
                    book.category?.name ||
                    categories.find((c) => c.id === book.categoryId)?.name ||
                    'General';

                  return (
                    <tr key={book.id} className="table-row-hover">
                      <td className="py-4 px-6">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 flex-shrink-0 mt-0.5">
                            <BookIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-100">{book.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {book.author ? `by ${book.author}` : 'Author unknown'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-indigo-300 text-xs font-medium border border-slate-700">
                          {catName}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {book.storageKey ? (
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-medium text-xs border border-emerald-500/20">
                              Uploaded (MinIO)
                            </span>
                            <button
                              onClick={() => handleDownloadCheck(book)}
                              title="Test Presigned Download"
                              className="p-1 text-slate-400 hover:text-emerald-400 rounded transition-colors"
                            >
                              <DownloadIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 font-medium text-xs border border-amber-500/20">
                            No PDF attached
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-400">
                        {formatFileSize(book.fileSize)}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs">
                        <span className="text-slate-300">{book.viewCount || 0} views</span>
                        <span className="text-slate-500 mx-1.5">/</span>
                        <span className="text-emerald-400">{book.downloadCount || 0} dl</span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openUploadModal(book)}
                            title="Upload PDF to MinIO"
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <UploadIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(book)}
                            title="Edit Metadata"
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <EditIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(book)}
                            title="Delete Book"
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

      {/* Create Book Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Book Record"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Book Title *
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Distributed Systems & Cloud Computing"
              required
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Author
              </label>
              <input
                type="text"
                value={formAuthor}
                onChange={(e) => setFormAuthor(e.target.value)}
                placeholder="Author name"
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
              placeholder="Summary or syllabus overview..."
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

      {/* Edit Book Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Book Metadata"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Book Title *
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
                Author
              </label>
              <input
                type="text"
                value={formAuthor}
                onChange={(e) => setFormAuthor(e.target.value)}
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

      {/* Upload PDF to MinIO Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title={`Upload PDF to MinIO: "${selectedBook?.title}"`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-dashed border-slate-700 text-center">
            <UploadIcon className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
            <p className="text-xs text-slate-300 font-medium mb-1">Select PDF document file</p>
            <p className="text-[11px] text-slate-500 mb-3">File will be stored in MinIO S3 object storage</p>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => setUploadFile(e.target.files[0])}
              className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
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
                <span>Uploading binary payload...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300"
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
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              {submitting ? 'Uploading to MinIO...' : 'Upload PDF'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Book Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Book Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Are you sure you want to delete book{' '}
            <span className="font-bold text-white">"{selectedBook?.title}"</span>?
          </p>
          <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
            Note: In cloud architecture, removing metadata in PostgreSQL cleans up catalog records. MinIO object lifecycle is decoupled.
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
