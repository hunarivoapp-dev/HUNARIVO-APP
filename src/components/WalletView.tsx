import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Building,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  Loader2,
  FileText,
  HelpCircle,
  Wallet,
  ArrowRight,
  Edit3,
  Copy,
  Check,
  Save,
} from 'lucide-react';
import { PaymentMethod, PaymentRecord } from '../types';

export const WalletView: React.FC = () => {
  const {
    currentUser,
    paymentHistory,
    receivingAccounts,
    updateReceivingAccounts,
    withdrawEarnings,
    setIsPremiumModalOpen,
    setIsRegistrationPaymentModalOpen,
  } = useApp();

  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState<PaymentMethod>('easypaisa');
  const [withdrawAccount, setWithdrawAccount] = useState(currentUser.phone || '03001234567');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(currentUser.walletBalancePKR || 1000);
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);
  const [guideRole, setGuideRole] = useState<'tutor' | 'owner'>('owner');
  const [isEditingAccounts, setIsEditingAccounts] = useState(false);
  const [editAccountsForm, setEditAccountsForm] = useState(receivingAccounts);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveAccounts = (e: React.FormEvent) => {
    e.preventDefault();
    updateReceivingAccounts(editAccountsForm);
    setIsEditingAccounts(false);
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount <= 0 || withdrawAmount > currentUser.walletBalancePKR) {
      alert('Withdrawal amount exceeds your current available balance.');
      return;
    }

    setIsProcessingWithdraw(true);

    setTimeout(async () => {
      await withdrawEarnings(withdrawAmount, withdrawMethod, withdrawAccount);
      setIsProcessingWithdraw(false);
      setWithdrawSuccess(true);
      setTimeout(() => {
        setWithdrawSuccess(false);
        setWithdrawModalOpen(false);
      }, 1800);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Wallet & Pakistan Local Payment Records
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your verified community registration, tutor earnings, and payouts via Easypaisa and JazzCash.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Registration Verification Status */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Community Verification
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {currentUser.isRegFeePaid ? 'Verified Member' : 'Pending Verification'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {currentUser.isRegFeePaid
                ? 'One-time PKR 200 registration fee confirmed on Pakistan mobile network.'
                : 'Pay PKR 200 via Easypaisa or JazzCash to verify your profile.'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            {!currentUser.isRegFeePaid ? (
              <button
                onClick={() => setIsRegistrationPaymentModalOpen(true)}
                className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Account (Pay PKR 200)</span>
              </button>
            ) : (
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400">PKR 200.00 Paid</span>
                <button
                  onClick={() => {
                    const regRecord = paymentHistory.find(p => p.type === 'reg_fee') || paymentHistory[0];
                    if (regRecord) setSelectedReceipt(regRecord);
                  }}
                  className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Official Receipt</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Available Tutor / Swap Earnings */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Micro-Tutoring Earnings
              </span>
              <ArrowDownLeft className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                PKR {currentUser.walletBalancePKR.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Accumulated earnings from 1-on-1 tutoring sessions. Instant payout to mobile wallet.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setWithdrawModalOpen(true)}
              disabled={currentUser.walletBalancePKR <= 0}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Withdraw to JazzCash / Easypaisa</span>
            </button>
          </div>
        </div>

        {/* Premium Pass Status */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Hunarivo Premium Pass
              </span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {currentUser.isPremiumPass ? 'Active (Ad-Free)' : 'Standard Plan'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {currentUser.isPremiumPass
                ? 'Algorithmic auto-matching active & all sponsor banners removed.'
                : 'Upgrade to remove ads and unlock automated mutual partner matching.'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {!currentUser.isPremiumPass ? (
              <button
                onClick={() => setIsPremiumModalOpen(true)}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Get Premium Pass (PKR 300/mo)
              </button>
            ) : (
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                Renews next month
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Guide: How Payments & Payouts Work in Pakistan */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                How Receiving Payments & Payouts Works
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transparent local settlement via Easypaisa and JazzCash.
              </p>
            </div>
          </div>

          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setGuideRole('tutor')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                guideRole === 'tutor'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              For Instructors (Tutors)
            </button>
            <button
              onClick={() => setGuideRole('owner')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                guideRole === 'owner'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              For Platform Owner (You)
            </button>
          </div>
        </div>

        {guideRole === 'tutor' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Step 1
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Offer Micro-Tutoring Sessions
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Set your session rate in PKR (e.g. PKR 500 – 1,000/hr) in your profile or skill offerings under <strong>Teach & Earn</strong> mode.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Step 2
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Instant Credit to Your Wallet
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                When students complete a paid session via Easypaisa or JazzCash, the funds credit directly to your <strong>HUNARIVO Balance</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Step 3
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Withdraw Directly to Your SIM
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Click <strong>"Withdraw to JazzCash / Easypaisa"</strong> above, enter your phone number, and receive payout into your personal mobile wallet.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Option A Active Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-indigo-50 dark:from-emerald-950/40 dark:to-indigo-950/40 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white">
                    Selected Rail: Option A Active
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Direct Easypaisa & JazzCash Mobile Wallet Transfer (0% Gateway Fees)
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  When new members join (PKR 200) or buy Premium Pass (PKR 300), funds transfer directly into these accounts with zero fees.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditAccountsForm(receivingAccounts);
                  setIsEditingAccounts(true);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 shadow-sm transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Receiving Accounts</span>
              </button>
            </div>

            {/* Configured Accounts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Easypaisa */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center">EP</div>
                      Easypaisa Mobile Wallet
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">Active</span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block text-[11px]">
                    Mobile Account Number:
                  </span>
                  <span className="text-base font-mono font-bold text-slate-900 dark:text-white block mt-0.5">
                    {receivingAccounts.easypaisaNumber}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
                    Account Title: <strong className="text-slate-700 dark:text-slate-200">{receivingAccounts.easypaisaTitle}</strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(receivingAccounts.easypaisaNumber, 'easypaisa')}
                  className="mt-4 w-full py-2 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  {copiedField === 'easypaisa' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-semibold">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Easypaisa Number</span>
                    </>
                  )}
                </button>
              </div>

              {/* JazzCash */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded bg-red-600 text-white font-bold text-[10px] flex items-center justify-center">JC</div>
                      JazzCash Wallet
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">Active</span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block text-[11px]">
                    Mobile Account Number:
                  </span>
                  <span className="text-base font-mono font-bold text-slate-900 dark:text-white block mt-0.5">
                    {receivingAccounts.jazzcashNumber}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
                    Account Title: <strong className="text-slate-700 dark:text-slate-200">{receivingAccounts.jazzcashTitle}</strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(receivingAccounts.jazzcashNumber, 'jazzcash')}
                  className="mt-4 w-full py-2 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  {copiedField === 'jazzcash' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-semibold">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy JazzCash Number</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transaction & Receipt Log */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Official Payment & Receipt History
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verifiable transactions processed through Easypaisa and JazzCash.
            </p>
          </div>
        </div>

        {paymentHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Transaction Ref</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Local Rail</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {paymentHistory.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-white">
                      {rec.referenceId}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {rec.receiptNote || rec.type}
                    </td>
                    <td className="py-3 px-4">
                      <span className="uppercase text-[11px] font-bold tracking-wider text-slate-700 dark:text-slate-300">
                        {rec.method}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                      PKR {rec.amountPKR.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono">
                      {rec.timestamp}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedReceipt(rec)}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium inline-flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-500">
            No transactions recorded yet.
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Withdraw Earnings to Mobile Wallet
            </h3>
            <p className="text-xs text-slate-500">
              Transfer your tutoring revenue directly to your Pakistan mobile account.
            </p>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Select Payout Channel
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawMethod('easypaisa')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold ${
                      withdrawMethod === 'easypaisa'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    Easypaisa
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawMethod('jazzcash')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold ${
                      withdrawMethod === 'jazzcash'
                        ? 'border-red-600 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    JazzCash
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Registered Mobile Account Number
                </label>
                <input
                  type="text"
                  required
                  value={withdrawAccount}
                  onChange={e => setWithdrawAccount(e.target.value)}
                  placeholder="03XXXXXXXXX"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Amount in PKR (Max: PKR {currentUser.walletBalancePKR})
                </label>
                <input
                  type="number"
                  required
                  min={100}
                  max={currentUser.walletBalancePKR}
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWithdrawModalOpen(false)}
                  className="w-1/2 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingWithdraw || withdrawSuccess}
                  className="w-1/2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  {isProcessingWithdraw ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : withdrawSuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Transferred!</span>
                    </>
                  ) : (
                    <span>Confirm Payout</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              HUNARIVO Official Receipt
            </h3>
            <p className="text-xs text-slate-500">
              Verified on Pakistan Interbank Settlement Rail
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-left text-xs space-y-2 border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Ref Code:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {selectedReceipt.referenceId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Type:</span>
                <span className="font-semibold">{selectedReceipt.receiptNote}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Rail / Gateway:</span>
                <span className="uppercase font-mono">{selectedReceipt.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="font-mono font-bold text-emerald-600">
                  PKR {selectedReceipt.amountPKR.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span className="font-mono">{selectedReceipt.timestamp}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedReceipt(null)}
              className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}

      {/* Edit Receiving Accounts Modal (Option A Setup) */}
      {isEditingAccounts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Customize Your Receiving Accounts
                  </h3>
                  <p className="text-xs text-slate-500">
                    Set your own Easypaisa or JazzCash details to receive user payments directly.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveAccounts} className="space-y-4">
              {/* Easypaisa */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">
                  Easypaisa Mobile Wallet Account
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      Easypaisa Mobile Number
                    </label>
                    <input
                      type="text"
                      required
                      value={editAccountsForm.easypaisaNumber}
                      onChange={e => setEditAccountsForm(prev => ({ ...prev, easypaisaNumber: e.target.value }))}
                      placeholder="03XXXXXXXXX"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      Easypaisa Account Title
                    </label>
                    <input
                      type="text"
                      required
                      value={editAccountsForm.easypaisaTitle}
                      onChange={e => setEditAccountsForm(prev => ({ ...prev, easypaisaTitle: e.target.value }))}
                      placeholder="e.g. HUNARIVO Platform"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* JazzCash */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <span className="text-xs font-bold text-red-700 dark:text-red-400 block">
                  JazzCash Mobile Wallet Account
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      JazzCash Mobile Number
                    </label>
                    <input
                      type="text"
                      required
                      value={editAccountsForm.jazzcashNumber}
                      onChange={e => setEditAccountsForm(prev => ({ ...prev, jazzcashNumber: e.target.value }))}
                      placeholder="03XXXXXXXXX"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      JazzCash Account Title
                    </label>
                    <input
                      type="text"
                      required
                      value={editAccountsForm.jazzcashTitle}
                      onChange={e => setEditAccountsForm(prev => ({ ...prev, jazzcashTitle: e.target.value }))}
                      placeholder="e.g. HUNARIVO Platform"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingAccounts(false)}
                  className="w-1/2 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Official Accounts</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
