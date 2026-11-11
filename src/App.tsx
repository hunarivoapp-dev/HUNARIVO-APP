import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ExploreMatchesView } from './components/ExploreMatchesView';
import { MySwapsView } from './components/MySwapsView';
import { WalletView } from './components/WalletView';
import { OnboardingWizard } from './components/OnboardingWizard';
import { UserProfileView } from './components/UserProfileView';
import { AdminPortalView } from './components/AdminPortalView';
import { AuthView } from './components/AuthView';
import { SignupIntentModal } from './components/SignupIntentModal';
import { PremiumPassModal } from './components/PremiumPassModal';
import { ProposeSwapModal } from './components/ProposeSwapModal';
import { PaymentModal } from './components/PaymentModal';
import { ArrowRightLeft, ShieldCheck, Heart, Lock } from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isRegistrationPaymentModalOpen,
    setIsRegistrationPaymentModalOpen,
  } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'explore' && <ExploreMatchesView />}
        {activeTab === 'my-swaps' && <MySwapsView />}
        {activeTab === 'wallet' && <WalletView />}
        {activeTab === 'onboarding' && <OnboardingWizard />}
        {activeTab === 'profile' && <UserProfileView />}
        {activeTab === 'admin' && <AdminPortalView />}
        {activeTab === 'auth' && <AuthView />}
      </main>

      {/* Modals */}
      <SignupIntentModal />
      <PremiumPassModal />
      <ProposeSwapModal />
      <PaymentModal
        isOpen={isRegistrationPaymentModalOpen}
        onClose={() => setIsRegistrationPaymentModalOpen(false)}
        type="reg_fee"
        amountPKR={200}
        title="HUNARIVO Member Registration Fee"
        description="One-time PKR 200 verification fee via Easypaisa or JazzCash to activate member swaps and peer directory."
        onSuccess={() => setIsRegistrationPaymentModalOpen(false)}
      />

      {/* Quiet Footer with Admin Portal Access */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 dark:text-slate-400 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">HUNARIVO</span>
            <span>·</span>
            <span>Peer-to-Peer Skill Swap & Knowledge Barter</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              onClick={() => setActiveTab('onboarding')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Onboarding Workflow
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('wallet')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Pakistan Local Payments
            </button>
            <span>·</span>
            <button
              onClick={() => {
                setActiveTab('auth');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-colors"
            >
              Member Sign In / Sign Up
            </button>
            <span>·</span>
            {/* Dedicated Admin Portal Link in Footer */}
            <button
              onClick={() => {
                setActiveTab('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
            >
              <Lock className="w-3 h-3 text-indigo-500" />
              <span>Admin Portal</span>
            </button>
            <span>·</span>
            <span>Made with Care for Pakistani Learners & Creators</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
