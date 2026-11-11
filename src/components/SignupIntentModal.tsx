import React from 'react';
import { useApp } from '../context/AppContext';
import { UserIntent } from '../types';
import { ArrowRightLeft, GraduationCap, Banknote, CheckCircle, X } from 'lucide-react';

export const SignupIntentModal: React.FC = () => {
  const { isIntentModalOpen, setIsIntentModalOpen, setIntent, currentUser, setActiveTab } = useApp();

  if (!isIntentModalOpen) return null;

  const handleSelect = (intent: UserIntent) => {
    setIntent(intent);
    // If user hasn't paid registration fee or wants to complete profile, navigate to onboarding
    if (!currentUser.isRegFeePaid || !currentUser.name) {
      setActiveTab('onboarding');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 overflow-hidden">
        {/* Close button if user already had an intent */}
        {currentUser.intent && (
          <button
            onClick={() => setIsIntentModalOpen(false)}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="text-center max-w-lg mx-auto mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-3">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome to HUNARIVO
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            How would you like to use the platform today? Choose your primary journey below — you can always switch or combine modes later.
          </p>
        </div>

        {/* Intent Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Skill Swap */}
          <button
            onClick={() => handleSelect('swap')}
            className={`group text-left p-5 rounded-xl border transition-all relative flex flex-col justify-between ${
              currentUser.intent === 'swap'
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-1 ring-indigo-600'
                : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-slate-900'
            }`}
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Skill Swap
              </h3>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                Mutual Knowledge Barter
              </p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Teach a skill you know (e.g. React) in direct exchange for learning a skill you desire (e.g. Figma). 100% free reciprocal trades.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-medium text-indigo-600 dark:text-indigo-400">
              <span>Select Mode</span>
              {currentUser.intent === 'swap' && <CheckCircle className="w-4 h-4 text-indigo-600" />}
            </div>
          </button>

          {/* Card 2: Want to Learn */}
          <button
            onClick={() => handleSelect('learn')}
            className={`group text-left p-5 rounded-xl border transition-all relative flex flex-col justify-between ${
              currentUser.intent === 'learn'
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-1 ring-indigo-600'
                : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-slate-900'
            }`}
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Want to Learn
              </h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                Pure Learning Journey
              </p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Connect with mentors, explore structured skill paths, and book 1-on-1 guidance sessions without feeling pressured to teach.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-medium text-amber-600 dark:text-amber-400">
              <span>Select Mode</span>
              {currentUser.intent === 'learn' && <CheckCircle className="w-4 h-4 text-amber-600" />}
            </div>
          </button>

          {/* Card 3: Teach for Revenue */}
          <button
            onClick={() => handleSelect('teach_revenue')}
            className={`group text-left p-5 rounded-xl border transition-all relative flex flex-col justify-between ${
              currentUser.intent === 'teach_revenue'
                ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-600'
                : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 bg-white dark:bg-slate-900'
            }`}
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Banknote className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Teach for Revenue
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                Micro-Tutoring in PKR
              </p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Offer your expertise for a modest per-session fee. Receive fast local payouts via Easypaisa or JazzCash.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <span>Select Mode</span>
              {currentUser.intent === 'teach_revenue' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
            </div>
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
          All accounts are secured with a one-time PKR 200 verification fee. You can switch roles at any point from your profile.
        </div>
      </div>
    </div>
  );
};
