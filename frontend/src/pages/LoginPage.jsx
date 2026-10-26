import React, { useState } from 'react';
import { 
  Shield, User, Building2, Lock, Mail, Eye, EyeOff, 
  CheckCircle2, AlertCircle, Sparkles, LogIn, UserPlus, Phone, Briefcase
} from 'lucide-react';
import { login, register } from '../services/authService';

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

  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const portals = {
    citizen: {
      id: 'citizen',
      label: 'Citizen',
      icon: User,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      demoEmail: 'citizen@gmail.com',
      demoPass: 'Citizen@1234',
    },
    officer: {
      id: 'officer',
      label: 'Officer',
      icon: Building2,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      btnColor: 'bg-blue-600 hover:bg-blue-700 text-white',
      demoEmail: 'officer.water@gov.in',
      demoPass: 'Officer@1234',
    },
    admin: {
      id: 'admin',
      label: 'Admin',
      icon: Shield,
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      btnColor: 'bg-indigo-700 hover:bg-indigo-800 text-white',
      demoEmail: 'admin@gov.in',
      demoPass: 'Admin@1234',
    }
  };

  const currentPortalConfig = portals[selectedRole] || portals.officer;
  const RoleIcon = currentPortalConfig.icon;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email.trim());
  const isPasswordValid = password.length >= 6;
  const isNameValid = !isRegister || name.trim().length >= 2;

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
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!isPasswordValid) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (isRegister && !isNameValid) {
      setErrorMsg('Please enter your full name (minimum 2 characters).');
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

        setSuccessMsg(`Account created for ${result.user?.name}.`);
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess(result.user, selectedRole);
          }
        }, 500);
      } else {
        const result = await login({
          email,
          password,
          role: selectedRole
        });

        setSuccessMsg(`Welcome, ${result.user?.name}!`);
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess(result.user, selectedRole);
          }
        }, 400);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      
      {/* Brand Header */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-white/10 text-2xl mb-2 backdrop-blur-sm shadow-inner">
          🏛️
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Public Grievance Portal
        </h1>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-slate-900">
        
        {/* Role Selector Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 p-1.5 flex gap-1">
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
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${
                  isSelected 
                    ? (portal.id === 'citizen' ? 'text-emerald-600' : portal.id === 'officer' ? 'text-blue-600' : 'text-indigo-600') 
                    : 'text-slate-400'
                }`} />
                <span>{portal.label}</span>
              </button>
            );
          })}
        </div>

        {/* Card Header & Fill Demo */}
        <div className="px-6 pt-5 pb-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg border ${currentPortalConfig.badgeColor}`}>
              <RoleIcon className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {currentPortalConfig.label} {isRegister ? 'Registration' : 'Login'}
            </h2>
          </div>

          {!isRegister && (
            <button
              type="button"
              id="quick-demo-btn"
              onClick={handleQuickFill}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 px-2 py-1 rounded-md flex items-center gap-1 transition-colors"
            >
              <Sparkles className="h-3 w-3 text-blue-500" />
              <span>Fill Demo</span>
            </button>
          )}
        </div>

        {/* Sign In / Register Toggle */}
        <div className="px-6 mt-3">
          <div className="flex border-b border-slate-200 text-xs font-semibold">
            <button
              type="button"
              id="tab-signin"
              onClick={() => {
                setIsRegister(false);
                setErrorMsg('');
              }}
              className={`pb-2 mr-5 transition-all ${
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
              className={`pb-2 transition-all ${
                isRegister ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mx-6 mt-3 p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 pt-3.5 space-y-3.5">
          {/* Name (Register only) */}
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="input-name">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="input-name"
                  type="text"
                  required
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-800 font-medium placeholder-slate-400 focus:bg-white focus:outline-none ${
                    touched.name && !isNameValid
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Department (Officer Register only) */}
          {isRegister && selectedRole === 'officer' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="select-dept">
                Department
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select
                  id="select-dept"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
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

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="input-email">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="input-email"
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-800 font-medium placeholder-slate-400 focus:bg-white focus:outline-none ${
                  touched.email && !isEmailValid
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-slate-200 focus:border-blue-500'
                }`}
              />
            </div>
            {touched.email && !isEmailValid && email && (
              <p className="text-[11px] text-red-500 font-medium mt-1">
                Please enter a valid email address.
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="input-password">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="input-password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                className={`w-full pl-9 pr-9 py-2 bg-slate-50 border rounded-lg text-xs text-slate-800 font-medium placeholder-slate-400 focus:bg-white focus:outline-none ${
                  touched.password && !isPasswordValid
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-slate-200 focus:border-blue-500'
                }`}
              />
              <button
                type="button"
                id="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Toggle password"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {touched.password && !isPasswordValid && (
              <p className="text-[11px] text-red-500 font-medium mt-1">
                Password must be at least 6 characters.
              </p>
            )}
          </div>

          {/* Phone (Register only) */}
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="input-phone">
                Phone <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="input-phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            id="auth-submit-btn"
            disabled={loading || (touched.email && !isEmailValid) || (touched.password && !isPasswordValid)}
            className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs tracking-wide transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
              currentPortalConfig.btnColor
            } ${
              loading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-95'
            }`}
          >
            {loading ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : isRegister ? (
              <>
                <UserPlus className="h-3.5 w-3.5" />
                <span>Create Account</span>
              </>
            ) : (
              <>
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
