import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, User, Building2, Lock, Mail, Eye, EyeOff, 
  CheckCircle2, AlertCircle, Sparkles, LogIn, UserPlus, 
  Phone, Briefcase, Check, ArrowRight
} from 'lucide-react';
import { login, register, getAdminSlotStatus } from '../services/authService';

export default function LoginPage({ initialPortal = 'officer', onLoginSuccess }) {
  const [selectedRole, setSelectedRole] = useState(
    initialPortal === 'user' ? 'citizen' : initialPortal
  );
  
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Water Supply Department');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Interactive mouse tracking spotlight
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Validation & status states
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [shake, setShake] = useState(false);
  const [adminCapacity, setAdminCapacity] = useState({
    max_admins: 2,
    current_admins: 2,
    slots_available: 0,
    registration_allowed: false
  });

  useEffect(() => {
    getAdminSlotStatus().then(status => {
      if (status) setAdminCapacity(status);
    });
  }, [selectedRole]);

  // Mouse move handler for interactive dynamic ambient glow
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const portals = {
    citizen: {
      id: 'citizen',
      label: 'Citizen',
      icon: User,
      accent: 'emerald',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/90',
      activeTabClass: 'bg-emerald-600 text-white shadow-emerald-500/25',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30',
      glowColor: 'rgba(16, 185, 129, 0.18)',
      ringColor: 'focus:border-emerald-500 focus:ring-emerald-500/20',
      demoEmail: 'citizen@gmail.com',
      demoPass: 'Citizen@1234',
    },
    officer: {
      id: 'officer',
      label: 'Officer',
      icon: Building2,
      accent: 'blue',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200/90',
      activeTabClass: 'bg-blue-600 text-white shadow-blue-500/25',
      btnColor: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30',
      glowColor: 'rgba(37, 99, 235, 0.18)',
      ringColor: 'focus:border-blue-500 focus:ring-blue-500/20',
      demoEmail: 'officer.water@gov.in',
      demoPass: 'Officer@1234',
    },
    admin: {
      id: 'admin',
      label: 'Admin',
      icon: Shield,
      accent: 'purple',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200/90',
      activeTabClass: 'bg-indigo-700 text-white shadow-indigo-500/25',
      btnColor: 'bg-indigo-700 hover:bg-indigo-800 text-white shadow-indigo-600/30',
      glowColor: 'rgba(124, 58, 237, 0.18)',
      ringColor: 'focus:border-purple-500 focus:ring-purple-500/20',
      demoEmail: 'admin@gov.in',
      demoPass: 'Admin@1234',
    }
  };

  const currentPortalConfig = portals[selectedRole] || portals.officer;
  const RoleIcon = currentPortalConfig.icon;

  // Real-time email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email.trim());
  const isPasswordValid = password.length >= 6;
  const isNameValid = !isRegister || name.trim().length >= 2;

  // Dynamic Password Strength Meter
  const calculateStrength = (pwd) => {
    if (!pwd) return { score: 0, text: '', color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 9) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, text: 'Weak', color: 'bg-red-500' };
      case 2:
        return { score: 2, text: 'Fair', color: 'bg-amber-500' };
      case 3:
        return { score: 3, text: 'Good', color: 'bg-blue-500' };
      case 4:
        return { score: 4, text: 'Strong', color: 'bg-emerald-500' };
      default:
        return { score: 0, text: '', color: 'bg-slate-200' };
    }
  };

  const pwdStrength = calculateStrength(password);

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  // Interactive Quick Demo autofill
  const handleQuickFill = () => {
    setEmail(currentPortalConfig.demoEmail);
    setPassword(currentPortalConfig.demoPass);
    setErrorMsg('');
    setTouched({ email: true, password: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true, name: true });
    setErrorMsg('');
    setSuccessMsg('');

    if (!isEmailValid) {
      setErrorMsg('Please enter a valid email address.');
      triggerShake();
      return;
    }

    if (!isPasswordValid) {
      setErrorMsg('Password must be at least 6 characters.');
      triggerShake();
      return;
    }

    if (isRegister && !isNameValid) {
      setErrorMsg('Full name must be at least 2 characters.');
      triggerShake();
      return;
    }

    if (isRegister && selectedRole === 'admin' && !adminCapacity.registration_allowed) {
      setErrorMsg('Maximum limit reached: Only 2 administrator accounts are permitted in the system. Further admin registrations are disabled.');
      triggerShake();
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        const result = await register({
          name,
          email,
          password,
          role: selectedRole,
          department: selectedRole === 'officer' ? department : undefined,
          phone: phone || undefined
        });

        // Switch to Sign In tab with credentials already preserved in state
        setIsRegister(false);
        setSuccessMsg(
          `Registration successful for ${result.user?.name || 'your account'}! Your credentials are pre-filled below. Please click "Sign In" to access your dashboard.`
        );
        setErrorMsg('');
        setTouched({ email: true, password: true });
      } else {
        const result = await login({
          email,
          password,
          role: selectedRole
        });

        setSuccessMsg(`Welcome back, ${result.user?.name}!`);
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess(result.user, selectedRole);
          }
        }, 400);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="login-orbitron-theme min-h-screen bg-[#080d19] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-8 relative overflow-hidden select-none"
    >
      {/* Interactive Mouse Spotlight Glow */}
      <div 
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          background: `radial-gradient(700px circle at ${mousePos.x}px ${mousePos.y}px, ${currentPortalConfig.glowColor}, transparent 45%)`,
        }}
      />

      {/* Geometric Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.45) 1.2px, transparent 1.2px)`,
          backgroundSize: '28px 28px',
        }}
      />

      {/* Floating Ambient Glow Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[110px] pointer-events-none animate-pulse-subtle" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-600/10 rounded-full blur-[110px] pointer-events-none animate-pulse-subtle" />

      {/* Brand Header */}
      <div className="text-center mb-6 relative z-10">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-white/10 text-3xl mb-3 backdrop-blur-md border border-white/10 shadow-xl shadow-black/30 hover:scale-105 transition-transform duration-300">
          🏛️
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
          Public Grievance Portal
        </h1>
      </div>

      {/* Main Login Card - Expanded Size (max-w-lg) */}
      <div 
        className={`w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden text-slate-900 relative z-10 transition-all duration-300 ${
          shake ? 'animate-shake' : ''
        }`}
      >
        
        {/* Role Selector Bar */}
        <div className="bg-slate-100/70 p-2.5 border-b border-slate-200/80">
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-200/60 rounded-2xl">
            {Object.values(portals).map((portal) => {
              const Icon = portal.icon;
              const isSelected = selectedRole === portal.id;
              return (
                <button
                  key={portal.id}
                  type="button"
                  id={`portal-btn-${portal.id}`}
                  onClick={() => {
                    setSelectedRole(portal.id);
                    setErrorMsg('');
                    setSuccessMsg('');
                    if (portal.id === 'admin' || portal.id === 'officer') {
                      setIsRegister(false);
                    }
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? `${portal.activeTabClass} shadow-md scale-[1.02]`
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                  <span className="font-display tracking-tight">{portal.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Card Header & Quick Demo */}
        <div className="px-7 sm:px-9 pt-6 pb-1 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${currentPortalConfig.badgeColor} transition-colors duration-300`}>
              <RoleIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 leading-tight font-display tracking-tight">
                  {currentPortalConfig.label} {isRegister ? 'Registration' : 'Login'}
                </h2>
                {selectedRole === 'admin' && (
                  <span className="text-[10px] font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                    Dual Admin
                  </span>
                )}
                {selectedRole === 'officer' && (
                  <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                    Admin Provisioned
                  </span>
                )}
              </div>
            </div>
          </div>

          {!isRegister && (
            <button
              type="button"
              id="quick-demo-btn"
              onClick={handleQuickFill}
              className="group text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50/90 hover:bg-blue-100 border border-blue-200/70 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all duration-200 cursor-pointer hover:shadow-xs active:scale-95"
              title="Click to autofill verified demo credentials"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-500 group-hover:rotate-12 transition-transform" />
              <span>Fill Demo</span>
            </button>
          )}
        </div>

        {/* Sign In vs Register Toggle - Only Citizen can self-register; Admin and Officer register button is removed */}
        <div className="px-7 sm:px-9 mt-4">
          {selectedRole === 'citizen' ? (
            <div className="flex border-b border-slate-200 text-sm font-bold relative font-display">
              <button
                type="button"
                id="tab-signin"
                onClick={() => {
                  setIsRegister(false);
                  setErrorMsg('');
                }}
                className={`pb-3 mr-7 transition-all duration-200 cursor-pointer tracking-tight ${
                  !isRegister 
                    ? 'text-slate-900 border-b-2 border-slate-900 font-extrabold' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                id="tab-register"
                onClick={() => {
                  setIsRegister(true);
                  setErrorMsg('');
                }}
                className={`pb-3 transition-all duration-200 cursor-pointer tracking-tight ${
                  isRegister 
                    ? 'text-slate-900 border-b-2 border-slate-900 font-extrabold' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Register New
              </button>
            </div>
          ) : selectedRole === 'officer' ? (
            <div className="p-3 bg-blue-50/80 border border-blue-200/70 rounded-xl text-blue-900 text-xs flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <span>
                <strong>Officer Access:</strong> Accounts are provisioned exclusively by Administrators in the Admin Dashboard. Sign in with the credentials assigned by your administrator.
              </span>
            </div>
          ) : (
            <div className="p-3 bg-purple-50/80 border border-purple-200/70 rounded-xl text-purple-900 text-xs flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-600 flex-shrink-0" />
              <span>
                <strong>System Administrator Portal:</strong> Enter your designated administrator credentials to access the central governance dashboard.
              </span>
            </div>
          )}
        </div>

        {/* Dynamic Alerts */}
        {errorMsg && (
          <div className="mx-7 sm:mx-9 mt-4 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        {/* Dual-Admin Limit Banner */}
        {selectedRole === 'admin' && isRegister && !adminCapacity.registration_allowed && (
          <div className="mx-7 sm:mx-9 mt-4 p-3.5 bg-purple-50 border border-purple-200/90 rounded-2xl text-purple-900 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
            <Shield className="h-4.5 w-4.5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">Dual-Admin Limit Reached (2 of 2 Seats Active)</p>
              <p className="text-xs text-slate-600 mt-1 font-sans leading-relaxed">
                The system restricts administration to exactly 2 administrators. Both seats are currently active in MongoDB. Additional admin registrations are disabled. Please switch to the <strong>Sign In</strong> tab.
              </p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="mx-7 sm:mx-9 mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="p-7 sm:p-9 pt-4 space-y-4 sm:space-y-4.5">
          
          {/* Full Name (Register Mode Only) */}
          {isRegister && (
            <div className="animate-in fade-in duration-150">
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5" htmlFor="input-name">
                Full Name
              </label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  id="input-name"
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50/80 border rounded-xl text-sm text-slate-800 font-medium placeholder-slate-400 transition-all duration-200 focus:bg-white focus:outline-none ${
                    touched.name && !isNameValid
                      ? 'border-red-400 focus:border-red-500 ring-2 ring-red-100'
                      : `border-slate-200 ${currentPortalConfig.ringColor}`
                  }`}
                />
              </div>
            </div>
          )}

          {/* Department (Officer Register only) */}
          {isRegister && selectedRole === 'officer' && (
            <div className="animate-in fade-in duration-150">
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5" htmlFor="select-dept">
                Department
              </label>
              <div className="relative group">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <select
                  id="select-dept"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium transition-all duration-200 focus:bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Water Supply Department">Water Supply Department</option>
                  <option value="Health and Sanitation">Health & Sanitation</option>
                  <option value="Power Board">Power Board & Electricity</option>
                  <option value="Public Works Department">Public Works Department</option>
                  <option value="Police Department">Police & Public Safety</option>
                  <option value="Transport Authority">Transport Authority</option>
                  <option value="Municipal Corporation">Municipal Corporation</option>
                  <option value="General Administration">General Administration</option>
                </select>
              </div>
            </div>
          )}

          {/* Email Address */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs sm:text-sm font-bold text-slate-700" htmlFor="input-email">
                Email Address
              </label>
              {email && (
                <span className={`text-[11px] font-bold flex items-center gap-1 transition-colors ${
                  isEmailValid ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {isEmailValid ? (
                    <>
                      <Check className="h-3 w-3 stroke-[3]" />
                      <span>Valid format</span>
                    </>
                  ) : (
                    <span>Invalid format</span>
                  )}
                </span>
              )}
            </div>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                id="input-email"
                type="email"
                required
                autoComplete="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`w-full pl-11 pr-10 py-3 bg-slate-50/80 border rounded-xl text-sm text-slate-800 font-medium placeholder-slate-400 transition-all duration-200 focus:bg-white focus:outline-none ${
                  touched.email && !isEmailValid
                    ? 'border-red-400 focus:border-red-500 ring-2 ring-red-100'
                    : isEmailValid && email
                    ? 'border-emerald-300 focus:border-emerald-500'
                    : `border-slate-200 ${currentPortalConfig.ringColor}`
                }`}
              />
              {isEmailValid && (
                <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-emerald-500 animate-in zoom-in-75 duration-200" />
              )}
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs sm:text-sm font-bold text-slate-700" htmlFor="input-password">
                Password
              </label>
              {password && (
                <span className="text-[11px] font-bold text-slate-500">
                  {pwdStrength.text}
                </span>
              )}
            </div>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                id="input-password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                className={`w-full pl-11 pr-11 py-3 bg-slate-50/80 border rounded-xl text-sm text-slate-800 font-medium placeholder-slate-400 transition-all duration-200 focus:bg-white focus:outline-none ${
                  touched.password && !isPasswordValid
                    ? 'border-red-400 focus:border-red-500 ring-2 ring-red-100'
                    : `border-slate-200 ${currentPortalConfig.ringColor}`
                }`}
              />
              <button
                type="button"
                id="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-0.5"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>

            {/* Interactive Password Strength Progress Bars */}
            {password && (
              <div className="mt-2 flex gap-1.5 h-1.5 w-full rounded-full overflow-hidden bg-slate-100">
                <div className={`h-full flex-1 transition-all duration-300 ${pwdStrength.score >= 1 ? pwdStrength.color : 'bg-slate-200'}`} />
                <div className={`h-full flex-1 transition-all duration-300 ${pwdStrength.score >= 2 ? pwdStrength.color : 'bg-slate-200'}`} />
                <div className={`h-full flex-1 transition-all duration-300 ${pwdStrength.score >= 3 ? pwdStrength.color : 'bg-slate-200'}`} />
                <div className={`h-full flex-1 transition-all duration-300 ${pwdStrength.score >= 4 ? pwdStrength.color : 'bg-slate-200'}`} />
              </div>
            )}
          </div>

          {/* Contact Phone (Register only) */}
          {isRegister && (
            <div className="animate-in fade-in duration-150">
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5" htmlFor="input-phone">
                Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative group">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  id="input-phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium placeholder-slate-400 transition-all duration-200 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          {(() => {
            const isAdminRegisterBlocked = selectedRole === 'admin' && isRegister && !adminCapacity.registration_allowed;

            return (
              <button
                type="submit"
                id="auth-submit-btn"
                disabled={loading || isAdminRegisterBlocked || (touched.email && !isEmailValid) || (touched.password && !isPasswordValid)}
                className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm tracking-wide uppercase transition-all duration-200 flex items-center justify-center gap-2.5 shadow-xl relative overflow-hidden group font-display ${
                  isAdminRegisterBlocked
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                    : currentPortalConfig.btnColor
                } ${
                  loading ? 'opacity-70 cursor-not-allowed' : isAdminRegisterBlocked ? '' : 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]'
                }`}
              >
                {/* Shimmer sweep effect */}
                {!isAdminRegisterBlocked && (
                  <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 shimmer-sweep pointer-events-none" />
                )}

                {loading ? (
                  <>
                    <div className="h-4.5 w-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : isAdminRegisterBlocked ? (
                  <>
                    <Shield className="h-4.5 w-4.5 text-slate-400" />
                    <span>Admin Registrations Full (Max 2)</span>
                  </>
                ) : isRegister ? (
                  <>
                    <UserPlus className="h-4.5 w-4.5 group-hover:scale-110 transition-transform" />
                    <span>Create Account</span>
                    <ArrowRight className="h-4 w-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
                  </>
                ) : (
                  <>
                    <LogIn className="h-4.5 w-4.5 group-hover:scale-110 transition-transform" />
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            );
          })()}
        </form>
      </div>
    </div>
  );
}
