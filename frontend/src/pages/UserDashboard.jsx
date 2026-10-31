import React, { useState, useEffect, useCallback } from 'react';
import ReportProblemHero from '../components/user/ReportProblemHero';
import TrackComplaintCard from '../components/user/TrackComplaintCard';
import UserRecentComplaintsCard from '../components/user/UserRecentComplaintsCard';
import MyComplaintsStatCard from '../components/user/MyComplaintsStatCard';
import ComplaintStatusCard from '../components/user/ComplaintStatusCard';
import UserQuickActionsCard from '../components/user/UserQuickActionsCard';
import CommonCategoriesCard from '../components/user/CommonCategoriesCard';
import ComplaintSubmissionContainer from '../components/user/submission/ComplaintSubmissionContainer';
import UserTrackingView from '../components/user/UserTrackingView';
import { 
  fetchUserStats, 
  getLocalUserComplaintIds,
  saveLocalUserComplaintId 
} from '../services/complaintService';
import { 
  RefreshCw, Globe, User, Mail, Phone, ShieldCheck, 
  Calendar, CheckCircle2, Clock, AlertCircle, Headphones, 
  PhoneCall, MapPin, ExternalLink, HelpCircle, Send, FileText, ArrowRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function UserDashboard({ activeTab = 'dashboard', onNavigateTab, currentUser }) {
  const { t } = useLanguage();
  const [trackedId, setTrackedId] = useState(null);
  const [scope, setScope] = useState('my'); // 'my' | 'all'
  const [loadingStats, setLoadingStats] = useState(false);
  const [userStats, setUserStats] = useState({
    total: 0,
    in_progress: 0,
    in_processing: 0,
    pending: 0,
    resolved: 0,
    rejected: 0,
  });
  const [systemStats, setSystemStats] = useState({
    total: 0,
    in_processing: 0,
  });
  const [complaints, setComplaints] = useState([]);

  // Fetch live stats & recent complaints from MongoDB
  const loadCitizenStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const storedIds = getLocalUserComplaintIds();

      if (scope === 'my') {
        const queryParams = {};
        if (storedIds.length > 0) {
          queryParams.complaintIds = storedIds.join(',');
        }
        if (currentUser?.email) {
          queryParams.email = currentUser.email;
        }
        if (currentUser?.phone) {
          queryParams.phone = currentUser.phone;
        }
        if (currentUser?.id) {
          queryParams.citizenId = currentUser.id;
        }

        const hasFilter = Boolean(queryParams.complaintIds || queryParams.email || queryParams.phone || queryParams.citizenId);

        if (hasFilter) {
          const data = await fetchUserStats(queryParams);
          setUserStats({
            total: data.total ?? 0,
            in_progress: data.in_progress ?? 0,
            in_processing: data.in_processing ?? data.in_progress ?? 0,
            pending: data.pending ?? 0,
            resolved: data.resolved ?? 0,
            rejected: data.rejected ?? 0,
          });
          setComplaints(data.recent_complaints || []);
          setSystemStats({
            total: data.system_total ?? 0,
            in_processing: data.system_in_progress ?? 0,
          });
        } else {
          const systemData = await fetchUserStats();
          setUserStats({
            total: 0,
            in_progress: 0,
            in_processing: 0,
            pending: 0,
            resolved: 0,
            rejected: 0,
          });
          setComplaints([]);
          setSystemStats({
            total: systemData.system_total ?? systemData.total ?? 0,
            in_processing: systemData.system_in_progress ?? systemData.in_progress ?? 0,
          });
        }
      } else {
        const data = await fetchUserStats();
        setUserStats({
          total: data.total ?? 0,
          in_progress: data.in_progress ?? 0,
          in_processing: data.in_processing ?? data.in_progress ?? 0,
          pending: data.pending ?? 0,
          resolved: data.resolved ?? 0,
          rejected: data.rejected ?? 0,
        });
        setComplaints(data.recent_complaints || []);
        setSystemStats({
          total: data.system_total ?? data.total ?? 0,
          in_processing: data.system_in_progress ?? data.in_progress ?? 0,
        });
      }
    } catch (err) {
      console.error('Error fetching citizen dashboard stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }, [scope, currentUser]);

  useEffect(() => {
    loadCitizenStats();
  }, [loadCitizenStats]);

  // Listener for newly submitted grievances
  useEffect(() => {
    const handleNewSubmission = () => {
      setScope('my');
      loadCitizenStats();
    };
    window.addEventListener('pgms_complaint_submitted', handleNewSubmission);
    return () => window.removeEventListener('pgms_complaint_submitted', handleNewSubmission);
  }, [loadCitizenStats]);

  const handleTrack = (id) => {
    if (id && typeof id === 'string') {
      saveLocalUserComplaintId(id);
    }
    setTrackedId(id);
    if (onNavigateTab) onNavigateTab('track');
  };

  const handleComplaintDeleted = (deletedId) => {
    setComplaints(prev => prev.filter(c => (c.complaint_id || c.id) !== deletedId));
    loadCitizenStats();
  };

  // 1. Submit Complaint View
  if (activeTab === 'submit') {
    return (
      <ComplaintSubmissionContainer
        onNavigateTab={onNavigateTab}
        onTrackGrievance={handleTrack}
        currentUser={currentUser}
        onGrievanceSubmitted={() => {
          setScope('my');
          loadCitizenStats();
        }}
      />
    );
  }

  // 2. My Complaints View (with Delete Option)
  if (activeTab === 'my_complaints') {
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">My Registered Grievances</h2>
            <p className="text-xs text-slate-500 mt-1">
              Complete history of grievances submitted through your citizen account with live tracking and delete control.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
              {userStats.in_processing} In Processing
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              {userStats.total} Total
            </span>
            <button
              type="button"
              onClick={loadCitizenStats}
              title="Refresh complaints"
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${loadingStats ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        <UserRecentComplaintsCard
          complaints={complaints}
          loading={loadingStats}
          onTrack={handleTrack}
          onComplaintDeleted={handleComplaintDeleted}
          onSubmitNew={() => onNavigateTab && onNavigateTab('submit')}
        />
      </div>
    );
  }

  // 3. Track Complaint View
  if (activeTab === 'track') {
    return <UserTrackingView initialTrackedId={trackedId} />;
  }

  // 4. Citizen Profile View (User Details)
  if (activeTab === 'profile') {
    const displayName = currentUser?.name || 'Aarav Sharma';
    const displayEmail = currentUser?.email || 'citizen@gmail.com';
    const citizenId = currentUser?.citizen_id || 'CIT-2026-001';
    const phone = currentUser?.phone || '+91 91234 56789';
    const role = currentUser?.role || 'citizen';
    const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    return (
      <div className="space-y-6">
        {/* Profile Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 relative z-10">
            <div className="h-20 w-20 rounded-2xl bg-white text-emerald-800 flex items-center justify-center font-extrabold text-2xl shadow-lg border-2 border-white/30 flex-shrink-0">
              {initials}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 border border-white/25">
                  Registered Citizen Profile
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-100 bg-emerald-900/40 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  MongoDB Verified
                </span>
              </div>
              <h1 className="text-2xl font-bold mt-1.5">{displayName}</h1>
              <p className="text-xs text-emerald-100 mt-0.5 flex items-center gap-3">
                <span>Citizen ID: <strong className="text-white font-mono">{citizenId}</strong></span>
                <span>&bull;</span>
                <span>{displayEmail}</span>
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end gap-2 pt-2 sm:pt-0">
              <button
                type="button"
                onClick={() => onNavigateTab && onNavigateTab('submit')}
                className="px-4 py-2 text-xs font-bold bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Lodge Grievance</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account Details Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-600" />
                <span>{t('profile_title', 'Personal Account Details')}</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">MongoDB Active</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium block">{t('full_name', 'Full Legal Name')}</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{displayName}</p>
              </div>

              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium block">{t('email', 'Official Email Address')}</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5 truncate">{displayEmail}</p>
              </div>

              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium block">{t('citizen_id', 'Registered Citizen ID')}</span>
                <p className="text-sm font-mono font-bold text-emerald-700 mt-0.5">{citizenId}</p>
              </div>

              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium block">{t('phone', 'Contact Mobile Number')}</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{phone}</p>
              </div>

              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium block">{t('account_role', 'Account Authority Level')}</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5 capitalize">{role} (Public Access)</p>
              </div>

              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium block">{t('verified_status', 'Database Security')}</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5 flex items-center gap-1.5 text-emerald-600">
                  <ShieldCheck className="h-4 w-4" />
                  <span>PBKDF2-HMAC-SHA256 Encrypted</span>
                </p>
              </div>
            </div>
          </div>

          {/* Grievance Activity Stats Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span>{t('grievances_summary', 'Grievance Summary')}</span>
              </h3>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <span className="text-xs text-slate-600 font-medium">{t('total_submitted', 'Total Submitted')}</span>
                  <span className="text-sm font-extrabold text-slate-900">{userStats.total}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 border border-blue-100">
                  <span className="text-xs text-blue-700 font-medium">{t('in_processing', 'In Processing')}</span>
                  <span className="text-sm font-extrabold text-blue-700">{userStats.in_processing}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                  <span className="text-xs text-emerald-700 font-medium">{t('resolved', 'Resolved Redressals')}</span>
                  <span className="text-sm font-extrabold text-emerald-700">{userStats.resolved}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-100">
                  <span className="text-xs text-amber-700 font-medium">{t('pending_review', 'Pending Triage')}</span>
                  <span className="text-sm font-extrabold text-amber-700">{userStats.pending}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('my_complaints')}
              className="mt-6 w-full py-2.5 px-3 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{t('my_complaints', 'Manage My Complaints')}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. Help & Support View (with Admin Details)
  if (activeTab === 'support') {
    return (
      <div className="space-y-6">
        {/* Support Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 border border-white/25">
              Citizen Support & Administrative Directory
            </span>
            <h1 className="text-2xl font-bold mt-2">Help & Grievance Support Desk</h1>
            <p className="text-xs text-blue-100 mt-1 leading-relaxed">
              Official contact information for the Central Grievance Redressal Administration, technical nodal desks, and escalation helpline.
            </p>
          </div>
        </div>

        {/* Central Administration Contact Details (Two Admins: Ranjith Gowda & Hithesh Gowda) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Administrator Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Headphones className="h-4.5 w-4.5 text-blue-600" />
                  <span>Central Grievance Administrators</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct administrative authority over public grievance triage, verification, and department dispatch.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 self-start sm:self-auto">
                2 Designated Admins
              </span>
            </div>

            {/* Two Admins Grid: Ranjith Gowda & Hithesh Gowda */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Admin 1: Ranjith Gowda */}
              <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 hover:border-blue-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="h-10 w-10 rounded-xl bg-[#0a1835] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      RG
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        System Administrator
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">Ranjith Gowda</h3>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Central Grievance Administration & Nodal Triage
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200/70 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5 text-[11px]">
                      <Phone className="h-3 w-3 text-blue-600" />
                      <span>Phone:</span>
                    </span>
                    <a 
                      href="tel:8861731029" 
                      className="font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                      title="Call Ranjith Gowda"
                    >
                      <span>8861731029</span>
                      <PhoneCall className="h-3 w-3" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5 text-[11px]">
                      <Mail className="h-3 w-3 text-rose-500" />
                      <span>Gmail:</span>
                    </span>
                    <a 
                      href="mailto:ranjithgowda@gmail.com?subject=Grievance%20Support%20Request%20-%20CiviQ" 
                      className="font-mono text-[11px] font-semibold text-slate-800 hover:text-blue-600 hover:underline flex items-center gap-1 truncate max-w-[170px]"
                      title="Email Ranjith Gowda"
                    >
                      <span className="truncate">ranjithgowda@gmail.com</span>
                      <Send className="h-2.5 w-2.5 text-blue-600 flex-shrink-0" />
                    </a>
                  </div>

                  <div className="pt-2 flex gap-1.5">
                    <a 
                      href="tel:8861731029"
                      className="flex-1 py-1 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors shadow-2xs"
                    >
                      <PhoneCall className="h-3 w-3" />
                      <span>Call</span>
                    </a>
                    <a 
                      href="mailto:ranjithgowda@gmail.com?subject=Grievance%20Support%20Request%20-%20CiviQ"
                      className="flex-1 py-1 px-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors shadow-2xs"
                    >
                      <Mail className="h-3 w-3 text-rose-500" />
                      <span>Gmail</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Admin 2: Hithesh Gowda */}
              <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="h-10 w-10 rounded-xl bg-[#0a1835] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      HG
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        System Administrator
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">Hithesh Gowda</h3>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Technical Architecture & Grievance Operations
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200/70 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5 text-[11px]">
                      <Phone className="h-3 w-3 text-emerald-600" />
                      <span>Phone:</span>
                    </span>
                    <a 
                      href="tel:8877665544" 
                      className="font-mono font-bold text-emerald-600 hover:text-emerald-800 hover:underline flex items-center gap-1"
                      title="Call Hithesh Gowda"
                    >
                      <span>8877665544</span>
                      <PhoneCall className="h-3 w-3" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5 text-[11px]">
                      <Mail className="h-3 w-3 text-rose-500" />
                      <span>Gmail:</span>
                    </span>
                    <a 
                      href="mailto:hitheshgowda@gmail.com?subject=Grievance%20Support%20Request%20-%20CiviQ" 
                      className="font-mono text-[11px] font-semibold text-slate-800 hover:text-emerald-600 hover:underline flex items-center gap-1 truncate max-w-[170px]"
                      title="Email Hithesh Gowda"
                    >
                      <span className="truncate">hitheshgowda@gmail.com</span>
                      <Send className="h-2.5 w-2.5 text-emerald-600 flex-shrink-0" />
                    </a>
                  </div>

                  <div className="pt-2 flex gap-1.5">
                    <a 
                      href="tel:8877665544"
                      className="flex-1 py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors shadow-2xs"
                    >
                      <PhoneCall className="h-3 w-3" />
                      <span>Call</span>
                    </a>
                    <a 
                      href="mailto:hitheshgowda@gmail.com?subject=Grievance%20Support%20Request%20-%20CiviQ"
                      className="flex-1 py-1 px-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors shadow-2xs"
                    >
                      <Mail className="h-3 w-3 text-rose-500" />
                      <span>Gmail</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Support FAQs Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-indigo-600" />
              <span>Grievance Guidelines</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="font-bold text-slate-800">How do I track my complaint?</p>
                <p className="text-slate-500 mt-1 leading-relaxed text-[11px]">
                  Use the <strong>Track Complaint</strong> tab with your Reference ID (e.g., CIVIQ-2026...).
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="font-bold text-slate-800">Can I delete my grievance?</p>
                <p className="text-slate-500 mt-1 leading-relaxed text-[11px]">
                  Yes! In the <strong>My Complaints</strong> tab, click the <strong>Delete</strong> button to remove your petition anytime.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="font-bold text-slate-800">What is the standard resolution time?</p>
                <p className="text-slate-500 mt-1 leading-relaxed text-[11px]">
                  Urgent civic grievances are dispatched within 24 hours; normal grievances have a 72-hour nodal resolution SLA.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 6. Default Citizen Dashboard View
  const storedUserIds = getLocalUserComplaintIds();

  return (
    <div className="space-y-5">
      {/* Scope Selector & Quick Refresh Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70 backdrop-blur-xs p-3.5 px-4 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">{t('dashboard_view', 'Dashboard View:')}</span>
          <div className="inline-flex p-1 bg-slate-100/90 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setScope('my')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                scope === 'my'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>{t('filter_my', 'My Complaints')} ({storedUserIds.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setScope('all')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                scope === 'all'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{t('filter_all', 'All Portal Cases')} ({systemStats.total || 'Live'})</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="hidden sm:inline">
            {t('live_sync', 'Live MongoDB sync')} &bull; {userStats.in_processing} {t('in_processing', 'in processing')}
          </span>
          <button
            type="button"
            onClick={loadCitizenStats}
            className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title={t('refresh', 'Refresh')}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingStats ? 'animate-spin text-blue-600' : ''}`} />
            <span>{t('refresh', 'Refresh')}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column (~65%) and Right Column (~35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-5">
          {/* Hero Banner */}
          <ReportProblemHero onSubmitClick={() => onNavigateTab && onNavigateTab('submit')} />

          {/* Track Your Complaints */}
          <TrackComplaintCard onTrack={handleTrack} />

          {/* My Recent Complaints Table (with Delete Option) */}
          <UserRecentComplaintsCard
            complaints={complaints}
            loading={loadingStats}
            onTrack={handleTrack}
            onComplaintDeleted={handleComplaintDeleted}
            onViewAll={() => onNavigateTab && onNavigateTab('my_complaints')}
            onSubmitNew={() => onNavigateTab && onNavigateTab('submit')}
          />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-5">
          {/* My Complaints Summary Card with Total Count & In Processing Highlight */}
          <MyComplaintsStatCard
            totalCount={userStats.total}
            inProcessingCount={userStats.in_processing}
            pendingCount={userStats.pending}
            loading={loadingStats}
            onViewAll={() => onNavigateTab && onNavigateTab('my_complaints')}
          />

          {/* Complaint Status 2x2 Quadrant Card */}
          <ComplaintStatusCard
            stats={userStats}
            loading={loadingStats}
          />

          {/* Quick Actions 2x2 Card */}
          <UserQuickActionsCard onActionClick={(id) => onNavigateTab && onNavigateTab(id)} />
        </div>
      </div>

      {/* Bottom Full-Width Row: Common Complaint Categories */}
      <CommonCategoriesCard 
        onViewAll={() => onNavigateTab && onNavigateTab('submit')}
        onSelectCategory={() => onNavigateTab && onNavigateTab('submit')}
      />
    </div>
  );
}
