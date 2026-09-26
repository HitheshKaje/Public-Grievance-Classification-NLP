// src/pages/ComplaintsPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText,
  Filter,
  Download,
  Plus,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import FilterBar from '../components/complaints/FilterBar';
import ComplaintTable from '../components/complaints/ComplaintTable';
import ComplaintDetailModal from '../components/complaints/ComplaintDetailModal';
import { getComplaints, updateComplaintStatus } from '../services/api';

export default function ComplaintsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [filters, setFilters] = useState({
    search: initialSearch,
    category: 'All',
    status: 'All',
    sortBy: 'newest'
  });

  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [data, setData] = useState({ complaints: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Sync when search parameter in URL changes (e.g. from header search bar)
  useEffect(() => {
    const urlQuery = searchParams.get('search');
    if (urlQuery !== null && urlQuery !== filters.search) {
      setFilters((prev) => ({ ...prev, search: urlQuery }));
      setPage(1);
    }
  }, [searchParams]);

  const fetchComplaintsData = async () => {
    setLoading(true);
    try {
      const res = await getComplaints({
        ...filters,
        page,
        limit
      });
      setData(res);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintsData();
  }, [filters, page]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
    if (key === 'search') {
      if (value) {
        setSearchParams({ search: value });
      } else {
        setSearchParams({});
      }
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: 'All',
      status: 'All',
      sortBy: 'newest'
    });
    setPage(1);
    setSearchParams({});
  };

  const handleStatusChange = async (id, newStatus) => {
    await updateComplaintStatus(id, newStatus);
    setData((prev) => ({
      ...prev,
      complaints: prev.complaints.map((c) =>
        c.id === id ? { ...c, status: newStatus } : c
      )
    }));
    if (selectedComplaint && selectedComplaint.id === id) {
      setSelectedComplaint((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const handleExportCSV = () => {
    const headers = ['Complaint ID', 'Text', 'Category', 'Confidence', 'Status', 'Date', 'Department'];
    const rows = data.complaints.map((c) => [
      c.id,
      `"${c.text.replace(/"/g, '""')}"`,
      c.category,
      `${Math.round(c.confidence * 100)}%`,
      c.status,
      c.date,
      c.department || 'N/A'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `public_grievances_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Complaints Register
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Central repository of citizen grievances with automated NLP triage and audit logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <Link
            to="/classify"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Complaint</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Complaints Table */}
      <ComplaintTable
        complaints={data.complaints}
        total={data.total}
        page={page}
        limit={limit}
        totalPages={data.totalPages}
        onPageChange={setPage}
        onSelectComplaint={(c) => setSelectedComplaint(c)}
        loading={loading}
      />

      {/* Detailed Complaint Modal */}
      <ComplaintDetailModal
        complaint={selectedComplaint}
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
