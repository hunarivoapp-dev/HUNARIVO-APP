import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Lock,
  Mail,
  Phone,
  MapPin,
  User,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ArrowRightLeft,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { UserIntent } from '../types';

const PAKISTAN_CITIES = [
  'Lahore, Pakistan',
  'Karachi, Pakistan',
  'Islamabad, Pakistan',
  'Rawalpindi, Pakistan',
  'Faisalabad, Pakistan',
  'Multan, Pakistan',
  'Peshawar, Pakistan',
  'Quetta, Pakistan',
  'Sialkot, Pakistan',
  'Gujranwala, Pakistan',
  'Hyderabad, Pakistan',
  'Abbottabad, Pakistan',
  'Bahawalpur, Pakistan',
];

interface AuthViewProps {
  initialMode?: 'signin' | 'signup';
}

export const AuthView: React.FC<AuthViewProps> = ({ initialMode = 'signup' }) => {
  const {
    userLogin,
    userSignup,
    setActiveTab,
    isUserAuthenticated,
    currentUser,
    allRegisteredUsers,
    setIsRegistrationPaymentModalOpen,
  } = useApp();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sign In fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up fields
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupCity, setSignupCity] = useState(PAKISTAN_CITIES[0]);
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupIntent, setSignupIntent] = useState<UserIntent>('swap');
  const [headline, setHeadline] = useState('');

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loginIdentifier.trim()) {
      setError('Please enter your email address or mobile number.');
      return;
    }

    const res = userLogin(loginIdentifier, loginPassword);
    if (!res.success) {
      setError(res.error || 'Authentication failed. Please check your credentials.');
    } else {
      setSuccessMsg('Successfully signed in! Redirecting to Dashboard...');
      setTimeout(() => {
        setActiveTab('dashboard');
      }, 700);
    }
  };

  // Handle Sign Up Submit
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Full Name is required.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!signupPhone.trim() || signupPhone.replace(/[^0-9]/g, '').length < 10) {
      setError('Please enter a valid Pakistani mobile number (e.g., 03001234567) for payment verification.');
      return;
    }
    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    const res = userSignup({
      name: fullName,
      email: signupEmail,
      phone: signupPhone,
      city: signupCity,
      password: signupPassword,
      intent: signupIntent,
      headline: headline.trim() || undefined,
    });

    if (!res.success) {
      setError(res.error || 'Failed to create your account.');
    } else {
      setSuccessMsg('Account created successfully! Welcome to HUNARIVO.');
      setTimeout(() => {
        setActiveTab('dashboard');
        // Prompt them to verify via Easypaisa / JazzCash
        setIsRegistrationPaymentModalOpen(true);
      }, 800);
    }
  };

  // Quick Demo Login helper
  const handleQuickDemoLogin = (email: string) => {
    setError(null);
    const res = userLogin(email, '');
    if (res.success) {
      setSuccessMsg(`Logged in as demo user! Redirecting...`);
      setTimeout(() => {
        setActiveTab('dashboard');
      }, 600);
    }
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center animate-in fade-in duration-200">
      <div className="max-w-xl w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="inline-flex items-center gap-2 mb-4 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md group-hover:bg-indigo-700 transition-colors">
              H
            </div>
            <div className="text-left">
              <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white block leading-none">
                HUNARIVO
              </span>
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                Pakistan Skill Barter & Exchange
              </span>
            </div>
          </button>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {authMode === 'signin' ? 'Sign In to Your Account' : 'Join HUNARIVO Community'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
            {authMode === 'signin'
              ? 'Access your skill swaps, learning proposals, wallet earnings, and peer community.'
              : 'Create your profile to exchange skills, teach for revenue, and learn from top Pakistani peers.'}
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          {/* Mode Tabs */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`w-1/2 py-2.5 text-xs font-bold rounded-xl transition-all ${
                authMode === 'signin'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`w-1/2 py-2.5 text-xs font-bold rounded-xl transition-all ${
                authMode === 'signup'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Create Account (Sign Up)
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {authMode === 'signin' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Email Address or Mobile Number
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={e => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. bilal@hunarivo.pk or 03001234567"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <span className="text-[11px] text-slate-400">
                    (Default demo accounts can sign in with any password)
                  </span>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 mt-4"
              >
                <span>Sign In to HUNARIVO</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Fast 1-Click Demo Profiles */}
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
                  Or One-Click Demo Sign-In
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('bilal@hunarivo.pk')}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 text-left transition-all flex items-center gap-2.5"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&h=128&q=80"
                      alt="Bilal"
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div className="truncate">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight truncate">
                        Bilal Ahmed
                      </span>
                      <span className="text-[10px] text-slate-400">React Mentor · Lahore</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('zainab@hunarivo.pk')}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 text-left transition-all flex items-center gap-2.5"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=128&h=128&q=80"
                      alt="Zainab"
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div className="truncate">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight truncate">
                        Zainab Fatima
                      </span>
                      <span className="text-[10px] text-slate-400">Figma Designer · Karachi</span>
                    </div>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* SIGN UP FORM */
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Hamza Tariq"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={e => setSignupEmail(e.target.value)}
                      placeholder="name@example.pk"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Mobile Number (Easypaisa/JazzCash)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      value={signupPhone}
                      onChange={e => setSignupPhone(e.target.value)}
                      placeholder="03001234567"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    City in Pakistan
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <select
                      value={signupCity}
                      onChange={e => setSignupCity(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                    >
                      {PAKISTAN_CITIES.map(c => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Professional Headline (Optional)
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={e => setHeadline(e.target.value)}
                    placeholder="e.g. Flutter Dev | Video Editor"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Intent Mode Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                  What is your primary intent on HUNARIVO?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignupIntent('swap')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      signupIntent === 'swap'
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-500'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <ArrowRightLeft className="w-4 h-4 text-indigo-600 mb-1" />
                    <span className="text-xs font-bold block">Skill Swap</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      Reciprocal knowledge barter
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignupIntent('learn')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      signupIntent === 'learn'
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-1 ring-blue-500'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-blue-600 mb-1" />
                    <span className="text-xs font-bold block">Learn Skills</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      Find peer instructors
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignupIntent('teach_revenue')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      signupIntent === 'teach_revenue'
                        ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 text-emerald-600 mb-1" />
                    <span className="text-xs font-bold block">Teach & Earn</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      Monetize your expertise
                    </span>
                  </button>
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Password (min 6 chars)
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={signupPassword}
                      onChange={e => setSignupPassword(e.target.value)}
                      placeholder="Choose password"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={signupConfirmPassword}
                      onChange={e => setSignupConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Pakistan Peer Verification Process</span>
                </div>
                <p>
                  New accounts require a one-time PKR 200 verification fee via Easypaisa or JazzCash to confirm authentic identity and activate swap messaging.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 mt-4"
              >
                <span>Create My Free Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Toggle Helper Footer */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            {authMode === 'signin' ? (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setError(null);
                  }}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p>
                Already registered on HUNARIVO?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setError(null);
                  }}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            ← Back to Public Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
