import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethod } from '../types';
import { Sparkles, ShieldCheck, Check, X, Building, Loader2, CheckCircle2 } from 'lucide-react';

export const PremiumPassModal: React.FC = () => {
  const { isPremiumModalOpen, setIsPremiumModalOpen, processPayment, currentUser } = useApp();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('easypaisa');
  const [accountNumber, setAccountNumber] = useState(currentUser.phone || '03001234567');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isPremiumModalOpen) return null;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    const identifier = accountNumber;

    setTimeout(async () => {
      await processPayment(
        'premium_pass',
        300,
        selectedMethod,
        identifier,
        'Hunarivo Premium Pass (1 Month)'
      );
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsPremiumModalOpen(false);
      }, 1500);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => setIsPremiumModalOpen(false)}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>HUNARIVO PRO TIER</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Upgrade to Hunarivo Premium Pass
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Accelerate your learning curve with automated reciprocal partner discovery and zero ads.
          </p>
        </div>

        {/* Value Proposition List */}
        <div className="space-y-2.5 mb-6">
          <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3 h-3" />
            </div>
            <div>
              <strong className="text-slate-900 dark:text-white">100% Ad-Free Experience:</strong> Enjoy clean, uninterrupted dashboard and learning sessions without any sponsor banners.
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3 h-3" />
            </div>
            <div>
              <strong className="text-slate-900 dark:text-white">Smart Member Matchmaking:</strong> Our matching algorithm actively crawls incoming members and automatically queues mutual skill swaps for you.
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3 h-3" />
            </div>
            <div>
              <strong className="text-slate-900 dark:text-white">Verified Mentor Pro Badge:</strong> Stand out in community search results with verified status.
            </div>
          </div>
        </div>

        {/* Pricing Box */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-50/60 to-indigo-50/60 dark:from-amber-950/20 dark:to-indigo-950/20 border border-amber-200 dark:border-amber-800/50 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Subscription Price</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
                PKR 300
              </span>
              <span className="text-xs text-slate-500">/ month</span>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2 py-1 rounded">
            Cancel anytime
          </span>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubscribe} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Pay via Pakistan Local Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMethod('easypaisa')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  selectedMethod === 'easypaisa'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-600'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <span className="text-xs font-bold block">Easypaisa</span>
                <span className="text-[10px] text-slate-400">Mobile Wallet</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('jazzcash')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  selectedMethod === 'jazzcash'
                    ? 'border-red-600 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 ring-1 ring-red-600'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <span className="text-xs font-bold block">JazzCash</span>
                <span className="text-[10px] text-slate-400">MPIN Prompt</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
              Account Mobile Number
            </label>
            <input
              type="text"
              required
              value={accountNumber}
              onChange={e => setAccountNumber(e.target.value)}
              placeholder="03XXXXXXXXX"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isProcessing || isSuccess}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authorizing PKR 300 Payment...</span>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Premium Pass Activated!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Activate Premium Pass (PKR 300)</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
