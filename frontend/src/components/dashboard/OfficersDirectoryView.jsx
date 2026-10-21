import React, { useState } from 'react';
import { 
  Users, UserPlus, Search, Building2, Phone, Mail, 
  MapPin, Trash2, CheckCircle2, ShieldCheck, RefreshCw 
} from 'lucide-react';
import { deleteOfficer } from '../../services/complaintService';

export default function OfficersDirectoryView({
  officers = [],
  loading = false,
  onRefresh,
  onOpenAddModal
}) {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [deletingId, setDeletingId] = useState(null);

  const departmentsList = [
    'All',
    'Water Supply Department',
    'Public Works Department',
    'Health & Sanitation Department',
    'Power & Electricity Board',
    'Municipal Lighting Division',
    'Department of Public Instruction',
    'Solid Waste Management',
    'General Civic Administration'
  ];

  const filteredOfficers = officers.filter((off) => {
    const matchesSearch = !search || 
      off.name?.toLowerCase().includes(search.toLowerCase()) ||
      off.officer_id?.toLowerCase().includes(search.toLowerCase()) ||
      off.department?.toLowerCase().includes(search.toLowerCase()) ||
      off.zone?.toLowerCase().includes(search.toLowerCase());

    const matchesDept = selectedDept === 'All' || off.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleDelete = async (officerId, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} (${officerId}) from the directory?`)) {
      return;
    }

    setDeletingId(officerId);
    try {
      await deleteOfficer(officerId);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Error deleting officer: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-800">
              Departmental Officers Directory
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {officers.length} Registered
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registered nodal authorities in MongoDB authorized to receive formal grievance work orders.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
              title="Refresh from MongoDB"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          )}

          <button
            type="button"
            onClick={onOpenAddModal}
            className="bg-[#1e6bf3] hover:bg-blue-700 text-white rounded-xl px-5 py-2.5 flex items-center gap-2 text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add New Officer</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, zone..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-slate-400 font-medium">Department:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none font-medium text-xs cursor-pointer"
          >
            {departmentsList.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Officers Grid */}
      {loading ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
          <RefreshCw className="h-7 w-7 text-blue-600 animate-spin mx-auto mb-2" />
          <span className="text-xs text-slate-500 font-medium">Loading officers from MongoDB...</span>
        </div>
      ) : filteredOfficers.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Users className="h-6 w-6 stroke-[1.5]" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Officers Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No officer records matching your criteria. Use the "Add New Officer" button above to register an officer in MongoDB.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOfficers.map((off) => (
            <div
              key={off.officer_id || off.id}
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold font-mono text-blue-600 block">
                      {off.officer_id}
                    </span>
                    <h3 className="text-sm font-bold text-slate-800 leading-tight mt-0.5">
                      {off.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {off.designation || 'Nodal Officer'}
                    </p>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {off.status || 'Active'}
                  </span>
                </div>

                <div className="space-y-2 pt-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    <span className="font-semibold text-slate-800 truncate">{off.department}</span>
                  </div>

                  {off.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{off.email}</span>
                    </div>
                  )}

                  {off.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      <span>{off.phone}</span>
                    </div>
                  )}

                  {off.zone && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />
                      <span className="truncate">{off.zone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400">
                  Registered in MongoDB
                </span>
                <button
                  type="button"
                  disabled={deletingId === off.officer_id}
                  onClick={() => handleDelete(off.officer_id, off.name)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete Officer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
