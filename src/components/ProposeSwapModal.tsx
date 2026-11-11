import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRightLeft, X, Calendar, Clock, CheckCircle } from 'lucide-react';
import { ProficiencyLevel } from '../types';

export const ProposeSwapModal: React.FC = () => {
  const {
    isProposeModalOpen,
    setIsProposeModalOpen,
    proposalTargetUser,
    currentUser,
    sendProposal,
    setActiveTab,
  } = useApp();

  const [offeredSkill, setOfferedSkill] = useState(
    currentUser.skillsOffered[0]?.name || 'Web Development'
  );
  const [offeredProficiency, setOfferedProficiency] = useState<ProficiencyLevel>(
    currentUser.skillsOffered[0]?.proficiency || 'intermediate'
  );

  const [requestedSkill, setRequestedSkill] = useState(
    proposalTargetUser?.skillsOffered[0]?.name || 'UI Design'
  );
  const [requestedProficiency, setRequestedProficiency] = useState<ProficiencyLevel>(
    proposalTargetUser?.skillsOffered[0]?.proficiency || 'master'
  );

  const [proposedSessions, setProposedSessions] = useState(3);
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState(45);
  const [message, setMessage] = useState('');

  if (!isProposeModalOpen || !proposalTargetUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isPaid = proposalTargetUser.intent === 'teach_revenue';
    const rate = proposalTargetUser.skillsOffered.find(s => s.name === requestedSkill)?.sessionRatePKR || 600;

    sendProposal({
      receiverId: proposalTargetUser.id,
      receiverName: proposalTargetUser.name,
      receiverAvatar: proposalTargetUser.avatarUrl,
      offeredSkill,
      offeredProficiency,
      requestedSkill,
      requestedProficiency,
      proposedSessions: Number(proposedSessions),
      sessionDurationMinutes: Number(sessionDurationMinutes),
      message:
        message.trim() ||
        `Hi ${proposalTargetUser.name}! I'd love to exchange knowledge with you: ${offeredSkill} in exchange for ${requestedSkill}.`,
      isPaidSession: isPaid,
      sessionFeePKR: isPaid ? rate * proposedSessions : undefined,
    });

    setActiveTab('my-swaps');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => setIsProposeModalOpen(false)}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <img
            src={proposalTargetUser.avatarUrl}
            alt={proposalTargetUser.name}
            className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
          />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
              Propose Exchange
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Skill Swap with {proposalTargetUser.name}
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {proposalTargetUser.city} · {proposalTargetUser.headline}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Skill You Will Teach */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Skill You Will Offer / Teach:
            </label>
            {currentUser.skillsOffered.length > 0 ? (
              <select
                value={offeredSkill}
                onChange={e => {
                  setOfferedSkill(e.target.value);
                  const found = currentUser.skillsOffered.find(s => s.name === e.target.value);
                  if (found) setOfferedProficiency(found.proficiency);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                {currentUser.skillsOffered.map(s => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.proficiency})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                required
                value={offeredSkill}
                onChange={e => setOfferedSkill(e.target.value)}
                placeholder="Enter skill you will teach"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            )}
          </div>

          {/* Skill You Request from Them */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Skill You Want {proposalTargetUser.name} to Teach:
            </label>
            <select
              value={requestedSkill}
              onChange={e => {
                setRequestedSkill(e.target.value);
                const found = proposalTargetUser.skillsOffered.find(s => s.name === e.target.value);
                if (found) setRequestedProficiency(found.proficiency);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
            >
              {proposalTargetUser.skillsOffered.map(s => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.proficiency})
                  {s.sessionRatePKR ? ` - PKR ${s.sessionRatePKR}/session` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Sessions & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Proposed Sessions
              </label>
              <select
                value={proposedSessions}
                onChange={e => setProposedSessions(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                <option value={1}>1 Session (Exploratory)</option>
                <option value={2}>2 Sessions</option>
                <option value={3}>3 Sessions (Recommended)</option>
                <option value={5}>5 Sessions (Comprehensive)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Duration Per Session
              </label>
              <select
                value={sessionDurationMinutes}
                onChange={e => setSessionDurationMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>
          </div>

          {/* Intro Message */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Personal Note / Learning Objective
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Introduce your current level, why you are excited to learn this, and what hours work best for you..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>

          {/* If Paid session */}
          {proposalTargetUser.intent === 'teach_revenue' && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs">
              <span className="font-semibold text-emerald-800 dark:text-emerald-300 block">
                Micro-Revenue Tutoring Rate:
              </span>
              <span className="text-slate-600 dark:text-slate-400 mt-0.5 block">
                This mentor teaches for a nominal fee of PKR {proposalTargetUser.skillsOffered[0]?.sessionRatePKR || 600} / session.
                Estimated total for {proposedSessions} session(s): <strong className="font-mono text-emerald-700 dark:text-emerald-300">PKR {((proposalTargetUser.skillsOffered[0]?.sessionRatePKR || 600) * proposedSessions).toLocaleString()}</strong>.
              </span>
            </div>
          )}

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Send Skill Swap Proposal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
