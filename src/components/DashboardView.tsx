import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowRightLeft,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  Plus,
  Calendar,
  Users,
  Search,
  BookOpen,
  ArrowRight,
  TrendingUp,
  X,
  MapPin,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { SKILL_CATEGORIES } from '../data/seedData';
import { ProficiencyLevel } from '../types';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    communityUsers,
    proposals,
    openProposeModalForUser,
    addSkillOffered,
    removeSkillOffered,
    addSkillWanted,
    removeSkillWanted,
    setIsPremiumModalOpen,
    setIsIntentModalOpen,
    setIsRegistrationPaymentModalOpen,
    setActiveTab,
    isUserAuthenticated,
  } = useApp();

  const [signupFilter, setSignupFilter] = useState<'all' | 'swap' | 'teach_revenue' | 'learn'>('all');

  // Add Skill quick popover inside dashboard
  const [isAddingOffered, setIsAddingOffered] = useState(false);
  const [isAddingWanted, setIsAddingWanted] = useState(false);
  const [newOfferedName, setNewOfferedName] = useState('');
  const [newOfferedCat, setNewOfferedCat] = useState<string>(SKILL_CATEGORIES[0]);
  const [newOfferedProf, setNewOfferedProf] = useState<ProficiencyLevel>('intermediate');
  const [newWantedName, setNewWantedName] = useState('');
  const [newWantedCat, setNewWantedCat] = useState<string>(SKILL_CATEGORIES[1]);
  const [newWantedTarget, setNewWantedTarget] = useState<ProficiencyLevel>('advanced');

  const handleAddOffered = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfferedName.trim()) return;
    addSkillOffered({
      name: newOfferedName.trim(),
      category: newOfferedCat,
      proficiency: newOfferedProf,
      yearsExperience: 2,
      description: `Hands-on mentoring in ${newOfferedName.trim()}`,
      sessionRatePKR: currentUser.intent === 'teach_revenue' ? 600 : undefined,
    });
    setNewOfferedName('');
    setIsAddingOffered(false);
  };

  const handleAddWanted = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWantedName.trim()) return;
    addSkillWanted({
      name: newWantedName.trim(),
      category: newWantedCat,
      currentLevel: 'beginner',
      targetLevel: newWantedTarget,
      priority: 'high',
    });
    setNewWantedName('');
    setIsAddingWanted(false);
  };

  const activeSwapsCount = proposals.filter(p => p.status === 'accepted').length;
  const pendingRequestsCount = proposals.filter(p => p.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Welcome & Intent Banner */}
      <div className="rounded-2xl p-6 sm:p-7 bg-gradient-to-r from-slate-900 to-indigo-950 text-white relative overflow-hidden shadow-lg border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                {currentUser.intent === 'swap'
                  ? 'Active Mode: Skill Swap'
                  : currentUser.intent === 'learn'
                  ? 'Active Mode: Pure Learner'
                  : 'Active Mode: Teach & Earn'}
              </span>
              {currentUser.isRegFeePaid ? (
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Member (PKR 200 Settled)
                </span>
              ) : (
                <button
                  onClick={() => setIsRegistrationPaymentModalOpen(true)}
                  className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/50 hover:bg-emerald-500/40 flex items-center gap-1 transition-colors animate-pulse"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Verify Account (Pay PKR 200)
                </button>
              )}
              {currentUser.isPremiumPass && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/40 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Premium Pass Active
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isUserAuthenticated ? `Welcome back, ${currentUser.name}!` : 'Welcome to HUNARIVO!'}
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              {currentUser.headline || 'Connecting peers across Pakistan for mutual knowledge sharing.'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('explore')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span>Explore All Mentors</span>
            </button>
            <button
              onClick={() => setIsIntentModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-all flex items-center gap-1.5 border border-white/15"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Switch Intent Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. AD BANNER (Only displayed if user does NOT have Premium Pass) */}
      {!currentUser.isPremiumPass && (
        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Community Sponsor</span>
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  Fast-track your learning with Hunarivo Premium Pass
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Remove all platform ads and unlock the automated mutual matching engine via Easypaisa or JazzCash.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPremiumModalOpen(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <span>Go Ad-Free for PKR 300/mo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Stat Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">Skills Offered</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {currentUser.skillsOffered.length}
            </span>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">To Teach</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">Skills Wanted</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {currentUser.skillsWanted.length}
            </span>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">To Learn</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">Active Swaps</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {activeSwapsCount}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">In Progress</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">
            {currentUser.intent === 'teach_revenue' ? 'Wallet Balance' : 'Pending Proposals'}
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {currentUser.intent === 'teach_revenue'
                ? `PKR ${currentUser.walletBalancePKR.toLocaleString()}`
                : pendingRequestsCount}
            </span>
            <button
              onClick={() => setActiveTab(currentUser.intent === 'teach_revenue' ? 'wallet' : 'my-swaps')}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* 4. NEWLY SIGNED UP PROFILES & COMMUNITY DIRECTORY */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Newly Signed Up Members & Profiles
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                <UserCheck className="w-3 h-3" /> Live Community Signups
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Browse profiles of newly joined members across Pakistan who recently completed their onboarding and added their skills.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('onboarding')}
              className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add / Onboard Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs for Signed Up Members */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit text-xs">
          <button
            onClick={() => setSignupFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              signupFilter === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            All Signups ({communityUsers.length + (currentUser.name ? 1 : 0)})
          </button>
          <button
            onClick={() => setSignupFilter('swap')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              signupFilter === 'swap'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Skill Swappers
          </button>
          <button
            onClick={() => setSignupFilter('teach_revenue')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              signupFilter === 'teach_revenue'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Teach & Earn
          </button>
          <button
            onClick={() => setSignupFilter('learn')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              signupFilter === 'learn'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Learners
          </button>
        </div>

        {/* Community Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Current User Card (shown first if matches filter) */}
          {(signupFilter === 'all' || currentUser.intent === signupFilter) && (
            <div className="rounded-2xl border-2 border-indigo-500/30 bg-gradient-to-b from-indigo-50/30 to-white dark:from-indigo-950/20 dark:to-slate-900 p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {currentUser.name || 'You'}
                        </h3>
                        <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950 px-1.5 py-0.5 rounded">
                          You
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block truncate max-w-[150px]">
                        {currentUser.city} · Joined {currentUser.joinedDate || 'Recently'}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {currentUser.headline}
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {currentUser.bio}
                </p>

                {/* Teaching and Learning Skills */}
                <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 space-y-2 mb-4">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">
                      Skills You Offer:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {currentUser.skillsOffered.length > 0 ? (
                        currentUser.skillsOffered.map(s => (
                          <span
                            key={s.id}
                            className="text-xs font-medium text-slate-800 dark:text-slate-200"
                          >
                            {s.name} ({s.proficiency})
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No teaching skills added yet</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-slate-200/50 dark:border-slate-700/40">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">
                      Skills You Want to Learn:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {currentUser.skillsWanted.length > 0 ? (
                        currentUser.skillsWanted.map(w => (
                          <span
                            key={w.id}
                            className="text-xs font-medium text-amber-700 dark:text-amber-300"
                          >
                            {w.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No learning goals added yet</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500">
                  Mode: {currentUser.intent === 'swap' ? 'Skill Swap' : currentUser.intent === 'learn' ? 'Learn' : 'Teach & Earn'}
                </span>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-semibold transition-colors"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          )}

          {/* Other Community Members who signed up */}
          {communityUsers
            .filter(peer => peer.id !== currentUser.id)
            .filter(peer => {
              if (signupFilter === 'all') return true;
              return peer.intent === signupFilter;
            })
            .map(peer => (
              <div
                key={peer.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-800 transition-all"
              >
                <div>
                  {/* Peer Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={peer.avatarUrl}
                        alt={peer.name}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            {peer.name}
                          </h3>
                          {peer.isPremiumPass && (
                            <span title="Premium Pass Member" className="text-amber-500">
                              <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block truncate max-w-[150px]">
                          {peer.city} · Joined {peer.joinedDate}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {peer.headline}
                  </p>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {peer.bio}
                  </p>

                  {/* Skills Box */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2 mb-4">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">
                        Offers to Teach:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {peer.skillsOffered.map(s => (
                          <span
                            key={s.id}
                            className="text-xs font-medium text-slate-800 dark:text-slate-200"
                          >
                            {s.name} ({s.proficiency})
                          </span>
                        ))}
                      </div>
                      {peer.intent === 'teach_revenue' && peer.skillsOffered[0]?.sessionRatePKR && (
                        <span className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 block mt-1">
                          Rate: PKR {peer.skillsOffered[0].sessionRatePKR} / session
                        </span>
                      )}
                    </div>

                    <div className="pt-1.5 border-t border-slate-200/50 dark:border-slate-700/40">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">
                        Wants to Learn:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {peer.skillsWanted.map(w => (
                          <span
                            key={w.id}
                            className="text-xs font-medium text-amber-700 dark:text-amber-300"
                          >
                            {w.name} (target: {w.targetLevel})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    ⭐ {peer.rating} ({peer.completedSwapsCount} swaps)
                  </span>

                  <button
                    onClick={() => openProposeModalForUser(peer)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>
                      {peer.intent === 'teach_revenue' ? 'Book Session' : 'Propose Swap'}
                    </span>
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* 5. SKILL INVENTORY & MANAGEMENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Your Teaching Skills */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Skills You Teach & Offer
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Peers can request swaps for these skills
              </span>
            </div>
            <button
              onClick={() => setIsAddingOffered(!isAddingOffered)}
              className="px-2.5 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg flex items-center gap-1"
            >
              {isAddingOffered ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{isAddingOffered ? 'Cancel' : 'Add Skill'}</span>
            </button>
          </div>

          {/* Quick add form */}
          {isAddingOffered && (
            <form onSubmit={handleAddOffered} className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700">
              <input
                type="text"
                required
                value={newOfferedName}
                onChange={e => setNewOfferedName(e.target.value)}
                placeholder="Skill name (e.g. Flutter Development)"
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newOfferedCat}
                  onChange={e => setNewOfferedCat(e.target.value)}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                >
                  {SKILL_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <select
                  value={newOfferedProf}
                  onChange={e => setNewOfferedProf(e.target.value as ProficiencyLevel)}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="master">Master</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
              >
                Save Teaching Skill
              </button>
            </form>
          )}

          {/* List */}
          <div className="space-y-2.5">
            {currentUser.skillsOffered.map(skill => (
              <div
                key={skill.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {skill.name}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-1.5 py-0.5 rounded">
                      {skill.proficiency}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    {skill.category}
                  </span>
                </div>
                <button
                  onClick={() => removeSkillOffered(skill.id)}
                  className="text-slate-400 hover:text-red-500 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Your Learning Desires */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Skills You Desire to Learn
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Used to find mentors and reciprocal partners
              </span>
            </div>
            <button
              onClick={() => setIsAddingWanted(!isAddingWanted)}
              className="px-2.5 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg flex items-center gap-1"
            >
              {isAddingWanted ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{isAddingWanted ? 'Cancel' : 'Add Goal'}</span>
            </button>
          </div>

          {/* Quick add form */}
          {isAddingWanted && (
            <form onSubmit={handleAddWanted} className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700">
              <input
                type="text"
                required
                value={newWantedName}
                onChange={e => setNewWantedName(e.target.value)}
                placeholder="Skill you want to learn (e.g. Spoken Arabic)"
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newWantedCat}
                  onChange={e => setNewWantedCat(e.target.value)}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                >
                  {SKILL_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <select
                  value={newWantedTarget}
                  onChange={e => setNewWantedTarget(e.target.value as ProficiencyLevel)}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                >
                  <option value="intermediate">Target: Intermediate</option>
                  <option value="advanced">Target: Advanced</option>
                  <option value="master">Target: Master</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold"
              >
                Save Learning Desire
              </button>
            </form>
          )}

          {/* List */}
          <div className="space-y-2.5">
            {currentUser.skillsWanted.map(skill => (
              <div
                key={skill.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {skill.name}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/70 px-1.5 py-0.5 rounded">
                      Target: {skill.targetLevel}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    {skill.category}
                  </span>
                </div>
                <button
                  onClick={() => removeSkillWanted(skill.id)}
                  className="text-slate-400 hover:text-red-500 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
