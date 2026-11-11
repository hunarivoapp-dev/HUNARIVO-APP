import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SKILL_CATEGORIES } from '../data/seedData';
import { Search, Filter, ArrowRightLeft, Star, MapPin, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

export const ExploreMatchesView: React.FC = () => {
  const { communityUsers, calculateMatch, openProposeModalForUser, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'mutual' | 'paid'>('all');

  const filteredMatches = communityUsers
    .map(peer => ({
      peer,
      match: calculateMatch(peer),
    }))
    .filter(({ peer, match }) => {
      // Search
      const searchMatch =
        peer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        peer.headline.toLowerCase().includes(searchTerm.toLowerCase()) ||
        peer.skillsOffered.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        peer.skillsWanted.some(w => w.name.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!searchMatch) return false;

      // Category
      if (selectedCategory !== 'all') {
        const catMatch =
          peer.skillsOffered.some(s => s.category === selectedCategory) ||
          peer.skillsWanted.some(w => w.category === selectedCategory);
        if (!catMatch) return false;
      }

      // Filter Mode
      if (filterMode === 'mutual' && !match.isMutualReciprocal) return false;
      if (filterMode === 'paid' && peer.intent !== 'teach_revenue') return false;

      return true;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Explore Skill Matches & Community Mentors
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Discover verified members across Pakistan ready for reciprocal skill swaps and collaborative learning sessions.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by skill name (e.g. React, Figma, English, Video Editing, SQL)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Mode Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                filterMode === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All Members
            </button>
            <button
              onClick={() => setFilterMode('mutual')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                filterMode === 'mutual'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Mutual Swaps Only
            </button>
            <button
              onClick={() => setFilterMode('paid')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                filterMode === 'paid'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Micro-Revenue Tutors
            </button>
          </div>
        </div>

        {/* Category Pill Buttons (Functional segmented filters) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Categories
          </button>
          {SKILL_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Showing {filteredMatches.length} available mentors and swappers</span>
        {currentUser.isPremiumPass && (
          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Auto-matching prioritised
          </span>
        )}
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMatches.map(({ peer, match }) => (
          <div
            key={peer.id}
            className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
              match.isMutualReciprocal
                ? 'border-indigo-300 dark:border-indigo-800 bg-gradient-to-b from-indigo-50/20 to-white dark:from-indigo-950/20 dark:to-slate-900 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
            }`}
          >
            <div>
              {/* Profile Card Header */}
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
                        <span title="Premium Verified Mentor" className="text-amber-500">
                          <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {peer.city}
                    </span>
                  </div>
                </div>

                {/* Compatibility indicator */}
                <div className="text-right">
                  <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">
                    {match.matchPercentage}%
                  </span>
                  <span className="text-[10px] block text-slate-400">Match</span>
                </div>
              </div>

              {/* Headline */}
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {peer.headline}
              </p>

              {/* Bio */}
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                {peer.bio}
              </p>

              {/* Teaching Offerings */}
              <div className="mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Skills Offered (Teaches):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {peer.skillsOffered.map(s => (
                    <div
                      key={s.id}
                      className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 text-xs font-medium border border-indigo-100 dark:border-indigo-800/60"
                    >
                      <span>{s.name}</span>
                      <span className="text-[10px] opacity-75 ml-1">· {s.proficiency}</span>
                      {s.sessionRatePKR && (
                        <span className="ml-1 font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                          (PKR {s.sessionRatePKR})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Seeking Wishes */}
              <div className="mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Skills Wanted (To Learn):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {peer.skillsWanted.map(w => (
                    <div
                      key={w.id}
                      className="px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 text-xs font-medium border border-amber-100 dark:border-amber-800/60"
                    >
                      <span>{w.name}</span>
                      <span className="text-[10px] opacity-75 ml-1">· Target: {w.targetLevel}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Synergy callout */}
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-600 dark:text-slate-400 mb-4">
                {match.proficiencySynergy}
              </div>
            </div>

            {/* Bottom Row */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span className="font-semibold text-slate-900 dark:text-white font-mono tabular-nums">
                  {peer.rating}
                </span>
                <span>({peer.completedSwapsCount} swaps)</span>
              </div>

              <button
                onClick={() => openProposeModalForUser(peer)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
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
  );
};
