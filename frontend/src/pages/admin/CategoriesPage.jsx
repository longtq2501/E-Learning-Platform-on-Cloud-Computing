import React, { useState, useEffect } from 'react';
import { categoryApi } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { Modal } from '../../components/common/Modal';
import {
  FolderIcon,
  PlusIcon,
  SearchIcon,
  EditIcon,
  TrashIcon,
  RefreshIcon
} from '../../components/common/Icons';

export const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { showSuccess, showError } = useToast();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryApi.getAll();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      showError('Failed to load categories: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setFormName('');
    setFormDescription('');
    setIsCreateOpen(true);
  };

  const openEditModal = (cat) => {
    setSelectedCategory(cat);
    setFormName(cat.name || '');
    setFormDescription(cat.description || '');
    setIsEditOpen(true);
  };

  const openDeleteModal = (cat) => {
    setSelectedCategory(cat);
    setIsDeleteOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      showError('Category name is required');
      return;
    }
    setSubmitting(true);
    try {
      await categoryApi.create({
        name: formName.trim(),
        description: formDescription.trim(),
      });
      showSuccess(`Category "${formName.trim()}" created successfully`);
      setIsCreateOpen(false);
      fetchCategories();
    } catch (err) {
      showError(err.message || 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      showError('Category name is required');
      return;
    }
    setSubmitting(true);
    try {
      await categoryApi.update(selectedCategory.id, {
        name: formName.trim(),
        description: formDescription.trim(),
      });
      showSuccess(`Category "${formName.trim()}" updated successfully`);
      setIsEditOpen(false);
      fetchCategories();
    } catch (err) {
      showError(err.message || 'Failed to update category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await categoryApi.delete(selectedCategory.id);
      showSuccess(`Category "${selectedCategory.name}" deleted successfully`);
      setIsDeleteOpen(false);
      fetchCategories();
    } catch (err) {
      showError(err.message || 'Failed to delete category');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    (cat.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Category Management</h1>
          <p className="text-sm text-slate-400 mt-1">
            Organize catalog topics and metadata classifications.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCategories}
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
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
        <SearchIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter categories by title or description..."
          className="bg-transparent border-none w-full text-slate-100 text-sm placeholder-slate-500 focus:outline-none"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-800 rounded-md"
          >
            Clear
          </button>
        )}
      </div>

      {/* Categories Table Card */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Fetching categories from database...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <FolderIcon className="w-10 h-10 mx-auto mb-3 text-slate-600" />
            <p className="text-sm font-medium">No categories found matching your query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/80 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">Category Name</th>
                  <th className="py-3.5 px-6">Description</th>
                  <th className="py-3.5 px-6">Category ID</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="table-row-hover">
                    <td className="py-4 px-6 font-semibold text-slate-100 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 flex-shrink-0">
                        <FolderIcon className="w-4 h-4" />
                      </div>
                      <span>{cat.name}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-400 max-w-md truncate">
                      {cat.description || 'No description provided.'}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-500">
                      #{cat.id}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          title="Edit Category"
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(cat)}
                          title="Delete Category"
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Category Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Category"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Cloud Architecture, Data Engineering"
              required
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Brief description of the domain topic..."
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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
              {submitting ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Category"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
            />
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
              {submitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Category Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Are you sure you want to delete category{' '}
            <span className="font-bold text-white">"{selectedCategory?.name}"</span>?
          </p>
          <p className="text-xs text-amber-400/90 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
            Warning: Removing this category may disassociate existing books and videos assigned to it.
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
