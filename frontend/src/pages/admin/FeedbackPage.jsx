import React, { useState, useEffect } from 'react';
import { feedbackApi } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { Modal } from '../../components/common/Modal';
import {
  FeedbackIcon,
  SearchIcon,
  EyeIcon,
  RefreshIcon
} from '../../components/common/Icons';

export const FeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { showError } = useToast();

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const data = await feedbackApi.getAll();
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch (err) {
      showError('Failed to load feedback list: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const openDetail = (item) => {
    setSelectedFeedback(item);
    setIsDetailOpen(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString();
    } catch (e) {
      return dateStr;
    }
  };

  const filteredFeedbacks = feedbacks.filter((item) => {
    const matchType = selectedType === 'ALL' || item.targetType === selectedType;
    const matchSearch =
      (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.content || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.userEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Student Feedback & Submissions</h1>
          <p className="text-sm text-slate-400 mt-1">
            Review inquiries, ratings, and course feedback submitted by learners.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchFeedbacks}
            disabled={loading}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-colors"
            title="Refresh list"
          >
            <RefreshIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full md:w-2/3">
          <SearchIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search feedback by title, content, or student email..."
            className="bg-transparent border-none w-full text-slate-100 text-sm placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 font-semibold uppercase whitespace-nowrap">
            Target Type:
          </span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Targets</option>
            <option value="BOOK">Book Feedback</option>
            <option value="VIDEO">Video Feedback</option>
            <option value="SYSTEM">Platform / System</option>
          </select>
        </div>
      </div>

      {/* Feedback Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Fetching student submissions...</p>
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <FeedbackIcon className="w-10 h-10 mx-auto mb-3 text-slate-600" />
            <p className="text-sm font-medium">No feedback items match the selected criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/80 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">Feedback Topic</th>
                  <th className="py-3.5 px-6">Target</th>
                  <th className="py-3.5 px-6">Submitter</th>
                  <th className="py-3.5 px-6">Submitted At</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredFeedbacks.map((item) => {
                  const submitter = item.userEmail || item.user?.email || item.user?.fullName || 'Anonymous / Student';
                  return (
                    <tr key={item.id} className="table-row-hover">
                      <td className="py-4 px-6">
                        <p className="font-semibold text-slate-100">{item.title}</p>
                        <p className="text-xs text-slate-400 max-w-md truncate mt-0.5">
                          {item.content}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                            item.targetType === 'BOOK'
                              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                              : item.targetType === 'VIDEO'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          {item.targetType || 'GENERAL'} {item.targetId ? `#${item.targetId}` : ''}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-300">
                        {submitter}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-400">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => openDetail(item)}
                          title="View Details"
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Feedback Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Feedback Details"
      >
        {selectedFeedback && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold uppercase text-slate-400">Title</span>
              <h4 className="text-base font-bold text-white mt-0.5">{selectedFeedback.title}</h4>
            </div>

            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400">Target Type:</span>
                <span className="ml-1.5 font-semibold text-indigo-400">{selectedFeedback.targetType}</span>
              </div>
              <div>
                <span className="text-slate-400">Target Resource ID:</span>
                <span className="ml-1.5 font-mono text-slate-200">{selectedFeedback.targetId || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400">Submitted By:</span>
                <span className="ml-1.5 text-slate-200">{selectedFeedback.userEmail || selectedFeedback.user?.email || 'Student'}</span>
              </div>
              <div>
                <span className="text-slate-400">Timestamp:</span>
                <span className="ml-1.5 font-mono text-slate-300">{formatDate(selectedFeedback.createdAt)}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase text-slate-400">Full Message Content</span>
              <div className="mt-1.5 p-4 bg-slate-950 rounded-xl border border-slate-800 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                {selectedFeedback.content}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
