import React, { useState, useRef } from 'react';
import { 
  Shield, User, Building2, ArrowRight, Sparkles, CheckCircle2, 
  Cpu, FileText, Activity, ChevronRight, Lock, 
  HelpCircle, ExternalLink, BarChart3, Clock, AlertTriangle, Users
} from 'lucide-react';

export default function LandingPage({ onNavigateToLogin }) {
  // Interactive mouse tracking spotlight effect
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleLoginClick = (role = 'officer', isRegister = false) => {
    if (onNavigateToLogin) {
      onNavigateToLogin(role, isRegister);
    }
  };

  const departments = [
    { name: 'Water Supply Department', icon: '💧', color: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/30' },
    { name: 'Health & Sanitation', icon: '🏥', color: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30' },
    { name: 'Power Board & Electricity', icon: '⚡', color: 'from-amber-500/20 to-yellow-500/20', border: 'border-amber-500/30' },
    { name: 'Public Works (PWD)', icon: '🏗️', color: 'from-orange-500/20 to-red-500/20', border: 'border-orange-500/30' },
    { name: 'Police & Public Safety', icon: '🛡️', color: 'from-blue-500/20 to-indigo-500/20', border: 'border-indigo-500/30' },
    { name: 'Transport Authority', icon: '🚌', color: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30' },
    { name: 'Municipal Corporation', icon: '🏛️', color: 'from-slate-500/20 to-zinc-500/20', border: 'border-slate-500/30' },
    { name: 'General Administration', icon: '📂', color: 'from-sky-500/20 to-blue-500/20', border: 'border-sky-500/30' },
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Lodge Grievance',
      desc: 'Citizen submits issue in natural language with optional photo and location details.',
      icon: FileText,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      step: '02',
      title: 'NLP Classification',
      desc: 'Machine learning model instantly classifies grievance into target department and priority.',
      icon: Cpu,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      step: '03',
      title: 'Automated Dispatch',
      desc: 'Formal PDF work orders generated for nodal officers and field engineers immediately.',
      icon: Building2,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20'
    },
    {
      step: '04',
      title: 'Resolution & Audit',
      desc: 'Transparent progress updates, verified inspection, citizen closure rating and audit log.',
      icon: CheckCircle2,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20'
    }
  ];

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#070b16] text-slate-100 flex flex-col relative overflow-hidden select-none font-sans"
    >
      {/* Dynamic Cursor Spotlight Glow */}
      <div 
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-0"
        style={{
          background: `radial-gradient(900px circle at ${mousePos.x}px ${mousePos.y}px, rgba(37, 99, 235, 0.15), transparent 45%)`,
        }}
      />

      {/* Cybernetic Geometric Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.035] pointer-events-none z-0"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.45) 1.2px, transparent 1.2px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Ambient Pulsing Atmospheric Glow Orbs */}
      <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none animate-pulse-subtle" />
      <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[150px] pointer-events-none animate-pulse-subtle" />
      <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[130px] pointer-events-none animate-pulse-subtle" />

      {/* Top Header / Navigation Bar */}
      <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo & Civic Branding */}
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-2xl shadow-lg shadow-blue-500/20 border border-blue-400/30 hover:scale-105 transition-transform">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-display">
                  CiviQ
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping mr-1.5"></span>
                  Active v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                AI-Powered Civic Intelligence &amp; Grievance Redressal
              </p>
            </div>
          </div>

          {/* Navigation & Login Buttons */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300 mr-2">
              <a href="#gateways" className="hover:text-blue-400 transition-colors">Portals</a>
              <a href="#how-it-works" className="hover:text-blue-400 transition-colors">How It Works</a>
              <a href="#departments" className="hover:text-blue-400 transition-colors">Departments</a>
            </div>

            <button
              type="button"
              id="nav-login-btn"
              onClick={() => handleLoginClick('officer', false)}
              className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25 border border-blue-400/30 hover:shadow-blue-500/40 cursor-pointer transition-all duration-200 active:scale-95 font-display"
            >
              <Lock className="h-3.5 w-3.5 text-blue-200" />
              <span>Login Portal</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 pt-12 pb-16 max-w-7xl mx-auto w-full text-center">
        
        {/* Civic Badge Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-inner mb-6 backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
          <span className="text-xs sm:text-sm font-semibold text-slate-300">
            CiviQ Platform &bull; Citizen First &bull; AI-Powered Natural Language Processing
          </span>
          <Sparkles className="h-3.5 w-3.5 text-amber-400 ml-0.5" />
        </div>

        {/* Hero Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl leading-tight sm:leading-tight lg:leading-[1.15] mb-6 font-display">
          CiviQ: Intelligent Civic <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
            Issue Classification &amp; Redressal
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          A centralized, government-grade civic intelligence platform powered by CiviQ. Automatically classifies 
          citizen issues using state-of-the-art NLP models, dispatches formal work orders, and ensures 
          100% accountability across municipal departments.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md sm:max-w-none mb-14">
          <button
            type="button"
            id="hero-proceed-login-btn"
            onClick={() => handleLoginClick('officer', false)}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-600 text-white font-extrabold text-sm sm:text-base tracking-wide uppercase shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 border border-blue-400/40 flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] font-display relative overflow-hidden group"
          >
            {/* Shimmer sweep effect */}
            <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 shimmer-sweep pointer-events-none" />
            <Shield className="h-5 w-5 text-blue-200 group-hover:rotate-12 transition-transform" />
            <span>Proceed to Login</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
          </button>

          <button
            type="button"
            id="hero-register-citizen-btn"
            onClick={() => handleLoginClick('citizen', true)}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 text-slate-200 hover:text-white font-bold text-sm sm:text-base tracking-wide border border-slate-700 hover:border-slate-500 flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/40 backdrop-blur-md"
          >
            <User className="h-5 w-5 text-emerald-400" />
            <span>Register Citizen Account</span>
          </button>
        </div>

        {/* Live Metrics Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5 w-full max-w-5xl mb-20">
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center hover:border-blue-500/30 transition-all">
            <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 font-display">
              99.4%
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-300 mt-1">NLP Routing Accuracy</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Automated Multi-Class Engine</span>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center hover:border-emerald-500/30 transition-all">
            <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 font-display">
              8+
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-300 mt-1">Civic Departments</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Water, Power, Roads &amp; Health</span>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center hover:border-purple-500/30 transition-all">
            <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300 font-display">
              &lt; 48 Hrs
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-300 mt-1">Avg. Escalation SLA</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Automated Work Order Dispatch</span>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center hover:border-amber-500/30 transition-all">
            <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-300 font-display">
              Dual-Admin
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-300 mt-1">MongoDB Governance</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Tamper-Proof Authorization</span>
          </div>
        </div>

        {/* Section: 3 Gateway Portals (Fast Access) */}
        <div id="gateways" className="w-full max-w-6xl mb-24 text-left">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
              Select Your Gateway
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
              Choose your role below to jump directly into your dedicated CiviQ portal interface.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Citizen Gateway Card */}
            <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-7 relative overflow-hidden group hover:border-emerald-400/60 transition-all duration-300 shadow-xl shadow-emerald-950/20 flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
              <div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                  <User className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-white font-display">Citizen Portal</h3>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Open Access
                  </span>
                </div>
                <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                  Lodge complaints, monitor real-time triage status, view assigned departmental officers, and review resolution reports.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-400 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span>Free self-registration with instant login</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span>Live status tracking with stage indicators</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span>Resolution feedback &amp; citizen rating</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                id="portal-btn-citizen-cta"
                onClick={() => handleLoginClick('citizen', false)}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm tracking-wide bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer font-display group-hover:scale-[1.01]"
              >
                <span>Citizen Sign In</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Officer Gateway Card (Featured) */}
            <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-2 border-blue-500/50 rounded-3xl p-6 sm:p-7 relative overflow-hidden group hover:border-blue-400 transition-all duration-300 shadow-2xl shadow-blue-950/30 flex flex-col justify-between scale-[1.02] md:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/15 rounded-full blur-2xl group-hover:bg-blue-500/25 transition-all pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="h-12 w-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full border border-blue-500/30">
                    Nodal Desk
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-white font-display">Officer Desk</h3>
                </div>
                <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                  Review AI-classified department complaints, issue official PDF work orders, assign field engineers, and mark resolutions.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-400 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span>Automatic NLP triage by departmental domain</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span>Govt-standard printable Work Order PDFs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span>Field engineer dispatch &amp; status updates</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                id="portal-btn-officer-cta"
                onClick={() => handleLoginClick('officer', false)}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm tracking-wide bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer font-display group-hover:scale-[1.01]"
              >
                <span>Officer Login</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Admin Gateway Card */}
            <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-purple-500/30 rounded-3xl p-6 sm:p-7 relative overflow-hidden group hover:border-purple-400/60 transition-all duration-300 shadow-xl shadow-purple-950/20 flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all pointer-events-none" />
              <div>
                <div className="h-12 w-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition-transform">
                  <Shield className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-white font-display">Admin Console</h3>
                  <span className="text-[10px] font-bold bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30">
                    Dual Limit: 2
                  </span>
                </div>
                <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                  Executive analytics, inter-departmental oversight, system user provisioning, and dual-admin quota governance.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-400 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-400 flex-shrink-0" />
                    <span>Strict Dual-Admin capacity enforcement</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-400 flex-shrink-0" />
                    <span>Comprehensive resolution speed analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-400 flex-shrink-0" />
                    <span>Department officer account provisioning</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                id="portal-btn-admin-cta"
                onClick={() => handleLoginClick('admin', false)}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm tracking-wide bg-indigo-700 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-700/30 flex items-center justify-center gap-2 transition-all cursor-pointer font-display group-hover:scale-[1.01]"
              >
                <span>Admin Login</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>
        </div>

        {/* How It Works Workflow Section */}
        <div id="how-it-works" className="w-full max-w-6xl mb-24 text-left">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
              Automated Grievance Lifecycle
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
              From natural language complaint to field resolution in four verified steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {workflowSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div 
                  key={step.step}
                  className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative group hover:border-slate-700 transition-all backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black text-slate-500 font-display tracking-widest">{step.step}</span>
                    <div className={`p-2 rounded-xl border ${step.bg}`}>
                      <Icon className={`h-4 w-4 ${step.color}`} />
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-white mb-2 font-display">{step.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Integrated Municipal Departments Section */}
        <div id="departments" className="w-full max-w-6xl mb-20 text-left">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
              Supported Civic Departments
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
              Trained NLP classification models routing to 8 municipal authorities with specialized priority scoring.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {departments.map((dept, i) => (
              <div 
                key={i}
                className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3 hover:border-slate-700 transition-all group backdrop-blur-xs"
              >
                <div className="text-2xl p-2 rounded-xl bg-slate-800/60 group-hover:scale-110 transition-transform flex-shrink-0">
                  {dept.icon}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-200 leading-tight">
                  {dept.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final Conversion Banner */}
        <div className="w-full max-w-5xl bg-gradient-to-r from-blue-900/50 via-indigo-900/50 to-purple-900/50 border border-blue-500/30 rounded-3xl p-8 sm:p-10 relative overflow-hidden backdrop-blur-md text-center shadow-2xl mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <h3 className="text-2xl sm:text-3xl font-black text-white font-display mb-3">
            Ready to Access the Grievance System?
          </h3>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mb-6">
            Log in with your existing credentials, or sign up as a citizen to report municipal issues immediately.
          </p>
          <button
            type="button"
            id="bottom-login-btn"
            onClick={() => handleLoginClick('officer', false)}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide bg-white text-slate-950 hover:bg-slate-100 shadow-xl transition-all cursor-pointer font-display hover:scale-105 active:scale-95"
          >
            <span>Proceed to Login</span>
            <ArrowRight className="h-4 w-4 text-slate-950" />
          </button>
        </div>

      </main>

      {/* Official Government Portal Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/80 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <span className="text-xl">🏛️</span>
            <div>
              <p className="font-semibold text-slate-300">
                CiviQ &bull; Central Civic Redress &amp; Monitoring System
              </p>
              <p className="text-[11px] text-slate-500">
                Department of Administrative Reforms &amp; Public Grievances &bull; Government Services
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>FastAPI Backend Active</span>
            <span>&bull;</span>
            <span>NLP v2.4 Multi-Class</span>
            <span>&bull;</span>
            <button 
              type="button" 
              onClick={() => handleLoginClick('officer', false)}
              className="text-blue-400 hover:underline cursor-pointer font-semibold"
            >
              Sign In
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
