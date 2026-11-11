import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Lock,
  LogOut,
  RefreshCw,
  Trash2,
  UserX,
  UserCheck,
  Sparkles,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  Eye,
  Settings,
  DollarSign,
  ChevronDown,
  KeyRound,
  ExternalLink,
  Database,
  Copy,
  Check,
  FileCode,
  Code,
  EyeOff,
  Play,
} from 'lucide-react';
import { UserProfile, PaymentMethod } from '../types';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection,
} from '../lib/supabase';

export const AdminPortalView: React.FC = () => {
  const {
    allRegisteredUsers,
    adminAccount,
    isAdminLoggedIn,
    adminRegister,
    adminLogin,
    adminLogout,
    adminResetAccount,
    adminCancelSubscription,
    adminApproveSubscription,
    adminVerifyRegistration,
    adminToggleSuspend,
    adminDeleteUser,
    receivingAccounts,
    updateReceivingAccounts,
    isSupabaseConnected,
    refreshSupabaseSync,
    paymentHistory,
    setActiveTab,
  } = useApp();

  // Dynamic Auth State (Allow admin to create their own account)
  const [authMode, setAuthMode] = useState<'signin' | 'register'>(
    adminAccount ? 'signin' : 'register'
  );
  const [nameInput, setNameInput] = useState(adminAccount?.name || '');
  const [emailInput, setEmailInput] = useState(adminAccount?.email || '');
  const [passcodeInput, setPasscodeInput] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Management state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pass_pending' | 'premium_active' | 'reg_pending' | 'suspended'>('all');
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserProfile | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Receiving accounts config form
  const [isEditingAccounts, setIsEditingAccounts] = useState(false);
  const [accountsForm, setAccountsForm] = useState(receivingAccounts);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlViewer, setShowSqlViewer] = useState(false);

  // Supabase live configuration state
  const [supabaseForm, setSupabaseForm] = useState(getSupabaseConfig());
  const [isEditingSupabase, setIsEditingSupabase] = useState(!isSupabaseConnected);
  const [showAnonKey, setShowAnonKey] = useState(false);
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [supabaseTestFeedback, setSupabaseTestFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const showNotification = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 3000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
    showNotification('Supabase SQL Schema copied to clipboard! Paste into your Supabase SQL Editor.');
  };

  const handleSaveSupabaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseForm.url.startsWith('https://')) {
      showNotification('Please enter a valid Supabase URL starting with https://');
      return;
    }
    saveSupabaseConfig(supabaseForm.url, supabaseForm.anonKey);
    await refreshSupabaseSync();
    showNotification('Supabase settings saved! Testing connection...');
    setTestingSupabase(true);
    const res = await testSupabaseConnection();
    setTestingSupabase(false);
    setSupabaseTestFeedback(res);
    if (res.success) {
      setIsEditingSupabase(false);
    }
  };

  const handleTestSupabaseLive = async () => {
    setTestingSupabase(true);
    setSupabaseTestFeedback(null);
    const res = await testSupabaseConnection();
    setTestingSupabase(false);
    setSupabaseTestFeedback(res);
  };

  const handleClearSupabase = async () => {
    clearSupabaseConfig();
    setSupabaseForm({ url: '', anonKey: '' });
    await refreshSupabaseSync();
    setSupabaseTestFeedback(null);
    setIsEditingSupabase(true);
    showNotification('Supabase credentials cleared.');
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (authMode === 'register') {
      if (adminAccount) {
        setAuthError('An administrator account already exists. Only one admin account can be created on HUNARIVO.');
        setAuthMode('signin');
        return;
      }
      if (passcodeInput !== confirmPasscode) {
        setAuthError('Passwords do not match. Please verify your passwords.');
        return;
      }
      if (passcodeInput.length < 6) {
        setAuthError('Password must be at least 6 characters.');
        return;
      }
      const res = adminRegister(emailInput, passcodeInput, nameInput);
      if (!res.success) {
        setAuthError(res.error || 'Failed to create administrator account.');
      } else {
        showNotification('Administrator account created successfully! Welcome to your Admin Console.');
      }
    } else {
      const res = adminLogin(emailInput, passcodeInput);
      if (!res.success) {
        setAuthError(res.error || 'Authentication failed. Please verify your administrator credentials.');
      }
    }
  };

  const handleSaveAccounts = (e: React.FormEvent) => {
    e.preventDefault();
    updateReceivingAccounts(accountsForm);
    setIsEditingAccounts(false);
    showNotification('Platform Easypaisa & JazzCash receiving accounts updated successfully.');
  };

  // Filtered users calculation
  const filteredUsers = useMemo(() => {
    return allRegisteredUsers.filter(user => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.username.toLowerCase().includes(q) ||
        user.phone.toLowerCase().includes(q) ||
        user.city.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (statusFilter === 'pass_pending') {
        return user.passPaymentStatus === 'pending' || (user.isPremiumPass && !user.isRegFeePaid);
      }
      if (statusFilter === 'premium_active') {
        return user.isPremiumPass && user.passPaymentStatus !== 'pending';
      }
      if (statusFilter === 'reg_pending') {
        return !user.isRegFeePaid;
      }
      if (statusFilter === 'suspended') {
        return !!user.isSuspended;
      }

      return true;
    });
  }, [allRegisteredUsers, searchQuery, statusFilter]);

  // Aggregate Metrics
  const stats = useMemo(() => {
    const totalUsers = allRegisteredUsers.length;
    const pendingPassUsers = allRegisteredUsers.filter(
      u => u.passPaymentStatus === 'pending' || (u.isPremiumPass && !u.isRegFeePaid)
    ).length;
    const activePassUsers = allRegisteredUsers.filter(
      u => u.isPremiumPass && u.passPaymentStatus !== 'pending'
    ).length;
    const pendingRegFeeUsers = allRegisteredUsers.filter(u => !u.isRegFeePaid).length;
    const verifiedRegUsers = allRegisteredUsers.filter(u => u.isRegFeePaid).length;
    const suspendedUsers = allRegisteredUsers.filter(u => !!u.isSuspended).length;
    const recurringRevenue = activePassUsers * 300;

    return {
      totalUsers,
      pendingPassUsers,
      activePassUsers,
      pendingRegFeeUsers,
      verifiedRegUsers,
      suspendedUsers,
      recurringRevenue,
    };
  }, [allRegisteredUsers]);

  // ================= ADMIN AUTHENTICATION GATE =================
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 sm:py-24">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-xl">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 mx-auto mb-5">
            <Lock className="w-7 h-7" />
          </div>

          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>HUNARIVO ADMINISTRATOR PORTAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {adminAccount ? 'Administrator Sign-In' : 'Create Administrator Account'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
              {adminAccount
                ? 'Sign in with your configured administrator credentials. Only the authorized administrator account can access this portal.'
                : 'Set up the single platform administrator credentials. Once created, registration is closed permanently.'}
            </p>
          </div>

          {/* Single Slot Enforced Indicator */}
          {adminAccount ? (
            <div className="mb-6 p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center gap-2.5 text-xs text-indigo-900 dark:text-indigo-200">
              <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-600" />
              <div>
                <span className="font-bold block">Single Authorized Admin Slot Active</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Only the registered administrator can sign in. Additional admin accounts cannot be created.
                </span>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <div>
                <span className="font-bold block">Primary Administrator Setup Mode</span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400">
                  Create your administrator credentials. Only ONE admin account is permitted on HUNARIVO.
                </span>
              </div>
            </div>
          )}

          {authError && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Administrator Name / Title
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  placeholder="e.g. Platform Owner"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Administrator Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder="your-email@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Administrator Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={passcodeInput}
                  onChange={e => setPasscodeInput(e.target.value)}
                  placeholder={authMode === 'register' ? 'Choose a password (min 6 chars)' : 'Enter your password'}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {authMode === 'register' && (
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={confirmPasscode}
                    onChange={e => setConfirmPasscode(e.target.value)}
                    placeholder="Re-enter your chosen password"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>
                {authMode === 'register' ? 'Create Administrator Account' : 'Sign In to Admin Portal'}
              </span>
            </button>
          </form>

          {/* Helper switcher footer */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            {adminAccount ? (
              <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <Lock className="w-3.5 h-3.5 text-indigo-500" />
                <span>Single Authorized Administrator Slot Active · Only 1 Account Allowed</span>
              </p>
            ) : (
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                Setup Mode · Create the primary platform administrator credentials
              </p>
            )}
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              ← Return to Public Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= ADMIN PORTAL CONSOLE =================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Banner / Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>
              ADMINISTRATOR: {adminAccount?.name || 'Platform Admin'} ({adminAccount?.email || 'admin'})
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            HUNARIVO Master Admin Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Monitor all registered accounts, verify PKR 200 onboarding fees, audit pending PKR 300 premium pass payments, cancel delinquent subscriptions, and configure receiving accounts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              adminResetAccount();
              showNotification('Administrator credentials reset. You can now register new credentials.');
            }}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            title="Wipe current admin credentials and register a new one"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset Admin Account</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Site</span>
          </button>

          <button
            onClick={adminLogout}
            className="px-3.5 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </div>

      {actionSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Registered Accounts */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Registered Accounts</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {stats.totalUsers}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {stats.verifiedRegUsers} verified · {stats.pendingRegFeeUsers} pending fee
          </div>
        </div>

        {/* Pass Payment Pending (Crucial User Requirement) */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-rose-50 dark:from-amber-950/30 dark:to-rose-950/30 border border-amber-300 dark:border-amber-800/80 shadow-sm">
          <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 mb-2">
            <span className="text-xs font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Pass Payment Pending
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
              Action
            </span>
          </div>
          <div className="text-2xl font-black text-amber-900 dark:text-amber-200 font-mono">
            {stats.pendingPassUsers}
          </div>
          <div className="text-[11px] text-amber-800 dark:text-amber-400 mt-1">
            Pass requested but PKR 300 unpaid
          </div>
        </div>

        {/* Active Premium Pass Subscribers */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Active Premium Passes</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {stats.activePassUsers}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            PKR 300/mo active subscribers
          </div>
        </div>

        {/* Monthly Recurring Subscription Revenue */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Pass Monthly MRR</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            PKR {stats.recurringRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Zero gateway commission
          </div>
        </div>

        {/* Reg Fee Pending Verification */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Reg Fee Pending</span>
            <CreditCard className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {stats.pendingRegFeeUsers}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            PKR 200 onboarding pending
          </div>
        </div>
      </div>

      {/* Main Accounts Management Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search member name, email, phone, city..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All Accounts ({allRegisteredUsers.length})
            </button>

            <button
              onClick={() => setStatusFilter('pass_pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                statusFilter === 'pass_pending'
                  ? 'bg-amber-600 text-white ring-2 ring-amber-400'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 hover:bg-amber-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Pass Payment Pending ({stats.pendingPassUsers})</span>
            </button>

            <button
              onClick={() => setStatusFilter('premium_active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                statusFilter === 'premium_active'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Active Premium ({stats.activePassUsers})</span>
            </button>

            <button
              onClick={() => setStatusFilter('reg_pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === 'reg_pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 hover:bg-blue-100'
              }`}
            >
              Reg Fee Unpaid ({stats.pendingRegFeeUsers})
            </button>

            {stats.suspendedUsers > 0 && (
              <button
                onClick={() => setStatusFilter('suspended')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === 'suspended'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 hover:bg-rose-100'
                }`}
              >
                Suspended ({stats.suspendedUsers})
              </button>
            )}
          </div>
        </div>

        {/* Registered Users Table */}
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Member Profile</th>
                <th className="py-3.5 px-4">City / Contact</th>
                <th className="py-3.5 px-4">Intent Mode</th>
                <th className="py-3.5 px-4">Reg Fee (PKR 200)</th>
                <th className="py-3.5 px-4">Premium Pass (PKR 300)</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No registered user accounts match the current filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const isPassPending =
                    user.passPaymentStatus === 'pending' || (user.isPremiumPass && !user.isRegFeePaid);

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                        user.isSuspended ? 'bg-rose-50/30 dark:bg-rose-950/20' : ''
                      } ${isPassPending ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''}`}
                    >
                      {/* Member Profile */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&h=128&q=80'}
                            alt={user.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {user.name}
                              </span>
                              {user.isPremiumPass && (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                  PRO
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-mono block">
                              @{user.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* City / Contact */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-[11px] text-slate-700 dark:text-slate-300 font-mono">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{user.phone || '03001234567'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate max-w-[160px]">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{user.email}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{user.city}</span>
                          </div>
                        </div>
                      </td>

                      {/* Intent Mode */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            user.intent === 'teach_revenue'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : user.intent === 'learn'
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                              : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                          }`}
                        >
                          {user.intent === 'teach_revenue'
                            ? 'Teach for Revenue'
                            : user.intent === 'learn'
                            ? 'Learn Skills'
                            : 'Skill Swap'}
                        </span>
                      </td>

                      {/* Reg Fee (PKR 200) */}
                      <td className="py-3.5 px-4">
                        {user.isRegFeePaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>PKR 200 Paid</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold text-[11px]">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Unpaid (PKR 200)</span>
                          </span>
                        )}
                      </td>

                      {/* Premium Pass Status (PKR 300) */}
                      <td className="py-3.5 px-4">
                        {isPassPending ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-bold text-[10px] border border-amber-300 dark:border-amber-700 animate-pulse">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>Pass Payment Pending</span>
                            </span>
                            <span className="text-[10px] text-amber-800 dark:text-amber-400 block font-medium">
                              PKR 300 Unconfirmed
                            </span>
                          </div>
                        ) : user.isPremiumPass ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 font-bold text-[10px] border border-emerald-300 dark:border-emerald-700">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Active (PKR 300 Paid)</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">
                            Not Subscribed
                          </span>
                        )}
                      </td>

                      {/* Account Standing */}
                      <td className="py-3.5 px-4">
                        {user.isSuspended ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[10px] font-bold">
                            <UserX className="w-3 h-3 text-rose-600" />
                            <span>Suspended</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Active Member</span>
                          </span>
                        )}
                      </td>

                      {/* Administrative Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Cancel Subscription Action (Specifically Requested) */}
                          {(user.isPremiumPass || user.passPaymentStatus === 'pending') && (
                            <button
                              type="button"
                              onClick={() => {
                                adminCancelSubscription(user.id);
                                showNotification(`Cancelled subscription for ${user.name} due to non-payment.`);
                              }}
                              title="Cancel user pass subscription when they do not pay"
                              className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 font-bold text-[11px] transition-colors flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Cancel Pass</span>
                            </button>
                          )}

                          {/* Approve Pass if pending */}
                          {user.passPaymentStatus === 'pending' && (
                            <button
                              type="button"
                              onClick={() => {
                                adminApproveSubscription(user.id);
                                showNotification(`Verified and approved PKR 300 Premium Pass for ${user.name}.`);
                              }}
                              title="Manually verify received PKR 300 payment"
                              className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors"
                            >
                              Approve PKR 300
                            </button>
                          )}

                          {/* Toggle Reg Fee Payment Status */}
                          <button
                            type="button"
                            onClick={() => {
                              adminVerifyRegistration(user.id, !user.isRegFeePaid);
                              showNotification(
                                user.isRegFeePaid
                                  ? `Marked registration fee unpaid for ${user.name}.`
                                  : `Verified PKR 200 registration fee for ${user.name}.`
                              );
                            }}
                            title={user.isRegFeePaid ? 'Revoke PKR 200 verification' : 'Verify PKR 200 payment'}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                          </button>

                          {/* Suspend / Reactivate */}
                          <button
                            type="button"
                            onClick={() => {
                              adminToggleSuspend(user.id);
                              showNotification(
                                user.isSuspended
                                  ? `Reactivated account for ${user.name}.`
                                  : `Suspended account for ${user.name}.`
                              );
                            }}
                            title={user.isSuspended ? 'Reactivate Account' : 'Suspend Account'}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              user.isSuspended
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {user.isSuspended ? (
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <UserX className="w-3.5 h-3.5 text-rose-500" />
                            )}
                          </button>

                          {/* View Profile Drawer */}
                          <button
                            type="button"
                            onClick={() => setSelectedUserDetail(user)}
                            title="Inspect details & skills"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Account */}
                          {deleteConfirmId === user.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  adminDeleteUser(user.id);
                                  setDeleteConfirmId(null);
                                  showNotification(`Deleted account for ${user.name}.`);
                                }}
                                className="px-2 py-1 rounded bg-rose-600 text-white font-bold text-[10px]"
                              >
                                Confirm Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-1.5 py-1 text-[10px] text-slate-400"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(user.id)}
                              title="Permanently Delete Account"
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Platform Receiving Accounts (Option A Master Controls) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-600 text-white">
                Admin Rail Configuration
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Active Easypaisa & JazzCash Receiving Numbers
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              These are the mobile wallet destinations where users transfer PKR 200 registration fees and PKR 300 premium passes.
            </p>
          </div>

          <button
            onClick={() => {
              setAccountsForm(receivingAccounts);
              setIsEditingAccounts(!isEditingAccounts);
            }}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{isEditingAccounts ? 'Close Editor' : 'Edit Receiving Accounts'}</span>
          </button>
        </div>

        {isEditingAccounts ? (
          <form onSubmit={handleSaveAccounts} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">
                  Easypaisa Mobile Wallet
                </span>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    required
                    value={accountsForm.easypaisaNumber}
                    onChange={e => setAccountsForm(prev => ({ ...prev, easypaisaNumber: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    Account Title
                  </label>
                  <input
                    type="text"
                    required
                    value={accountsForm.easypaisaTitle}
                    onChange={e => setAccountsForm(prev => ({ ...prev, easypaisaTitle: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-red-700 dark:text-red-400 block">
                  JazzCash Mobile Wallet
                </span>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    required
                    value={accountsForm.jazzcashNumber}
                    onChange={e => setAccountsForm(prev => ({ ...prev, jazzcashNumber: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    Account Title
                  </label>
                  <input
                    type="text"
                    required
                    value={accountsForm.jazzcashTitle}
                    onChange={e => setAccountsForm(prev => ({ ...prev, jazzcashTitle: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsEditingAccounts(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Save Receiving Accounts
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">
                  Easypaisa Account
                </span>
                <span className="text-base font-mono font-bold text-slate-900 dark:text-white block mt-0.5">
                  {receivingAccounts.easypaisaNumber}
                </span>
                <span className="text-xs text-slate-500 block">
                  Title: {receivingAccounts.easypaisaTitle}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Active
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-red-700 dark:text-red-400 block">
                  JazzCash Account
                </span>
                <span className="text-base font-mono font-bold text-slate-900 dark:text-white block mt-0.5">
                  {receivingAccounts.jazzcashNumber}
                </span>
                <span className="text-xs text-slate-500 block">
                  Title: {receivingAccounts.jazzcashTitle}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                Active
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Supabase Backend Database Integration Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Supabase PostgreSQL Backend Database
                </h2>
                {isSupabaseConnected ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-[10px] font-bold border border-emerald-300 dark:border-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>LINKED & LIVE SYNC ACTIVE</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold border border-amber-300 dark:border-amber-700">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>NOT LINKED YET — READY FOR YOUR KEYS</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Persistent storage for user profiles, reciprocal skill swaps, payment logs, and mobile wallet configurations.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleTestSupabaseLive}
              disabled={testingSupabase}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Send a probe query to verify Supabase connectivity"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-500 ${testingSupabase ? 'animate-spin' : ''}`} />
              <span>{testingSupabase ? 'Testing...' : 'Test Connection'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopySql}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'SQL Copied!' : 'Copy Schema SQL'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSqlViewer(!showSqlViewer)}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-500" />
              <span>{showSqlViewer ? 'Hide SQL' : 'View SQL Script'}</span>
            </button>
          </div>
        </div>

        {/* Live Test Feedback Banner */}
        {supabaseTestFeedback && (
          <div
            className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-start gap-2.5 animate-in fade-in duration-200 ${
              supabaseTestFeedback.success
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200'
                : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
            }`}
          >
            {supabaseTestFeedback.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            )}
            <div className="flex-1">
              <span className="block font-bold">
                {supabaseTestFeedback.success ? 'Supabase Connection Verified!' : 'Connection Check Notice'}
              </span>
              <span className="text-[11px] font-normal mt-0.5 block">
                {supabaseTestFeedback.message}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSupabaseTestFeedback(null)}
              className="text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Supabase Connection Form / Summary */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-emerald-600" />
              <span>Supabase Project Credentials</span>
            </span>

            <div className="flex items-center gap-2">
              {isSupabaseConnected && !isEditingSupabase && (
                <button
                  type="button"
                  onClick={() => setIsEditingSupabase(true)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  Edit Credentials
                </button>
              )}
              {isSupabaseConnected && (
                <button
                  type="button"
                  onClick={handleClearSupabase}
                  className="text-xs text-rose-500 hover:text-rose-700 font-semibold hover:underline ml-2"
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>

          {isEditingSupabase ? (
            <form onSubmit={handleSaveSupabaseConfig} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Supabase Project URL (e.g. <code>https://xyzcompany.supabase.co</code>)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://your-project-id.supabase.co"
                  value={supabaseForm.url}
                  onChange={e => setSupabaseForm(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                    Supabase Project API Anon Key (<code>public</code> <code>anon</code>)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAnonKey(!showAnonKey)}
                    className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
                  >
                    {showAnonKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showAnonKey ? 'Hide' : 'Reveal'}</span>
                  </button>
                </div>
                <input
                  type={showAnonKey ? 'text' : 'password'}
                  required
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseForm.anonKey}
                  onChange={e => setSupabaseForm(prev => ({ ...prev, anonKey: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                {isSupabaseConnected && (
                  <button
                    type="button"
                    onClick={() => setIsEditingSupabase(false)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={testingSupabase}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save & Connect Database</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Configured Supabase URL</span>
                <span className="font-mono text-slate-900 dark:text-white font-semibold truncate block mt-0.5">
                  {supabaseForm.url || 'Not configured'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Anon API Key</span>
                  <span className="font-mono text-slate-900 dark:text-white font-semibold block mt-0.5">
                    {supabaseForm.anonKey ? '••••••••••••••••••••••••••••' : 'Not configured'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleTestSupabaseLive}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
                >
                  Ping DB
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Setup Instructions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">1</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">Get Supabase Keys</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Open your Supabase project dashboard, navigate to <strong>Project Settings → API</strong>, and copy your <strong>Project URL</strong> and <strong>`anon` `public` key</strong>.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center">2</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">Run SQL Migration</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Click <strong>Copy Schema SQL</strong> above, open the <strong>SQL Editor</strong> in Supabase, create a new query, paste the script, and hit <strong>Run</strong>.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center">3</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">Connect Instantly</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Enter your credentials in the form above and click <strong>Save & Connect</strong>, or paste them right into the chat!
            </p>
          </div>
        </div>

        {/* Expandable SQL Schema Viewer */}
        {showSqlViewer && (
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 border border-slate-800 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
              <span className="font-mono flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-emerald-400" /> supabase-schema.sql
              </span>
              <button
                type="button"
                onClick={handleCopySql}
                className="hover:text-white text-emerald-400 font-semibold"
              >
                {copiedSql ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
            <pre className="text-[11px] font-mono text-slate-300 max-h-72 overflow-y-auto leading-relaxed select-all">
              {SUPABASE_SCHEMA_SQL}
            </pre>
          </div>
        )}
      </div>

      {/* Member Detail Drawer / Modal */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedUserDetail(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-5">
              <img
                src={selectedUserDetail.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&h=128&q=80'}
                alt={selectedUserDetail.name}
                className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedUserDetail.name}
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  @{selectedUserDetail.username} · {selectedUserDetail.city}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                <div><strong>Headline:</strong> {selectedUserDetail.headline}</div>
                <div><strong>Email:</strong> {selectedUserDetail.email}</div>
                <div><strong>Phone:</strong> {selectedUserDetail.phone}</div>
                <div><strong>Wallet Balance:</strong> PKR {selectedUserDetail.walletBalancePKR}</div>
                <div><strong>Completed Swaps:</strong> {selectedUserDetail.completedSwapsCount}</div>
                <div><strong>Rating:</strong> ⭐ {selectedUserDetail.rating} ({selectedUserDetail.reviewsCount} reviews)</div>
              </div>

              <div>
                <span className="font-bold text-slate-900 dark:text-white block mb-2">
                  Skills Offered ({selectedUserDetail.skillsOffered.length})
                </span>
                <div className="space-y-1.5">
                  {selectedUserDetail.skillsOffered.map(s => (
                    <div key={s.id} className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 flex justify-between">
                        <span>{s.name} ({s.proficiency})</span>
                        {s.sessionRatePKR && <span className="text-emerald-600 font-mono">PKR {s.sessionRatePKR}/hr</span>}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{s.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-900 dark:text-white block mb-2">
                  Skills Wanted ({selectedUserDetail.skillsWanted.length})
                </span>
                <div className="space-y-1.5">
                  {selectedUserDetail.skillsWanted.map(w => (
                    <div key={w.id} className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {w.name} (Aiming for {w.targetLevel})
                      </div>
                      {w.motivation && <p className="text-[11px] text-slate-500 mt-0.5">{w.motivation}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedUserDetail(null)}
                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SUPABASE_SCHEMA_SQL = `-- HUNARIVO — Supabase Database Migration & Schema
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT,
    email TEXT,
    phone TEXT,
    city TEXT,
    headline TEXT,
    bio TEXT,
    avatar_url TEXT,
    intent TEXT DEFAULT 'swap',
    is_reg_fee_paid BOOLEAN DEFAULT false,
    is_premium_pass BOOLEAN DEFAULT false,
    pass_payment_status TEXT DEFAULT 'none',
    is_suspended BOOLEAN DEFAULT false,
    rating NUMERIC DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 0,
    completed_swaps_count INTEGER DEFAULT 0,
    wallet_balance_pkr INTEGER DEFAULT 0,
    weekly_hours INTEGER DEFAULT 4,
    preferred_formats TEXT[] DEFAULT ARRAY['video'],
    joined_date TEXT DEFAULT 'Recently',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.skills_offered (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT,
    proficiency TEXT,
    years_experience INTEGER DEFAULT 1,
    description TEXT,
    session_rate_pkr INTEGER
);

CREATE TABLE IF NOT EXISTS public.skills_wanted (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT,
    current_level TEXT,
    target_level TEXT,
    priority TEXT,
    motivation TEXT
);

CREATE TABLE IF NOT EXISTS public.proposals (
    id TEXT PRIMARY KEY,
    sender_id TEXT,
    sender_name TEXT,
    sender_avatar TEXT,
    sender_headline TEXT,
    receiver_id TEXT,
    receiver_name TEXT,
    receiver_avatar TEXT,
    offered_skill TEXT,
    offered_proficiency TEXT,
    requested_skill TEXT,
    requested_proficiency TEXT,
    proposed_sessions INTEGER DEFAULT 1,
    session_duration_minutes INTEGER DEFAULT 45,
    status TEXT DEFAULT 'pending',
    message TEXT,
    scheduled_time TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    type TEXT NOT NULL,
    amount_pkr INTEGER NOT NULL,
    method TEXT NOT NULL,
    account_identifier TEXT,
    reference_id TEXT,
    status TEXT DEFAULT 'completed',
    receipt_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.platform_accounts (
    id TEXT PRIMARY KEY DEFAULT 'default',
    easypaisa_number TEXT DEFAULT '03451234567',
    easypaisa_title TEXT DEFAULT 'HUNARIVO Community',
    jazzcash_number TEXT DEFAULT '03007654321',
    jazzcash_title TEXT DEFAULT 'HUNARIVO Platform',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills_offered ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills_wanted ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public profiles upsert" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public skills_offered all" ON public.skills_offered FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public skills_wanted all" ON public.skills_wanted FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public proposals all" ON public.proposals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public payments all" ON public.payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public platform_accounts all" ON public.platform_accounts FOR ALL USING (true) WITH CHECK (true);
`;
