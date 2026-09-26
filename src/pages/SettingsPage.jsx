// src/pages/SettingsPage.jsx
import React, { useState } from 'react';
import {
  User,
  Bell,
  Sliders,
  Save,
  Check,
  Building,
  Mail,
  Phone,
  Shield,
  Server,
  Globe
} from 'lucide-react';

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: 'Hithesh K.',
    role: 'Nodal Public Grievance Officer',
    department: 'Central Public Grievance Redressal Authority',
    email: 'hithesh.k@grievance.gov.in',
    phone: '+91 98450 12345',
    wardJurisdiction: 'All Metropolitan Wards (Zone 1 - 32)'
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    autoRouteAlerts: true,
    dailyDigest: true,
    smsCritical: false,
    weeklyReport: true
  });

  const [appConfig, setAppConfig] = useState({
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    itemsPerPage: '8',
    confidenceThreshold: '80',
    autoRouting: true
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            System & Profile Settings
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure officer credentials, notification triggers, and portal application defaults
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold animate-in fade-in">
            <Check className="w-4 h-4" />
            Changes saved successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Officer Profile Settings */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Officer Profile</h3>
              <p className="text-xs text-slate-500">Government credentials and grievance jurisdiction</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Designation</label>
              <input
                type="text"
                value={profile.role}
                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Official Email</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Official Phone</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Department</label>
              <div className="relative">
                <Building className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Notification Preferences */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Notification Preferences</h3>
              <p className="text-xs text-slate-500">Configure alert channels and automatic triage triggers</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { id: 'emailAlerts', title: 'Critical Grievance Email Alerts', desc: 'Receive immediate notifications when high-priority or public safety issues are logged' },
              { id: 'autoRouteAlerts', title: 'Automated Routing Confirmation', desc: 'Alert when NLP engine routes a complaint with confidence exceeding threshold' },
              { id: 'dailyDigest', title: 'Daily Backlog Summary', desc: 'Receive a daily 8:00 AM summary of pending, unassigned, and resolved grievances' },
              { id: 'smsCritical', title: 'Emergency SMS Escalations', desc: 'Receive direct SMS dispatch alerts for infrastructure failures or contamination alerts' },
            ].map((item) => (
              <label
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={notifications[item.id]}
                  onChange={(e) => setNotifications({ ...notifications, [item.id]: e.target.checked })}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-slate-300"
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 block">{item.title}</span>
                  <span className="text-slate-500">{item.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 3. Application Preferences */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Application Preferences</h3>
              <p className="text-xs text-slate-500">Backend connectivity, triage thresholds, and table display options</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                <span>FastAPI Backend URL (`VITE_API_URL`)</span>
                <span className="text-[10px] text-blue-600 font-mono">Environment configured</span>
              </label>
              <div className="relative">
                <Server className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={appConfig.apiUrl}
                  onChange={(e) => setAppConfig({ ...appConfig, apiUrl: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Defaults to <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">http://localhost:8000/api</code>. Seamlessly connects to FastAPI or uses resilient fallback.
              </p>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Auto-Routing Confidence Threshold
              </label>
              <select
                value={appConfig.confidenceThreshold}
                onChange={(e) => setAppConfig({ ...appConfig, confidenceThreshold: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="75">75% (Lenient triage)</option>
                <option value="80">80% (Recommended standard)</option>
                <option value="85">85% (High certainty only)</option>
                <option value="90">90% (Strict automated routing)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Complaints Table Page Size
              </label>
              <select
                value={appConfig.itemsPerPage}
                onChange={(e) => setAppConfig({ ...appConfig, itemsPerPage: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="8">8 records per page</option>
                <option value="15">15 records per page</option>
                <option value="25">25 records per page</option>
                <option value="50">50 records per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
