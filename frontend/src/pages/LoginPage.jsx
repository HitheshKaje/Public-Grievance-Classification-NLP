import React, { useState } from 'react';
import { 
  Shield, User, Building2, Lock, Mail, Eye, EyeOff, 
  ArrowRight, CheckCircle2, AlertCircle, Sparkles, LogIn, 
  UserPlus, Phone, Briefcase, ChevronRight
} from 'lucide-react';
import { login, register } from '../services/authService';

export default function LoginPage({ initialPortal = 'officer', onLoginSuccess }) {
  // Current active portal tab: 'citizen', 'officer', or 'admin'
  const [selectedRole, setSelectedRole] = useState(
    initialPortal === 'user' ? 'citizen' : initialPortal
  );
  
  // Toggle between 'login' and 'register' mode
  const [isRegister, setIsRegister] = useState(false);

  // Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Water Supply Department');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Validation & feedback state
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Portal configuration metadata
  const portals = {
    citizen: {
      id: 'citizen',
      label: 'Citizen Portal',
      subtitle: 'Public Grievance Redressal & Tracking',
      description: 'Lodge grievances, upload evidence, and monitor resolution progress in real time.',
      icon: User,
      gradient: 'from-emerald-600 to-teal-700',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      ringColor: 'focus:border-emerald-500 focus:ring-emerald-500/20',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20',
      demoEmail: 'citizen@gmail.com',
      demoPass: 'Citizen@1234',
    },
    officer: {
      id: 'officer',
      label: 'Department Officer',
      subtitle: 'Nodal Officer Case Management',
      description: 'Review departmental work orders, update grievance status, and dispatch inspection teams.',
      icon: Building2,
      gradient: 'from-blue-600 to-indigo-700',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      ringColor: 'focus:border-blue-500 focus:ring-blue-500/20',
      btnColor: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20',
      demoEmail: 'officer.water@gov.in',
      demoPass: 'Officer@1234',
    },
    admin: {
      id: 'admin',
      label: 'System Admin',
      subtitle: 'Central Governance & AI Triage',
      description: 'Oversee civic operations, review automated AI triage, and forward work orders across departments.',
      icon: Shield,
      gradient: 'from-purple-700 to-indigo-900',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      ringColor: 'focus:border-purple-500 focus:ring-purple-500/20',
      btnColor: 'bg-indigo-700 hover:bg-indigo-800 text-white shadow-purple-500/20',
      demoEmail: 'admin@gov.in',
      demoPass: 'Admin@1234',
    }
  };

  const currentPortalConfig = portals[selectedRole] || portals.officer;
  const RoleIcon = currentPortalConfig.icon;

  // Real-time validations
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email.trim());
  const isPasswordValid = password.length >= 6;
  const isNameValid = !isRegister || name.trim().length >= 2;

  // Validate form submission readiness
  const isFormValid = isEmailValid && isPasswordValid && isNameValid;

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

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
      setErrorMsg('Please enter a valid email address (e.g. name@domain.com).');
      return;
    }

    if (!isPasswordValid) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (isRegister && !isNameValid) {
      setErrorMsg('Please enter your full name (minimum 2 characters).');
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        // Register dynamically into MongoDB
        const result = await register({
          name,
          email,
          password,
          role: selectedRole,
          department: selectedRole === 'officer' ? department : undefined,
          phone: phone || undefined
        });

        setSuccessMsg(`Registration successful! Logged in as ${result.user?.name}.`);
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess(result.user, selectedRole);
          }
        }, 600);
      } else {
        // Authenticate dynamically against MongoDB
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
        }, 500);
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setErrorMsg(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans select-none">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Emblem */}
      <div className="text-center mb-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium text-slate-200 mb-3 shadow-inner">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>MongoDB Dynamic Authentication &bull; PGMS v2.4</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2.5">
          <span className="text-2xl">🏛️</span>
          <span>Public Grievance Portal</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
          Unified AI-powered Citizen Grievance & Municipal Resolution System
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden text-slate-900 relative z-10 transition-all duration-300">
        
        {/* Top Portal Selector Bar (3 Dashboards) */}
        <div className="bg-slate-50 border-b border-slate-200/80 p-2 sm:p-2.5">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1 mb-1">
            Select Portal Access Role:
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
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
                  }}
                  className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 scale-[1.02]'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isSelected ? (portal.id === 'citizen' ? 'text-emerald-600' : portal.id === 'officer' ? 'text-blue-600' : 'text-indigo-600') : 'text-slate-400'}`} />
                  <span className="truncate">{portal.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Portal Information Banner */}
        <div className="px-6 sm:px-8 pt-6 pb-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl border ${currentPortalConfig.badgeColor}`}>
                  <RoleIcon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">
                    {currentPortalConfig.label} Sign In
                  </h2>
                  <span className="text-xs text-slate-500 font-medium">
                    {currentPortalConfig.subtitle}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                {currentPortalConfig.description}
              </p>
            </div>
            
            {/* Quick Demo Credentials Chip */}
            {!isRegister && (
              <button
                type="button"
                id="quick-demo-btn"
                onClick={handleQuickFill}
                title="Fill verified MongoDB demo credentials"
                className="flex-shrink-0 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200/70 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                <span className="hidden sm:inline">Fill Demo</span>
              </button>
            )}
          </div>
        </div>

        {/* Sign In vs Sign Up Tabs */}
        <div className="px-6 sm:px-8 mt-4">
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              id="tab-signin"
              onClick={() => {
                setIsRegister(false);
                setErrorMsg('');
              }}
              className={`pb-2.5 text-xs font-bold transition-all relative mr-6 ${
                !isRegister ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-600'
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
              className={`pb-2.5 text-xs font-bold transition-all relative ${
                isRegister ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Register New {currentPortalConfig.label}
            </button>
          </div>
        </div>

        {/* Feedback Alert Banners */}
        {errorMsg && (
          <div className="mx-6 sm:mx-8 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 sm:mx-8 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{successMsg}</div>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 pt-4 space-y-4">
          
          {/* Full Name Field (Register Mode Only) */}
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="input-name">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="input-name"
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-800 font-medium placeholder-slate-400 transition-all focus:bg-white focus:outline-none ${
                    touched.name && !isNameValid
                      ? 'border-red-400 focus:border-red-500 ring-2 ring-red-100'
                      : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
              </div>
              {touched.name && !isNameValid && (
                <p className="text-[11px] text-red-500 font-medium mt-1">
                  Full name must be at least 2 characters.
                </p>
              )}
            </div>
          )}

          {/* Department Selection (For Officer Registration) */}
          {isRegister && selectedRole === 'officer' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="select-dept">
                Assigned Department <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select
                  id="select-dept"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:border-blue-500 focus:outline-none appearance-none"
                >
                  <option value="Water Supply Department">Water Supply Department</option>
                  <option value="Health and Sanitation">Health & Sanitation</option>
                  <option value="Power Board">Power Board & Electricity</option>
                  <option value="Public Works Department">Public Works Department (PWD)</option>
                  <option value="Police Department">Police & Public Safety</option>
                  <option value="Transport Authority">Transport Authority</option>
                  <option value="Municipal Corporation">Municipal Corporation</option>
                  <option value="General Administration">General Administration</option>
                </select>
              </div>
            </div>
          )}

          {/* Email Address Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700" htmlFor="input-email">
                Official Email Address <span className="text-red-500">*</span>
              </label>
              {touched.email && email && (
                <span className={`text-[10px] font-semibold flex items-center gap-1 ${isEmailValid ? 'text-emerald-600' : 'text-red-500'}`}>
                  {isEmailValid ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  {isEmailValid ? 'Valid Email' : 'Invalid Format'}
                </span>
              )}
            </div>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="input-email"
                type="email"
                required
                autoComplete="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-800 font-medium placeholder-slate-400 transition-all focus:bg-white focus:outline-none ${
                  touched.email && !isEmailValid
                    ? 'border-red-400 focus:border-red-500 ring-2 ring-red-100'
                    : 'border-slate-200 focus:border-blue-500'
                }`}
              />
            </div>
            {touched.email && !isEmailValid && email && (
              <p className="text-[11px] text-red-500 font-medium mt-1">
                Please enter a valid email address (e.g., citizen@example.com).
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700" htmlFor="input-password">
                Password <span className="text-red-500">*</span>
              </label>
              {isRegister && (
                <span className="text-[10px] text-slate-400">Min 6 characters</span>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="input-password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter your secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-800 font-medium placeholder-slate-400 transition-all focus:bg-white focus:outline-none ${
                  touched.password && !isPasswordValid
                    ? 'border-red-400 focus:border-red-500 ring-2 ring-red-100'
                    : 'border-slate-200 focus:border-blue-500'
                }`}
              />
              <button
                type="button"
                id="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {touched.password && !isPasswordValid && (
              <p className="text-[11px] text-red-500 font-medium mt-1">
                Password must be at least 6 characters long.
              </p>
            )}
          </div>

          {/* Phone Field (Optional for Register) */}
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="input-phone">
                Contact Phone <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="input-phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            id="auth-submit-btn"
            disabled={loading || (touched.email && !isEmailValid) || (touched.password && !isPasswordValid)}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs tracking-wide uppercase transition-all duration-200 flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
              currentPortalConfig.btnColor
            } ${
              loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Connecting to MongoDB...</span>
              </>
            ) : isRegister ? (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Create & Register {currentPortalConfig.label}</span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Access {currentPortalConfig.label}</span>
              </>
            )}
          </button>
        </form>

        {/* Security & Validation Notice */}
        <div className="bg-slate-50 px-6 sm:px-8 py-3.5 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <Lock className="h-3 w-3 text-emerald-600" />
            <span>PBKDF2-HMAC-SHA256 Encryption</span>
          </div>
          <span className="text-slate-400">&bull;</span>
          <span>Zero Hardcoded Data</span>
          <span className="text-slate-400">&bull;</span>
          <span className="font-semibold text-slate-700">Strict Triage</span>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-6 text-center text-xs text-slate-400 relative z-10">
        &copy; 2026 Public Grievance Classification Portal &bull; Department of Public Grievances
      </div>
    </div>
  );
}
