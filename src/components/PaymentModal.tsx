import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethod, PaymentRecord } from '../types';
import { ShieldCheck, CheckCircle2, Loader2, ArrowRight, X, Phone, Building, Sparkles, KeyRound, Clock, Copy, Check } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'reg_fee' | 'premium_pass' | 'session_fee';
  amountPKR: number;
  title: string;
  description: string;
  onSuccess?: (record: PaymentRecord) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  type,
  amountPKR,
  title,
  description,
  onSuccess,
}) => {
  const { processPayment, verifyTransactionId, receivingAccounts } = useApp();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('easypaisa');
  const [checkoutMode, setCheckoutMode] = useState<'transfer_tid' | 'instant_sim'>('transfer_tid');
  const [transactionId, setTransactionId] = useState('');
  const [accountNumber, setAccountNumber] = useState('03001234567');
  const [otpCode, setOtpCode] = useState('4920');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'details' | 'otp_verify' | 'authenticating' | 'success'>('details');
  const [completedRecord, setCompletedRecord] = useState<PaymentRecord | null>(null);

  if (!isOpen) return null;

  const handleCopyAccount = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyTid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) return;
    setIsProcessing(true);
    setPaymentStep('authenticating');

    setTimeout(async () => {
      const record = await verifyTransactionId(transactionId.trim(), selectedMethod);
      setCompletedRecord(record);
      setIsProcessing(false);
      setPaymentStep('success');
      if (onSuccess) {
        onSuccess(record);
      }
    }, 1400);
  };

  const handleInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentStep('otp_verify');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentStep('authenticating');

    const identifier = accountNumber;

    // Simulate real-time payment authentication on Pakistan local payment rail
    setTimeout(async () => {
      const record = await processPayment(
        type,
        amountPKR,
        selectedMethod,
        identifier,
        type === 'reg_fee' ? 'Hunarivo Verified Member Registration Fee' : 'Hunarivo Premium Pass Access'
      );
      setCompletedRecord(record);
      setIsProcessing(false);
      setPaymentStep('success');

      if (onSuccess) {
        onSuccess(record);
      }
    }, 1500);
  };

  const handleFinish = () => {
    setPaymentStep('details');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 overflow-hidden">
        {/* Close Button */}
        {paymentStep !== 'authenticating' && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {paymentStep === 'details' && (
          <div>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Local Payment Checkout</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {description}
              </p>
            </div>

            {/* Price Box */}
            <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Total Due</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                  PKR {amountPKR.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 rounded px-2 py-0.5">
                  Instant Verification
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">No hidden fees</span>
              </div>
            </div>

            {/* Pakistan Local Methods Selector: Easypaisa & JazzCash */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                Select Pakistan Payment Rail
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Easypaisa */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('easypaisa')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedMethod === 'easypaisa'
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-600'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white font-bold flex items-center justify-center text-xs mx-auto mb-1">
                    EP
                  </div>
                  <span className="text-xs font-semibold block">Easypaisa</span>
                  <span className="text-[10px] text-slate-400 block">Mobile Wallet</span>
                </button>

                {/* JazzCash */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('jazzcash')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedMethod === 'jazzcash'
                      ? 'border-red-600 bg-red-50/50 dark:bg-red-950/40 text-red-900 dark:text-red-200 ring-1 ring-red-600'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-red-600 text-white font-bold flex items-center justify-center text-xs mx-auto mb-1">
                    JC
                  </div>
                  <span className="text-xs font-semibold block">JazzCash</span>
                  <span className="text-[10px] text-slate-400 block">USSD / App</span>
                </button>
              </div>
            </div>

            {/* Checkout Mode Selector */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => setCheckoutMode('transfer_tid')}
                className={`w-1/2 py-2 text-xs font-semibold rounded-lg transition-all ${
                  checkoutMode === 'transfer_tid'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                ⚡ Option A: Direct Transfer (0% Fee)
              </button>
              <button
                type="button"
                onClick={() => setCheckoutMode('instant_sim')}
                className={`w-1/2 py-2 text-xs font-semibold rounded-lg transition-all ${
                  checkoutMode === 'instant_sim'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                📱 Mobile Debit (MPIN Push)
              </button>
            </div>

            {/* Option A: Direct Transfer to Owner Account + TID Verification */}
            {checkoutMode === 'transfer_tid' ? (
              <form onSubmit={handleVerifyTid} className="space-y-4">
                {/* Destination Account Card */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Send PKR {amountPKR.toLocaleString()} to Official Account:
                    </span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      {selectedMethod}
                    </span>
                  </div>

                  {selectedMethod === 'easypaisa' && (
                    <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Easypaisa Mobile Account:</span>
                        <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                          {receivingAccounts.easypaisaNumber}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Title: {receivingAccounts.easypaisaTitle}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyAccount(receivingAccounts.easypaisaNumber)}
                        className="px-2.5 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 rounded-md hover:bg-slate-200 flex items-center gap-1"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}

                  {selectedMethod === 'jazzcash' && (
                    <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div>
                        <span className="text-[10px] text-slate-400 block">JazzCash Mobile Account:</span>
                        <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                          {receivingAccounts.jazzcashNumber}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Title: {receivingAccounts.jazzcashTitle}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyAccount(receivingAccounts.jazzcashNumber)}
                        className="px-2.5 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 rounded-md hover:bg-slate-200 flex items-center gap-1"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* TID Input */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Enter Transaction Reference ID (TID):
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={e => setTransactionId(e.target.value)}
                    placeholder="e.g. 10928374615 or EP-892410-PK"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Found in your bank app payment confirmation or SMS receipt from {selectedMethod.toUpperCase()}.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !transactionId.trim()}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify TID & Settle PKR {amountPKR.toLocaleString()}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleInitiate}>
                <div className="mb-6">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
                    {selectedMethod === 'easypaisa' ? 'Easypaisa Mobile Account Number' : 'JazzCash Mobile Account Number'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={accountNumber}
                      onChange={e => setAccountNumber(e.target.value)}
                      placeholder="03XXXXXXXXX"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Proceed to MPIN Authorization</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </form>
            )}
          </div>
        )}

        {paymentStep === 'otp_verify' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Authorize Payment of PKR {amountPKR.toLocaleString()}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                A verification request has been dispatched to <strong>{accountNumber}</strong> via <strong>{selectedMethod.toUpperCase()}</strong>.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-center">
                  Enter 4-Digit MPIN / OTP to Confirm:
                </label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value)}
                  placeholder="4920"
                  className="w-full text-center tracking-widest text-2xl font-mono px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[11px] text-slate-400 block text-center mt-1">
                  Simulated test MPIN pre-filled. Enter any 4 digits to authorize.
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5" /> Prompt active (01:50)
                </span>
                <button
                  type="button"
                  onClick={() => setPaymentStep('details')}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Change Account Number
                </button>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Confirm MPIN & Settle PKR {amountPKR.toLocaleString()}</span>
              </button>
            </form>
          </div>
        )}

        {paymentStep === 'authenticating' && (
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-4 animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Connecting to {selectedMethod === 'easypaisa' ? 'Easypaisa Gateway' : 'JazzCash Gateway'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-2">
              Please wait while your transaction is authenticated on Pakistan interbank payment infrastructure...
            </p>
          </div>
        )}

        {paymentStep === 'success' && completedRecord && (
          <div className="py-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Payment Successful!
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {type === 'reg_fee'
                ? 'Your one-time PKR 200 registration fee has been confirmed. Welcome to HUNARIVO!'
                : 'Your Hunarivo Premium Pass has been activated with Auto-Matching and Ad-Free experience!'}
            </p>

            {/* Digital Receipt Card */}
            <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-left">
              <div className="flex justify-between items-center text-xs py-1 border-b border-slate-200 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400">Transaction Ref:</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {completedRecord.referenceId}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-b border-slate-200 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400">Payment Rail:</span>
                <span className="font-medium uppercase text-slate-900 dark:text-white">
                  {completedRecord.method}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-b border-slate-200 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400">Amount Paid:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  PKR {completedRecord.amountPKR.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs py-1">
                <span className="text-slate-500 dark:text-slate-400">Timestamp:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {completedRecord.timestamp}
                </span>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="mt-6 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
            >
              Continue to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
