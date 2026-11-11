import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProficiencyLevel, SkillOffering, SkillDesire, PaymentMethod, PaymentRecord } from '../types';
import { SKILL_CATEGORIES, POPULAR_SKILLS } from '../data/seedData';
import {
  CheckCircle,
  CheckCircle2,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Building,
  GraduationCap,
  Banknote,
  ArrowRightLeft,
  Loader2,
  KeyRound,
  RotateCcw,
  Receipt,
  Phone,
  Clock,
  Copy,
  Check,
} from 'lucide-react';

export const OnboardingWizard: React.FC = () => {
  const {
    currentUser,
    paymentHistory,
    receivingAccounts,
    completeOnboarding,
    processPayment,
    verifyTransactionId,
    setActiveTab,
    setIsIntentModalOpen,
  } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Payment Verification State (Option A as default)
  const [payVerificationMode, setPayVerificationMode] = useState<'tid' | 'wallet'>('tid');
  const [copiedTidField, setCopiedTidField] = useState<string | null>(null);

  const handleCopyTid = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTidField(field);
    setTimeout(() => setCopiedTidField(null), 2000);
  };
  const [payStage, setPayStage] = useState<'input' | 'otp' | 'verified'>(
    currentUser.isRegFeePaid ? 'verified' : 'input'
  );
  const [payMethod, setPayMethod] = useState<PaymentMethod>('easypaisa');
  const [accountNumber, setAccountNumber] = useState(currentUser.phone || '03001234567');
  const [otpCode, setOtpCode] = useState('4920');
  const [manualTid, setManualTid] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentRecord, setPaymentRecord] = useState<PaymentRecord | null>(
    paymentHistory.find(p => p.type === 'reg_fee') || null
  );

  // Step 2: Profile State
  const [fullName, setFullName] = useState(currentUser.name || '');
  const [username, setUsername] = useState(currentUser.username || '');
  const [city, setCity] = useState(currentUser.city || 'Karachi, Pakistan');
  const [headline, setHeadline] = useState(currentUser.headline || '');
  const [bio, setBio] = useState(currentUser.bio || '');

  // Step 3: Skills State
  const [skillsOffered, setSkillsOffered] = useState<SkillOffering[]>(currentUser.skillsOffered);
  const [skillsWanted, setSkillsWanted] = useState<SkillDesire[]>(currentUser.skillsWanted);

  // Offering Draft
  const [offerName, setOfferName] = useState('');
  const [offerCategory, setOfferCategory] = useState<string>(SKILL_CATEGORIES[0]);
  const [offerProficiency, setOfferProficiency] = useState<ProficiencyLevel>('intermediate');
  const [offerYears, setOfferYears] = useState<number>(2);
  const [offerRatePKR, setOfferRatePKR] = useState<number>(600);
  const [offerDesc, setOfferDesc] = useState('');

  // Wanting Draft
  const [wantName, setWantName] = useState('');
  const [wantCategory, setWantCategory] = useState<string>(SKILL_CATEGORIES[1]);
  const [wantCurrent, setWantCurrent] = useState<'none' | 'beginner' | 'intermediate'>('beginner');
  const [wantTarget, setWantTarget] = useState<ProficiencyLevel>('advanced');
  const [wantPriority, setWantPriority] = useState<'high' | 'medium' | 'exploratory'>('high');

  // Step 4: Availability & Premium State
  const [weeklyHours, setWeeklyHours] = useState<number>(currentUser.weeklyHours || 4);
  const [formats, setFormats] = useState<('video' | 'async' | 'pair_programming')[]>(
    currentUser.preferredFormats || ['video', 'pair_programming']
  );
  const [optForPremium, setOptForPremium] = useState<boolean>(currentUser.isPremiumPass);

  // Step 1: Initiate Prompt (Send OTP/MPIN request to phone)
  const handleInitiatePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPayStage('otp');
    }, 1000);
  };

  // Step 1: Verify MPIN/OTP and settle PKR 200
  const handleConfirmOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    const identifier = accountNumber;

    setTimeout(async () => {
      const record = await processPayment(
        'reg_fee',
        200,
        payMethod,
        identifier,
        'Hunarivo Verified Member Registration Fee'
      );
      setPaymentRecord(record);
      setIsProcessingPayment(false);
      setPayStage('verified');
    }, 1200);
  };

  // Step 1: Verify via manual TID / counter receipt
  const handleVerifyManualTid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTid.trim()) return;
    setIsProcessingPayment(true);

    setTimeout(async () => {
      const record = await verifyTransactionId(manualTid.trim(), payMethod);
      setPaymentRecord(record);
      setIsProcessingPayment(false);
      setPayStage('verified');
    }, 1200);
  };

  const addOffering = () => {
    if (!offerName.trim()) return;
    const newOffering: SkillOffering = {
      id: `off-${Date.now()}`,
      name: offerName.trim(),
      category: offerCategory,
      proficiency: offerProficiency,
      yearsExperience: Number(offerYears) || 1,
      description: offerDesc.trim() || `Practical mentorship in ${offerName.trim()}`,
      sessionRatePKR: currentUser.intent === 'teach_revenue' ? Number(offerRatePKR) : undefined,
    };
    setSkillsOffered(prev => [...prev, newOffering]);
    setOfferName('');
    setOfferDesc('');
  };

  const removeOffering = (id: string) => {
    setSkillsOffered(prev => prev.filter(s => s.id !== id));
  };

  const addDesire = () => {
    if (!wantName.trim()) return;
    const newDesire: SkillDesire = {
      id: `want-${Date.now()}`,
      name: wantName.trim(),
      category: wantCategory,
      currentLevel: wantCurrent,
      targetLevel: wantTarget,
      priority: wantPriority,
    };
    setSkillsWanted(prev => [...prev, newDesire]);
    setWantName('');
  };

  const removeDesire = (id: string) => {
    setSkillsWanted(prev => prev.filter(s => s.id !== id));
  };

  const toggleFormat = (fmt: 'video' | 'async' | 'pair_programming') => {
    setFormats(prev =>
      prev.includes(fmt) ? prev.filter(f => f !== fmt) : [...prev, fmt]
    );
  };

  const handleFinishOnboarding = () => {
    completeOnboarding({
      name: fullName || 'New Member',
      username: username || (fullName ? fullName.toLowerCase().replace(/\s+/g, '_') : 'member_pk'),
      city,
      headline: headline || 'Knowledge Swapper',
      bio: bio || 'Passionate about continuous learning and peer-to-peer collaboration.',
      skillsOffered,
      skillsWanted,
      weeklyHours,
      preferredFormats: formats,
      isPremiumPass: optForPremium,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Onboarding Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-medium mb-3">
          <span>Hunarivo Onboarding Workflow</span>
          <span>·</span>
          <button
            onClick={() => setIsIntentModalOpen(true)}
            className="underline font-semibold hover:text-indigo-900 dark:hover:text-white"
          >
            Switch Intent: {currentUser.intent === 'swap' ? 'Skill Swap' : currentUser.intent === 'learn' ? 'Learn' : 'Teach & Earn'}
          </button>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Set Up Your Skill Exchange Profile
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
          Complete the 4-step onboarding to establish your verified presence, define your teaching or learning proficiencies, and activate matching.
        </p>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-4 gap-2 mb-8">
        {[
          { step: 1, label: '1. Registration Fee', desc: 'PKR 200 Verification' },
          { step: 2, label: '2. Profile & Bio', desc: 'Identity & City' },
          { step: 3, label: '3. Skill Taxonomy', desc: 'Teach & Learn Levels' },
          { step: 4, label: '4. Availability', desc: 'Schedule & Launch' },
        ].map(item => (
          <div
            key={item.step}
            className={`p-3 rounded-xl border transition-all text-left ${
              currentStep === item.step
                ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30'
                : currentStep > item.step
                ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {item.label}
              </span>
              {currentStep > item.step && (
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 truncate">
              {item.desc}
            </span>
          </div>
        ))}
      </div>

      {/* STEP 1: Registration Fee (PKR 200) Verification */}
      {currentStep === 1 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          <div className="max-w-xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Step 1: Community Registration Fee Verification (PKR 200)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Verifies authentic Pakistani learners and creators via Easypaisa or JazzCash.
                </p>
              </div>
            </div>

            {/* Case A: Already Verified */}
            {(payStage === 'verified' || currentUser.isRegFeePaid) && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                        Payment Verified & Account Authenticated!
                      </h3>
                      <span className="text-xs text-emerald-700 dark:text-emerald-300">
                        Mobile Wallet Settlement Confirmed
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 text-xs space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Transaction Ref:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {paymentRecord?.referenceId || 'EP-982341-PK'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Payment Rail:</span>
                      <span className="uppercase text-slate-700 dark:text-slate-300 font-sans font-semibold">
                        {(paymentRecord?.method || payMethod)} Interbank Gateway
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Amount Settled:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        PKR 200.00 (Lifetime Access)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Status:</span>
                      <span className="font-sans font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Authenticated Member
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setPayStage('input')}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Test Another Payment Method</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Step 2: Profile & Bio</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Case B: Verification in Progress */}
            {payStage !== 'verified' && !currentUser.isRegFeePaid && (
              <div className="space-y-6">
                {/* Price Due Box */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">Registration Fee</span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                      PKR 200
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                      Instant Verification
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-1">Easypaisa · JazzCash</span>
                  </div>
                </div>

                {/* Verification Mode Selector Tabs */}
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setPayVerificationMode('tid');
                      setPayStage('input');
                    }}
                    className={`w-1/2 py-2 text-xs font-semibold rounded-lg transition-all ${
                      payVerificationMode === 'tid'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    ⚡ Option A: Direct Transfer & TID
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPayVerificationMode('wallet');
                      setPayStage('input');
                    }}
                    className={`w-1/2 py-2 text-xs font-semibold rounded-lg transition-all ${
                      payVerificationMode === 'wallet'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    📱 Mobile Wallet Debit (MPIN)
                  </button>
                </div>

                {/* Sub-flow 1: Mobile Wallet Direct Debit */}
                {payVerificationMode === 'wallet' && (
                  <div>
                    {payStage === 'input' && (
                      <form onSubmit={handleInitiatePrompt} className="space-y-5">
                        {/* Rail Selector */}
                        <div>
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                            Select Payment Channel:
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setPayMethod('easypaisa')}
                              className={`p-3 rounded-xl border text-center transition-all ${
                                payMethod === 'easypaisa'
                                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 ring-1 ring-emerald-600'
                                  : 'border-slate-200 dark:border-slate-800'
                              }`}
                            >
                              <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white font-bold text-xs flex items-center justify-center mx-auto mb-1">
                                EP
                              </div>
                              <span className="text-xs font-semibold block text-slate-900 dark:text-white">Easypaisa</span>
                              <span className="text-[10px] text-slate-400">Mobile Wallet</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setPayMethod('jazzcash')}
                              className={`p-3 rounded-xl border text-center transition-all ${
                                payMethod === 'jazzcash'
                                  ? 'border-red-600 bg-red-50 dark:bg-red-950/40 ring-1 ring-red-600'
                                  : 'border-slate-200 dark:border-slate-800'
                              }`}
                            >
                              <div className="w-7 h-7 rounded-lg bg-red-600 text-white font-bold text-xs flex items-center justify-center mx-auto mb-1">
                                JC
                              </div>
                              <span className="text-xs font-semibold block text-slate-900 dark:text-white">JazzCash</span>
                              <span className="text-[10px] text-slate-400">MPIN Prompt</span>
                            </button>
                          </div>
                        </div>

                        {/* Input */}
                        <div>
                          <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                            {payMethod === 'easypaisa' ? 'Easypaisa' : 'JazzCash'} Mobile Number
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                              <Phone className="w-4 h-4" />
                            </div>
                            <input
                              type="text"
                              required
                              value={accountNumber}
                              onChange={e => setAccountNumber(e.target.value)}
                              placeholder="03XXXXXXXXX"
                              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                            A verification authorization prompt will be pushed to this mobile account.
                          </span>
                        </div>

                        <button
                          type="submit"
                          disabled={isProcessingPayment}
                          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                        >
                          {isProcessingPayment ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Dispatching Payment Request...</span>
                            </>
                          ) : (
                            <>
                              <span>Send Verification Prompt (PKR 200)</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </form>
                    )}

                    {/* Sub-step: Enter OTP / MPIN */}
                    {payStage === 'otp' && (
                      <form onSubmit={handleConfirmOtp} className="space-y-5 animate-in fade-in duration-200">
                        <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60">
                          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
                            <KeyRound className="w-4 h-4" />
                            <span>Authorization Prompt Dispatched</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            A payment request of <strong>PKR 200</strong> was sent to <strong>{accountNumber}</strong> via <strong>{payMethod.toUpperCase()}</strong>.
                          </p>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            Enter 4-Digit MPIN / SMS OTP to Authorize:
                          </label>
                          <input
                            type="text"
                            maxLength={4}
                            required
                            value={otpCode}
                            onChange={e => setOtpCode(e.target.value)}
                            placeholder="4920"
                            className="w-full text-center tracking-widest text-xl font-mono px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block text-center">
                            Simulated test MPIN is pre-filled. Enter any 4 digits to confirm clearance.
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5" /> Prompt active (01:45)
                          </span>
                          <button
                            type="button"
                            onClick={() => setPayStage('input')}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            Change Phone Number
                          </button>
                        </div>

                        <button
                          type="submit"
                          disabled={isProcessingPayment}
                          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                        >
                          {isProcessingPayment ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Verifying Mobile Payment Gateway...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4" />
                              <span>Authorize & Verify PKR 200</span>
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* Sub-flow 2: Manual Bank Transfer / TID Verification (Option A) */}
                {payVerificationMode === 'tid' && (
                  <form onSubmit={handleVerifyManualTid} className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          Transfer PKR 200 to Official HUNARIVO Account:
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          0% Fee (Direct Transfer)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                        {/* Easypaisa */}
                        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Easypaisa Mobile:</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              {receivingAccounts.easypaisaNumber}
                            </span>
                            <span className="text-[10px] text-slate-500 block">Title: {receivingAccounts.easypaisaTitle}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyTid(receivingAccounts.easypaisaNumber, 'ep')}
                            className="px-2 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 flex items-center gap-1"
                          >
                            {copiedTidField === 'ep' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedTidField === 'ep' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>

                        {/* JazzCash */}
                        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 block">JazzCash Mobile:</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              {receivingAccounts.jazzcashNumber}
                            </span>
                            <span className="text-[10px] text-slate-500 block">Title: {receivingAccounts.jazzcashTitle}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyTid(receivingAccounts.jazzcashNumber, 'jc')}
                            className="px-2 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 flex items-center gap-1"
                          >
                            {copiedTidField === 'jc' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedTidField === 'jc' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Enter Transaction Reference ID (TID):
                      </label>
                      <input
                        type="text"
                        required
                        value={manualTid}
                        onChange={e => setManualTid(e.target.value)}
                        placeholder="e.g. 10928374615 or EP-892410-PK"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        Found in your bank SMS confirmation or app receipt.
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessingPayment || !manualTid.trim()}
                      className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      {isProcessingPayment ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Checking Interbank Settlement Records...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verify TID & Activate Profile</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: Profile & Bio */}
      {currentStep === 2 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          <div className="max-w-xl mx-auto space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Step 2: Tell the Community About Yourself
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Help members understand your background, interests, and collaboration style.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Bilal Ahmed"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. bilal_codes"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  City / Location
                </label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                >
                  <option value="Karachi, Pakistan">Karachi, Pakistan</option>
                  <option value="Lahore, Pakistan">Lahore, Pakistan</option>
                  <option value="Islamabad, Pakistan">Islamabad, Pakistan</option>
                  <option value="Rawalpindi, Pakistan">Rawalpindi, Pakistan</option>
                  <option value="Peshawar, Pakistan">Peshawar, Pakistan</option>
                  <option value="Faisalabad, Pakistan">Faisalabad, Pakistan</option>
                  <option value="Multan, Pakistan">Multan, Pakistan</option>
                  <option value="Remote / Worldwide">Remote / Worldwide</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Professional Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                  placeholder="e.g. React Frontend Engineer & Tech Mentor"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Short Bio (What inspires you to swap or learn?)
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Share your background, recent projects, and what kind of peers you are looking to collaborate with..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Payment
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5"
              >
                Next: Add Skills & Proficiencies <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Skills Architecture */}
      {currentStep === 3 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Step 3: Define Skills & Proficiency Levels
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Add the skills you can offer/teach and the skills you are looking to learn. Our algorithm matches you based on complementary proficiencies.
            </p>
          </div>

          {/* Section A: Skills You Can Teach */}
          {(currentUser.intent === 'swap' || currentUser.intent === 'teach_revenue') && (
            <div className="p-5 rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Skills You Can Offer / Teach
                  </h3>
                </div>
                {currentUser.intent === 'teach_revenue' && (
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    Teach for Revenue Mode
                  </span>
                )}
              </div>

              {/* Existing Offered list */}
              {skillsOffered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {skillsOffered.map(skill => (
                    <div
                      key={skill.id}
                      className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-start"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {skill.name}
                          </span>
                          <span className="text-[10px] uppercase font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
                            {skill.proficiency}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                          {skill.category} · {skill.yearsExperience} yrs exp
                        </span>
                        {skill.sessionRatePKR && (
                          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 block mt-0.5">
                            PKR {skill.sessionRatePKR}/session
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeOffering(skill.id)}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-400 italic mb-4">
                  No teaching skills added yet. Add at least one skill below.
                </div>
              )}

              {/* Add Offering Form */}
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  + Add a Skill You Can Teach
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Skill Name</label>
                    <input
                      type="text"
                      value={offerName}
                      onChange={e => setOfferName(e.target.value)}
                      placeholder="e.g. React & TypeScript"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Category</label>
                    <select
                      value={offerCategory}
                      onChange={e => setOfferCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                    >
                      {SKILL_CATEGORIES.map(c => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Proficiency Level</label>
                    <select
                      value={offerProficiency}
                      onChange={e => setOfferProficiency(e.target.value as ProficiencyLevel)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                    >
                      <option value="beginner">Beginner (Basic)</option>
                      <option value="intermediate">Intermediate (Solid)</option>
                      <option value="advanced">Advanced (Industry)</option>
                      <option value="master">Master / Expert</option>
                    </select>
                  </div>
                </div>

                {currentUser.intent === 'teach_revenue' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">Session Rate in PKR</label>
                      <input
                        type="number"
                        value={offerRatePKR}
                        onChange={e => setOfferRatePKR(Number(e.target.value))}
                        placeholder="e.g. 600"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">Years of Practical Exp</label>
                      <input
                        type="number"
                        value={offerYears}
                        onChange={e => setOfferYears(Number(e.target.value))}
                        placeholder="e.g. 3"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={addOffering}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Offering
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section B: Skills You Want to Learn */}
          {(currentUser.intent === 'swap' || currentUser.intent === 'learn') && (
            <div className="p-5 rounded-xl border border-amber-100 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Skills You Want to Learn
                </h3>
              </div>

              {/* Existing Wanted list */}
              {skillsWanted.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {skillsWanted.map(skill => (
                    <div
                      key={skill.id}
                      className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-start"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {skill.name}
                          </span>
                          <span className="text-[10px] uppercase font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded">
                            Target: {skill.targetLevel}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                          {skill.category} · Priority: {skill.priority}
                        </span>
                      </div>
                      <button
                        onClick={() => removeDesire(skill.id)}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-400 italic mb-4">
                  No learning desires added yet. Add what you are eager to learn!
                </div>
              )}

              {/* Add Desire Form */}
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  + Add a Skill You Wish to Learn
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Desired Skill</label>
                    <input
                      type="text"
                      value={wantName}
                      onChange={e => setWantName(e.target.value)}
                      placeholder="e.g. Figma UI/UX Design"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Target Proficiency</label>
                    <select
                      value={wantTarget}
                      onChange={e => setWantTarget(e.target.value as ProficiencyLevel)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                    >
                      <option value="intermediate">Intermediate (Hands-on)</option>
                      <option value="advanced">Advanced (Professional)</option>
                      <option value="master">Master</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Priority</label>
                    <select
                      value={wantPriority}
                      onChange={e => setWantPriority(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                    >
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="exploratory">Exploratory / Casual</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={addDesire}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Learning Goal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Nav */}
          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Profile
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5"
            >
              Next: Availability & Launch <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Availability & Launch */}
      {currentStep === 4 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Step 4: Availability, Preferences & Launch
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select your preferred exchange formats and decide if you want the Hunarivo Premium Pass for auto-matching and ad-free usage.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Weekly Time Commitment
              </label>
              <select
                value={weeklyHours}
                onChange={e => setWeeklyHours(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              >
                <option value={2}>1 - 2 hours per week</option>
                <option value={4}>3 - 5 hours per week (Recommended)</option>
                <option value={8}>6 - 10 hours per week (Intensive)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Preferred Exchange Formats
              </label>
              <div className="flex flex-wrap gap-2 mt-1">
                {[
                  { id: 'video', label: '1-on-1 Video Call' },
                  { id: 'pair_programming', label: 'Live Pairing / Screenshare' },
                  { id: 'async', label: 'Asynchronous Reviews' },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleFormat(item.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      formats.includes(item.id as any)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Premium Pass Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-indigo-50 dark:from-amber-950/30 dark:to-indigo-950/30 border border-amber-200 dark:border-amber-800/60">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 mb-1">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>HUNARIVO PREMIUM PASS</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Unlock Instant Auto-Matching & Ad-Free Experience
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-md">
                  Let our algorithmic match engine automatically suggest reciprocal peer partners in your dashboard queue. 100% ad-free experience.
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-amber-700 dark:text-amber-300 font-mono">
                    PKR 300/mo
                  </span>
                  <span>·</span>
                  <span>Pay via Easypaisa or JazzCash</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOptForPremium(!optForPremium)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all shrink-0 ${
                  optForPremium
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-amber-500'
                }`}
              >
                {optForPremium ? '✓ Premium Pass Added' : '+ Add Premium Pass'}
              </button>
            </div>
          </div>

          {/* Complete Launch */}
          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Skills
            </button>

            <button
              type="button"
              onClick={handleFinishOnboarding}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <span>Launch My HUNARIVO Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
