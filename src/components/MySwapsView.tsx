import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowRightLeft,
  CheckCircle,
  Clock,
  Calendar,
  Video,
  XCircle,
  MessageSquare,
  Sparkles,
  Star,
  Check,
} from 'lucide-react';
import { SwapProposal } from '../types';

export const MySwapsView: React.FC = () => {
  const { proposals, updateProposalStatus, currentUser, setActiveTab } = useApp();
  const [activeTab, setActiveTabState] = useState<'incoming' | 'outgoing' | 'active' | 'completed'>('active');

  const incomingProposals = proposals.filter(p => p.receiverId === currentUser.id && p.status === 'pending');
  const outgoingProposals = proposals.filter(p => p.senderId === currentUser.id && p.status === 'pending');
  const activeSwaps = proposals.filter(p => p.status === 'accepted');
  const completedSwaps = proposals.filter(p => p.status === 'completed');

  const [reviewModalProposal, setReviewModalProposal] = useState<SwapProposal | null>(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [reviewNote, setReviewNote] = useState('');

  const handleCompleteSwap = (proposal: SwapProposal) => {
    updateProposalStatus(proposal.id, 'completed');
    setReviewModalProposal(proposal);
  };

  const handleSaveReview = () => {
    setReviewModalProposal(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Skill Swaps & Sessions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track your reciprocal exchanges, accept incoming requests, and manage 1-on-1 collaboration sessions.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('explore')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Find New Partner</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl max-w-fit">
        <button
          onClick={() => setActiveTabState('active')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'active'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Active Swaps ({activeSwaps.length})
        </button>
        <button
          onClick={() => setActiveTabState('incoming')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'incoming'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Incoming Requests ({incomingProposals.length})
        </button>
        <button
          onClick={() => setActiveTabState('outgoing')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'outgoing'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Sent Proposals ({outgoingProposals.length})
        </button>
        <button
          onClick={() => setActiveTabState('completed')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'completed'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Completed ({completedSwaps.length})
        </button>
      </div>

      {/* 1. Active Swaps Tab */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeSwaps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activeSwaps.map(item => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.receiverId === currentUser.id ? item.senderAvatar : item.receiverAvatar}
                        alt="Partner"
                        className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {item.receiverId === currentUser.id ? item.senderName : item.receiverName}
                        </h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Reciprocal Swap Partner
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/60 rounded px-2 py-0.5">
                      Active Swap
                    </span>
                  </div>

                  {/* Skills Trade Box */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">
                        You Teach:
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {item.offeredSkill}
                      </span>
                    </div>

                    <ArrowRightLeft className="w-4 h-4 text-indigo-500 shrink-0 mx-2" />

                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">
                        You Learn:
                      </span>
                      <span className="font-semibold text-amber-700 dark:text-amber-300">
                        {item.requestedSkill}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {item.scheduledTime || 'Weekend Sessions'}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {item.sessionDurationMinutes} mins / session
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => alert(`Starting simulated 1-on-1 collaboration call for ${item.offeredSkill} ⇄ ${item.requestedSkill}...`)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Live Session</span>
                    </button>

                    <button
                      onClick={() => handleCompleteSwap(item)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Mark All Done & Review</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <ArrowRightLeft className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                No Active Swaps Yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                Explore community mentors to propose your first reciprocal trade, or accept incoming requests!
              </p>
              <button
                onClick={() => setActiveTab('explore')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
              >
                Explore Skills
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. Incoming Proposals */}
      {activeTab === 'incoming' && (
        <div className="space-y-4">
          {incomingProposals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {incomingProposals.map(item => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.senderAvatar}
                        alt={item.senderName}
                        className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {item.senderName}
                        </h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {item.senderHeadline}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                      Proposal Received
                    </span>
                  </div>

                  {/* What they want to trade */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">
                        They Offer to Teach You:
                      </span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {item.offeredSkill} ({item.offeredProficiency})
                      </span>
                    </div>
                    <div className="pt-1 border-t border-slate-200/50 dark:border-slate-700/40">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">
                        They Want to Learn From You:
                      </span>
                      <span className="font-semibold text-amber-700 dark:text-amber-300">
                        {item.requestedSkill} ({item.requestedProficiency})
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                    "{item.message}"
                  </p>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => updateProposalStatus(item.id, 'declined')}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 dark:hover:text-red-400"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => updateProposalStatus(item.id, 'accepted')}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept Swap Proposal</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500">No incoming swap proposals right now.</p>
            </div>
          )}
        </div>
      )}

      {/* 3. Sent Proposals */}
      {activeTab === 'outgoing' && (
        <div className="space-y-4">
          {outgoingProposals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {outgoingProposals.map(item => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.receiverAvatar}
                        alt={item.receiverName}
                        className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          Sent to {item.receiverName}
                        </h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Awaiting Partner Response
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded">
                      Pending
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-1">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">
                        You Will Teach:
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {item.offeredSkill}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">
                        You Will Learn:
                      </span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        {item.requestedSkill}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 italic">
                    "{item.message}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500">You haven't sent any pending proposals.</p>
            </div>
          )}
        </div>
      )}

      {/* 4. Completed Swaps */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          {completedSwaps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {completedSwaps.map(item => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      Swap with {item.receiverName}
                    </span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Completed
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Traded {item.offeredSkill} for {item.requestedSkill} ({item.proposedSessions} sessions).
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500">No completed swaps recorded yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Peer Review Popover */}
      {reviewModalProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Rate Your Skill Swap Experience
            </h3>
            <p className="text-xs text-slate-500">
              How was your collaboration with {reviewModalProposal.receiverName}?
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRatingStars(star)}
                  className="p-1 text-amber-500"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= ratingStars ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              value={reviewNote}
              onChange={e => setReviewNote(e.target.value)}
              placeholder="Leave a helpful comment for their community profile..."
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
            />
            <button
              onClick={handleSaveReview}
              className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
            >
              Submit Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
