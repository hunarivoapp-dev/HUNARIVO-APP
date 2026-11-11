import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Sun, Moon, ArrowRightLeft, ShieldCheck, LogOut, UserPlus, LogIn } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    theme,
    toggleTheme,
    setIsIntentModalOpen,
    setIsPremiumModalOpen,
    setIsRegistrationPaymentModalOpen,
    resetToFreshOnboarding,
    isUserAuthenticated,
    userLogout,
  } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2 group text-left focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-indigo-700 transition-colors">
                H
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                  HUNARIVO
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs text-slate-400 dark:text-slate-500 font-medium">
                  Skill Swap & Peer Learning
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 4-5 concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'dashboard'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'explore'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Skill Matches
            </button>
            <button
              onClick={() => setActiveTab('my-swaps')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'my-swaps'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              My Swaps
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'wallet'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Wallet & Payments
            </button>
            <button
              onClick={() => setActiveTab('onboarding')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'onboarding'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Onboarding Flow
            </button>
            <button
              onClick={() => setActiveTab('auth')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'auth'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isUserAuthenticated ? 'Switch Profile' : 'Log In / Sign Up'}
            </button>
          </nav>

          {/* Zone 3: Actions, Premium, Theme, User Avatar */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Registration Verification Status Badge or Trigger */}
            {!currentUser.isRegFeePaid ? (
              <button
                onClick={() => setIsRegistrationPaymentModalOpen(true)}
                title="Pay one-time PKR 200 registration fee"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors whitespace-nowrap animate-pulse"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Verify Account (PKR 200)</span>
                <span className="sm:hidden">Verify</span>
              </button>
            ) : (
              <span
                title="Verified Community Member (PKR 200 Settled via Easypaisa / JazzCash)"
                className="hidden xl:flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 rounded-lg whitespace-nowrap"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Verified</span>
              </span>
            )}

            {/* Intent Switcher Quick Button */}
            <button
              onClick={() => setIsIntentModalOpen(true)}
              title="Change your learning/teaching intent"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
              <span>
                {currentUser.intent === 'swap'
                  ? 'Mode: Skill Swap'
                  : currentUser.intent === 'learn'
                  ? 'Mode: Learn Only'
                  : 'Mode: Teach & Earn'}
              </span>
            </button>

            {/* Premium Pass Status / Upgrade */}
            {currentUser.isPremiumPass ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 rounded-lg whitespace-nowrap">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Premium Pass Active</span>
              </div>
            ) : (
              <button
                onClick={() => setIsPremiumModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/70 hover:bg-amber-200 dark:hover:bg-amber-900 rounded-lg transition-colors whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="hidden sm:inline">Get Premium Pass</span>
                <span className="sm:hidden">Premium</span>
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Auth / Profile Actions */}
            {!isUserAuthenticated ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveTab('auth')}
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => setActiveTab('auth')}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm hover:shadow-indigo-500/20 transition-all flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                {/* User Profile avatar */}
                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-2 p-1 pl-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <span className="hidden sm:inline truncate max-w-[100px]">
                    {currentUser.name || 'My Profile'}
                  </span>
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                </button>
                <button
                  onClick={() => {
                    userLogout();
                    setActiveTab('auth');
                  }}
                  title="Sign out of account"
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
