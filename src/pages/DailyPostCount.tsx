import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Table, type Column } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import type { DailyPostCountRecord } from '../types';
import {
  fetchDailyPostCountsFromDb,
  addDailyPostCountToDb,
  updateDailyPostCountInDb,
  deleteDailyPostCountFromDb,
} from '../services/postCountService';
import { formatDate } from '../utils/formatters';
import { Layers, Plus, Calendar, Edit3, Trash2, RefreshCw, AlertCircle, CheckCircle2, User } from 'lucide-react';

import { Navigate } from 'react-router-dom';

export const DailyPostCount: React.FC = () => {
  const { role, profile } = useAuth();
  if (role === 'Staff' && profile?.staffCategory !== 'Graphic Designer') {
    return <Navigate to="/dashboard" replace />;
  }

  const { staffList, addToast } = useApp();

  const [postCounts, setPostCounts] = useState<DailyPostCountRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<DailyPostCountRecord | null>(null);

  // Form states
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [postDate, setPostDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [postCount, setPostCount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await fetchDailyPostCountsFromDb();
      setPostCounts(data);
    } catch (err) {
      console.error('Failed to load post counts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const openAddModal = () => {
    setEditingRecord(null);
    setSelectedStaffId('');
    setPostDate(new Date().toISOString().split('T')[0]);
    setPostCount('');
    setNotes('');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (record: DailyPostCountRecord) => {
    setEditingRecord(record);
    setSelectedStaffId(record.staffId);
    setPostDate(record.postDate);
    setPostCount(String(record.postCount));
    setNotes(record.notes || '');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const countNum = Number(postCount);
    if (isNaN(countNum) || countNum < 0) {
      setErrorMsg('Please enter a valid post count (0 or higher).');
      return;
    }

    if (!postDate) {
      setErrorMsg('Please select a valid date.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingRecord) {
        await updateDailyPostCountInDb(editingRecord.id, {
          postDate,
          postCount: countNum,
          notes,
        });
        addToast({
          type: 'success',
          title: 'Record Updated',
          message: `Post count updated to ${countNum} for ${postDate}`,
        });
      } else {
        await addDailyPostCountToDb({
          staffId: selectedStaffId || undefined,
          postDate,
          postCount: countNum,
          notes,
        });
        addToast({
          type: 'success',
          title: 'Post Count Logged',
          message: `Successfully recorded ${countNum} posts for ${postDate}`,
        });
      }
      setIsModalOpen(false);
      await loadRecords();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save post count record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post count record?')) {
      return;
    }

    try {
      await deleteDailyPostCountFromDb(id);
      addToast({
        type: 'info',
        title: 'Record Deleted',
        message: 'Post count record deleted successfully.',
      });
      await loadRecords();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.message || 'Failed to delete record.',
      });
    }
  };

  // Staff options for Admin dropdown
  const staffOptions = [
    { value: '', label: '-- Select Designer (Default: Current User) --' },
    ...staffList
      .filter((s) => !s.staffCategory || s.staffCategory === 'Graphic Designer')
      .map((s) => ({ value: s.id, label: `${s.name} (${s.role})` })),
  ];

  const columns: Column<DailyPostCountRecord>[] = [
    {
      header: 'Date',
      accessor: (row) => (
        <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
          <Calendar className="w-4 h-4 text-teal-600" />
          <span>{formatDate(row.postDate)}</span>
        </div>
      ),
    },
    {
      header: 'Staff Member',
      accessor: (row) => (
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <User className="w-3.5 h-3.5 text-teal-600" />
          <span>{row.staffName || 'Graphic Designer'}</span>
        </div>
      ),
    },
    {
      header: 'Daily Post Count',
      accessor: (row) => (
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-extrabold text-xs">
          {row.postCount} Posts
        </span>
      ),
    },
    {
      header: 'Notes / Details',
      accessor: (row) => (
        <span className="text-xs text-slate-500 truncate max-w-xs block">
          {row.notes || '—'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-teal-600 hover:bg-teal-50 transition-colors cursor-pointer"
            title="Edit Record"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Delete Record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Total posts calculation
  const totalPostsLogged = postCounts.reduce((sum, r) => sum + r.postCount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Post Count"
        subtitle={
          role === 'Admin'
            ? 'Track & manage graphic designers daily artwork / post creation history'
            : 'Log your daily completed design artwork and track your productivity'
        }
        action={
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={loadRecords}
              isLoading={loading}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              onClick={openAddModal}
              icon={<Plus className="w-4 h-4" />}
            >
              + Log Daily Posts
            </Button>
          </div>
        }
      />

      {/* Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500">Total Posts Recorded</p>
            <p className="text-2xl font-black text-teal-600 mt-1">{totalPostsLogged}</p>
          </div>
          <div className="p-3 bg-teal-50 rounded-xl text-teal-600">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500">Entries Logged</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{postCounts.length}</p>
          </div>
          <div className="p-3 bg-slate-100 rounded-xl text-slate-600">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500">Average Posts / Entry</p>
            <p className="text-2xl font-black text-cyan-600 mt-1">
              {postCounts.length > 0 ? (totalPostsLogged / postCounts.length).toFixed(1) : 0}
            </p>
          </div>
          <div className="p-3 bg-cyan-50 rounded-xl text-cyan-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={postCounts}
        keyExtractor={(row) => row.id}
        emptyMessage="No daily post counts recorded yet. Click '+ Log Daily Posts' to add your first record."
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecord ? 'Edit Daily Post Count' : 'Log Daily Post Count'}
        subtitle={
          editingRecord
            ? 'Update your post count record'
            : 'Enter the number of design posts / artworks completed today'
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {role === 'Admin' && !editingRecord && (
            <Select
              label="Assign to Graphic Designer (Admin Only)"
              options={staffOptions}
              value={selectedStaffId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedStaffId(e.target.value)}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Post Date"
              type="date"
              value={postDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPostDate(e.target.value)}
              icon={<Calendar className="w-4 h-4 text-teal-600" />}
              required
            />

            <Input
              label="Number of Completed Posts"
              type="number"
              min="0"
              placeholder="e.g. 12"
              value={postCount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPostCount(e.target.value)}
              icon={<Layers className="w-4 h-4 text-teal-600" />}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Notes / Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Facebook promo banners, client revisions, flyer designs..."
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingRecord ? 'Save Changes' : 'Record Post Count'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
