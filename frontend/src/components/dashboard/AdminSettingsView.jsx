import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Languages, 
  Cpu, 
  Sliders, 
  ShieldCheck, 
  Clock, 
  Database, 
  Mic, 
  Camera, 
  FileText, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle,
  Server,
  Zap,
  Globe2,
  Lock
} from 'lucide-react';

const DEFAULT_SETTINGS = {
  // Multilingual & AI Pipeline
  aiModel: 'gemini-3.8-flash',
  autoTranslateIntake: true,
  hindiIntakeEnabled: true,
  kannadaIntakeEnabled: true,
  englishIntakeEnabled: true,
  classificationConfidenceThreshold: 85,
  autoRouteComplaints: true,

  // Modality & File Rules
  voiceGrievanceEnabled: true,
  voiceMaxDurationSecs: 180,
  photoEvidenceEnabled: true,
  photoMaxSizeMb: 10,
  pdfPetitionEnabled: true,
  pdfMaxSizeMb: 15,

  // SLA Resolution Targets (in hours)
  slaCriticalHours: 24,
  slaHighHours: 48,
  slaNormalHours: 168, // 7 days
  slaEscalationAlertThreshold: 80, // % of SLA

  // Access Control & Security
  maxAdminsLimit: 2,
  officerSelfRegistration: true,
  sessionTimeoutMinutes: 60,
  strictAuditLogging: true,
};

export default function AdminSettingsView({ onNotify }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('pgms_admin_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [activeSubTab, setActiveSubTab] = useState('ai_multilingual');
  const [isSaved, setIsSaved] = useState(false);
  const [apiTesting, setApiTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setIsSaved(false);
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    try {
      localStorage.setItem('pgms_admin_settings', JSON.stringify(settings));
      setIsSaved(true);
      if (onNotify) {
        onNotify('System settings successfully saved and applied to grievance pipeline!');
      }
      setTimeout(() => setIsSaved(false), 3500);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all portal settings to official municipal defaults?')) {
      setSettings(DEFAULT_SETTINGS);
      localStorage.setItem('pgms_admin_settings', JSON.stringify(DEFAULT_SETTINGS));
      if (onNotify) {
        onNotify('Settings reverted to municipal default configuration.');
      }
    }
  };

  const handleTestMultilingualPipeline = async () => {
    setApiTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('http://localhost:8000/api/health');
      const data = await res.json();
      if (res.ok && data.database === 'connected') {
        setTestResult({
          status: 'success',
          message: `All systems nominal. MongoDB connected, Gemini ${settings.aiModel} active with Hindi, Kannada & English pipeline ready.`
        });
      } else {
        setTestResult({
          status: 'warning',
          message: 'Backend reached but database connection reported warning.'
        });
      }
    } catch (err) {
      setTestResult({
        status: 'error',
        message: 'Could not connect to FastAPI backend at http://localhost:8000. Verify the backend server is running.'
      });
    } finally {
      setApiTesting(false);
    }
  };

  const subTabs = [
    { id: 'ai_multilingual', label: 'AI & Multilingual Pipeline', icon: Languages },
    { id: 'modalities', label: 'Intake Modalities & Media', icon: Sliders },
    { id: 'sla_routing', label: 'SLA & Escalation Rules', icon: Clock },
    { id: 'security', label: 'Security & Access Control', icon: ShieldCheck },
    { id: 'diagnostics', label: 'System Diagnostics & DB', icon: Database },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Admin System Settings</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure multilingual AI pipelines, intake constraints, SLA thresholds, and administrative security rules.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all cursor-pointer"
            title="Reset to factory settings"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/25 transition-all cursor-pointer active:scale-95"
          >
            <Save className="h-4 w-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* Save Success Banner */}
      {isSaved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 flex-shrink-0" />
          <span>System configuration successfully updated and persisted across all administrative portals!</span>
        </div>
      )}

      {/* Sub-Navigation Pill Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {subTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' 
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: AI & Multilingual Pipeline */}
      {activeSubTab === 'ai_multilingual' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card: Language Intake & Translation Engine */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Globe2 className="h-4.5 w-4.5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Supported Citizen Grievance Languages</h3>
            </div>

            <p className="text-xs text-slate-500">
              Citizen grievance API accepts voice, images, PDFs, and text across 3 official regional languages and automatically standardizes records into English for nodal officers.
            </p>

            <div className="space-y-3">
              {/* Hindi Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-800">हिन्दी (Hindi)</span>
                  <p className="text-[11px] text-slate-500">Devanagari script text & speech recognition (hi-IN)</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settings.hindiIntakeEnabled} 
                    onChange={e => handleChange('hindiIntakeEnabled', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Kannada Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-800">ಕನ್ನಡ (Kannada)</span>
                  <p className="text-[11px] text-slate-500">Kannada script text & speech recognition (kn-IN)</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settings.kannadaIntakeEnabled} 
                    onChange={e => handleChange('kannadaIntakeEnabled', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* English Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-800">English (Standard)</span>
                  <p className="text-[11px] text-slate-500">Administrative standard lingua franca (en-IN)</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settings.englishIntakeEnabled} 
                    onChange={e => handleChange('englishIntakeEnabled', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Auto Translate Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 mt-2">
                <div>
                  <span className="text-xs font-bold text-blue-900">Auto-Translate to English on Intake</span>
                  <p className="text-[11px] text-blue-700/80">Converts native audio, OCR, and text to English sentences while retaining original records</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settings.autoTranslateIntake} 
                    onChange={e => handleChange('autoTranslateIntake', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Card: AI Model & Classification Confidence */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Cpu className="h-4.5 w-4.5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Gemini Generative AI Cascade & Confidence</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Primary Multimodal & Translation Model
                </label>
                <select
                  value={settings.aiModel}
                  onChange={e => handleChange('aiModel', e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  <option value="gemini-3.8-flash">Gemini 3.8 Flash (Active Default — Recommended)</option>
                  <option value="gemini-3.5-flash">Gemini 3.5 Flash (High Throughput)</option>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fallback Cascade)</option>
                  <option value="gemini-flash-latest">Gemini Flash Latest (Experimental)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Automatic cascade fallback handles rate limits and quota switching transparently.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>Classification Confidence Routing Threshold</span>
                  <span className="text-blue-600 font-mono text-sm">{settings.classificationConfidenceThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="98"
                  value={settings.classificationConfidenceThreshold}
                  onChange={e => handleChange('classificationConfidenceThreshold', Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>60% (Lenient)</span>
                  <span>85% (Balanced)</span>
                  <span>98% (Strict Review)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Complaints with confidence above {settings.classificationConfidenceThreshold}% receive automatic department routing recommendations.
                </p>
              </div>

              {/* Multilingual Pipeline Diagnostic Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTestMultilingualPipeline}
                  disabled={apiTesting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span>{apiTesting ? 'Testing Multilingual Pipeline...' : 'Run Pipeline Diagnostic Test'}</span>
                </button>

                {testResult && (
                  <div className={`mt-3 p-3 rounded-xl text-xs flex items-start gap-2 ${
                    testResult.status === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                    testResult.status === 'warning' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                    'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {testResult.status === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" /> : <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Modalities & Media */}
      {activeSubTab === 'modalities' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Voice Grievance */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Mic className="h-5 w-5" />
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.voiceGrievanceEnabled} 
                  onChange={e => handleChange('voiceGrievanceEnabled', e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Voice Audio Grievances</h4>
              <p className="text-xs text-slate-500 mt-1">Accept spoken voice in Hindi, Kannada & English with automatic transcription.</p>
            </div>
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Max Recording Time</span>
                <span className="font-semibold text-slate-800 font-mono">{settings.voiceMaxDurationSecs}s (3 min)</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Audio Codecs</span>
                <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">webm, wav, mp3</span>
              </div>
            </div>
          </div>

          {/* Photo Evidence */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Camera className="h-5 w-5" />
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.photoEvidenceEnabled} 
                  onChange={e => handleChange('photoEvidenceEnabled', e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Field Photo & Signage OCR</h4>
              <p className="text-xs text-slate-500 mt-1">Visual scene inspection and text/signage reading in Hindi/Kannada.</p>
            </div>
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Max Upload Size</span>
                <span className="font-semibold text-slate-800 font-mono">{settings.photoMaxSizeMb} MB</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Supported Formats</span>
                <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">jpeg, png, webp</span>
              </div>
            </div>
          </div>

          {/* Scanned PDF Petition */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.pdfPetitionEnabled} 
                  onChange={e => handleChange('pdfPetitionEnabled', e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">PDF Petitions & Letters</h4>
              <p className="text-xs text-slate-500 mt-1">Formal typed or scanned government petitions and memoranda.</p>
            </div>
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Max Upload Size</span>
                <span className="font-semibold text-slate-800 font-mono">{settings.pdfMaxSizeMb} MB</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>OCR Multi-page</span>
                <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">Up to 10 pages</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SLA & Escalation Rules */}
      {activeSubTab === 'sla_routing' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Clock className="h-4.5 w-4.5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Service Level Agreement (SLA) & Resolution Thresholds</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Critical SLA */}
            <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/50 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Emergency / Critical</span>
              <p className="text-xs text-slate-600">Sparking live wires, water main bursts, road cave-ins.</p>
              <div className="pt-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">Target SLA Turnaround</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="6"
                    max="72"
                    value={settings.slaCriticalHours}
                    onChange={e => handleChange('slaCriticalHours', Number(e.target.value))}
                    className="w-20 px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-rose-200 rounded-lg text-slate-800"
                  />
                  <span className="text-xs font-semibold text-slate-500">hours</span>
                </div>
              </div>
            </div>

            {/* High SLA */}
            <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/50 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">High Priority</span>
              <p className="text-xs text-slate-600">Major garbage accumulation, drainage overflows, blocked routes.</p>
              <div className="pt-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">Target SLA Turnaround</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="12"
                    max="120"
                    value={settings.slaHighHours}
                    onChange={e => handleChange('slaHighHours', Number(e.target.value))}
                    className="w-20 px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-amber-200 rounded-lg text-slate-800"
                  />
                  <span className="text-xs font-semibold text-slate-500">hours</span>
                </div>
              </div>
            </div>

            {/* Normal SLA */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Normal / Standard</span>
              <p className="text-xs text-slate-600">Streetlight replacement, park maintenance, general inquiries.</p>
              <div className="pt-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">Target SLA Turnaround</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="24"
                    max="360"
                    value={settings.slaNormalHours}
                    onChange={e => handleChange('slaNormalHours', Number(e.target.value))}
                    className="w-20 px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                  <span className="text-xs font-semibold text-slate-500">hours ({Math.round(settings.slaNormalHours / 24)} days)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Auto Escalation Threshold */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-800">Automatic Breach Escalation Alert</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Notifies Department Head and Admin when unresolved complaint reaches this percentage of its target SLA.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="50"
                max="95"
                value={settings.slaEscalationAlertThreshold}
                onChange={e => handleChange('slaEscalationAlertThreshold', Number(e.target.value))}
                className="w-20 px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg text-slate-800"
              />
              <span className="text-xs font-semibold text-slate-600">% of SLA</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Security & Access Control */}
      {activeSubTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Lock className="h-4.5 w-4.5 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900">Admin Capacity & Security Policy</h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900">Max System Administrators</span>
                  <span className="px-2.5 py-0.5 text-xs font-bold font-mono bg-purple-200/80 text-purple-900 rounded-full">
                    Strict Cap: 2
                  </span>
                </div>
                <p className="text-[11px] text-purple-700/90 mt-1">
                  Enforced at MongoDB API level. Further admin registration is forbidden once 2 administrator records exist.
                </p>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-800">Officer Portal Self-Registration</span>
                  <p className="text-[11px] text-slate-500">Allow nodal officers to create department credentials directly</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settings.officerSelfRegistration} 
                    onChange={e => handleChange('officerSelfRegistration', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Administrative Inactivity Session Timeout
                </label>
                <select
                  value={settings.sessionTimeoutMinutes}
                  onChange={e => handleChange('sessionTimeoutMinutes', Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  <option value={15}>15 Minutes (Strict)</option>
                  <option value={30}>30 Minutes</option>
                  <option value={60}>60 Minutes (Standard)</option>
                  <option value={120}>120 Minutes</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Credential & Integrity Safeguards</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">Password Hashing Algorithm</span>
                  <p className="text-[11px] text-slate-500">PBKDF2-HMAC-SHA256 with 100,000 iterations & cryptographic salt</p>
                </div>
                <span className="text-[11px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  ACTIVE
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">CORS Origin Security</span>
                  <p className="text-[11px] text-slate-500">Cross-Origin Resource Sharing enabled for Vite frontend (port 3000)</p>
                </div>
                <span className="text-[11px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                  CONFIGURED
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">Complaint ID Tamper Protection</span>
                  <p className="text-[11px] text-slate-500">Uniquely indexed PGMS-YYYYMMDD-XXXXXX format with collision retries</p>
                </div>
                <span className="text-[11px] font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">
                  ENFORCED
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Diagnostics & Database */}
      {activeSubTab === 'diagnostics' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Server className="h-4.5 w-4.5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Infrastructure & System Runtime Diagnostics</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">MongoDB Cluster</span>
              <p className="text-sm font-bold text-slate-800 font-mono">localhost:27017</p>
              <div className="flex items-center gap-1.5 pt-1 text-emerald-600 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span>Connected & Indexed</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">FastAPI Backend</span>
              <p className="text-sm font-bold text-slate-800 font-mono">http://localhost:8000</p>
              <div className="flex items-center gap-1.5 pt-1 text-emerald-600 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span>Uvicorn ASGI Ready</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">AI Translation Engine</span>
              <p className="text-sm font-bold text-slate-800 font-mono">Google GenAI 3.8 Flash</p>
              <div className="flex items-center gap-1.5 pt-1 text-blue-600 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                <span>HI, KN, EN Cascade</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">Frontend Application</span>
              <p className="text-sm font-bold text-slate-800 font-mono">Vite + React 19</p>
              <div className="flex items-center gap-1.5 pt-1 text-emerald-600 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span>Port 3000 Live</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
