'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Calendar,
  KeyRound,
  UserCheck,
  Send,
  Loader2,
  FileCheck2,
  Lock,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format';

interface RecoveryViewProps {
  caseId: string;
  initialData: any;
}

export function RecoveryView({ caseId, initialData }: RecoveryViewProps) {
  const [data, setData] = useState(initialData);
  const [role, setRole] = useState<'OWNER' | 'FINDER'>('FINDER');
  const [contactInput, setContactInput] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [acknowledgmentChecked, setAcknowledgmentChecked] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const refreshCase = async () => {
    try {
      const res = await fetch(`/api/recovery/${caseId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (e) {
      console.error('Failed to refresh recovery case:', e);
    }
  };

  // Finder initiates handover verification (sends OTP to owner)
  const handleInitiateHandover = async () => {
    if (!contactInput.trim()) {
      setActionError('Please enter your contact number or email to verify your identity as the finder.');
      return;
    }
    setLoading(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await fetch(`/api/recovery/${caseId}/verify-handover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finderContact: contactInput.trim() }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to initiate handover');

      setActionSuccess(result.message);
      await refreshCase();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Finder enters the OTP provided in-person by the owner
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInput.trim()) {
      setActionError('Please enter your contact number to verify identity.');
      return;
    }
    if (otpCode.trim().length !== 6) {
      setActionError('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await fetch(`/api/recovery/${caseId}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finderContact: contactInput.trim(),
          code: otpCode.trim(),
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'OTP verification failed');

      setActionSuccess(result.message);
      setOtpCode('');
      await refreshCase();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Owner confirms physical receipt of the item
  const handleConfirmReceipt = async () => {
    if (!contactInput.trim()) {
      setActionError('Please enter your USN, phone number, or email to verify your identity as the owner.');
      return;
    }
    if (!acknowledgmentChecked) {
      setActionError('You must check the confirmation box acknowledging physical receipt of the item.');
      return;
    }

    setLoading(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await fetch(`/api/recovery/${caseId}/confirm-receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerContact: contactInput.trim(),
          acknowledgment: true,
          remarks: remarks.trim() || undefined,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to confirm receipt');

      setActionSuccess(result.message);
      await refreshCase();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Dispute submission
  const handleDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInput.trim()) {
      setActionError('Please enter your contact verification before reporting a dispute.');
      return;
    }
    if (!disputeReason.trim() || disputeReason.trim().length < 10) {
      setActionError('Please provide a detailed explanation of the issue (at least 10 characters).');
      return;
    }

    setLoading(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await fetch(`/api/recovery/${caseId}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorRole: role,
          contactVerification: contactInput.trim(),
          reason: disputeReason.trim(),
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to file dispute');

      setActionSuccess(result.message);
      setShowDisputeModal(false);
      setDisputeReason('');
      await refreshCase();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isOtpVerified = data.status === 'OTP_VERIFIED' || data.status === 'RECEIVED_CONFIRMED';
  const isCompleted = data.status === 'RECEIVED_CONFIRMED';
  const isDisputed = data.status === 'DISPUTED';

  const steps = [
    { title: 'Match Confirmed', done: true, current: data.status === 'MATCH_CONFIRMED' },
    { title: 'Handover & OTP', done: isOtpVerified, current: data.status === 'HANDOVER_PENDING' || data.status === 'OTP_SENT' },
    { title: 'Receipt Confirmed', done: isCompleted, current: data.status === 'OTP_VERIFIED' },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                {data.caseNumber}
              </span>
              <span className="text-xs text-muted-foreground">• Automated Recovery Case</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mt-2">
              Item Handover &amp; Return Portal
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Direct verification between item owner and finder without requiring campus administrator intervention.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
              isCompleted
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : isDisputed
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
              {data.status.replace(/_/g, ' ')}
            </span>

            <Button variant="ghost" size="sm" onClick={refreshCase} title="Refresh case status">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 2. Visual Stepper */}
        <div className="pt-6">
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {steps.map((st, idx) => (
              <div key={st.title} className="flex flex-col items-center text-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  st.done
                    ? 'bg-emerald-600 text-white'
                    : st.current
                    ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {st.done ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                </div>
                <span className={`text-xs mt-2 font-medium ${st.done || st.current ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {st.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Items Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Lost Item Summary */}
        <div className="bg-white border border-rose-100 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-rose-50">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Lost Item (Owner)
            </span>
            <span className="font-mono text-xs text-muted-foreground">{data.lostReport?.reportId}</span>
          </div>
          <div className="mt-3">
            <h3 className="font-bold text-base text-foreground">{data.lostReport?.title}</h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{data.lostReport?.description}</p>
            <div className="mt-3 pt-3 border-t border-dashed border-rose-100 flex items-center justify-between text-xs text-muted-foreground">
              <span>Owner: <strong className="text-foreground">{data.lostReport?.reporterName}</strong></span>
              <span>USN: {data.lostReport?.reporterUsn || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Found Item Summary */}
        <div className="bg-white border border-emerald-100 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-50">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Found Item (Finder)
            </span>
            <span className="font-mono text-xs text-muted-foreground">{data.foundReport?.reportId}</span>
          </div>
          <div className="mt-3">
            <h3 className="font-bold text-base text-foreground">{data.foundReport?.title}</h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{data.foundReport?.description}</p>
            <div className="mt-3 pt-3 border-t border-dashed border-emerald-100 flex items-center justify-between text-xs text-muted-foreground">
              <span>Finder: <strong className="text-foreground">{data.foundReport?.reporterName}</strong></span>
              <span>Location: {data.meetingLocation || 'Campus Desk'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Action Center / Recovery Workflow */}
      <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-xs">
        {/* Role Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-foreground">Interactive Handover Console</h2>
            <p className="text-xs text-muted-foreground">Select your role to access your authorized handover actions.</p>
          </div>

          <div className="flex rounded-lg bg-muted p-1 text-xs font-semibold shrink-0">
            <button
              type="button"
              onClick={() => { setRole('FINDER'); setActionError(''); setActionSuccess(''); }}
              className={`px-4 py-2 rounded-md transition-all ${
                role === 'FINDER' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              I am the Finder
            </button>
            <button
              type="button"
              onClick={() => { setRole('OWNER'); setActionError(''); setActionSuccess(''); }}
              className={`px-4 py-2 rounded-md transition-all ${
                role === 'OWNER' ? 'bg-white text-blue-800 shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              I am the Owner
            </button>
          </div>
        </div>

        {/* Identity Verification Prompt */}
        <div className="my-6 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
            {role === 'FINDER' ? 'Finder Identity Verification' : 'Owner Identity Verification'}
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={contactInput}
              onChange={(e) => setContactInput(e.target.value)}
              placeholder={role === 'FINDER' ? 'Enter phone number or email used when reporting found item' : 'Enter your USN or phone number registered with lost item report'}
              className="flex-1 px-3.5 py-2.5 rounded-lg border border-border text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-primary bg-white"
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5">
            Backend authorization validates this against the encrypted report records before executing actions.
          </p>
        </div>

        {/* Messages */}
        {actionError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-rose-600" />
            <span>{actionError}</span>
          </div>
        )}
        {actionSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* ROLE A: FINDER ACTIONS */}
        {role === 'FINDER' && (
          <div className="space-y-6">
            {!isOtpVerified && (
              <div className="border border-border rounded-xl p-5 bg-gradient-to-br from-emerald-50/50 to-white">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm text-foreground">Step 1: Initiate Handover Verification</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      When meeting the owner in-person, click <strong>"Verify Handover"</strong>. A secure 6-digit OTP will be dispatched to the owner&apos;s verified email address.
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <Button
                        type="button"
                        onClick={handleInitiateHandover}
                        disabled={loading || isCompleted}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2"
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        {data.status === 'OTP_SENT' ? 'Resend Verification Code' : 'Verify Handover'}
                      </Button>

                      {data.status === 'OTP_SENT' && (
                        <span className="text-xs text-amber-700 font-medium bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                          OTP Sent to owner • 5-min expiry
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* OTP Input Form */}
                {data.status === 'OTP_SENT' && (
                  <form onSubmit={handleVerifyOtp} className="mt-6 pt-5 border-t border-emerald-100">
                    <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-2">
                      Enter 6-digit Code provided by Owner
                    </h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Ask the owner for the code shown in their email. Enter it below to verify the handover.
                    </p>
                    <div className="flex gap-3 max-w-sm">
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="flex-1 px-4 py-2.5 rounded-lg border border-border text-center font-mono text-lg font-bold tracking-widest focus:ring-2 focus:ring-emerald-500 bg-white"
                      />
                      <Button type="submit" disabled={loading || otpCode.length !== 6} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Code'}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {isOtpVerified && !isCompleted && (
              <div className="border border-emerald-200 rounded-xl p-5 bg-emerald-50 text-emerald-900">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">Handover Verified!</h4>
                    <p className="text-xs mt-0.5">
                      The OTP has been validated. Hand the item to the owner. The owner must now click <strong>&quot;Confirm Item Received&quot;</strong> on their screen to complete the return.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isCompleted && (
              <div className="border border-emerald-200 rounded-xl p-5 bg-emerald-50 text-emerald-900 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-bold text-base">Recovery Case Successfully Completed!</h4>
                <p className="text-xs text-emerald-800 mt-1">
                  The owner has physically received and acknowledged the item. Both reports have been officially closed.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ROLE B: OWNER ACTIONS */}
        {role === 'OWNER' && (
          <div className="space-y-6">
            {!isOtpVerified && (
              <div className="border border-border rounded-xl p-5 bg-blue-50/50">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Waiting for In-Person Meeting</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Meet the finder at the designated campus location. When you meet, the finder will click <strong>&quot;Verify Handover&quot;</strong>, which will send a 6-digit code to your email (<code>{data.lostReport?.reporterEmailMasked}</code>).
                    </p>
                    <div className="mt-3 text-xs bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg font-medium">
                      ⚠️ <strong>Security rule:</strong> Do NOT share your code over phone or WhatsApp. Only tell the code in-person once you can physically see your item.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isOtpVerified && !isCompleted && (
              <div className="border-2 border-primary/30 rounded-xl p-6 bg-primary/5">
                <div className="flex items-start gap-3 mb-4">
                  <FileCheck2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-base text-foreground">Confirm Physical Possession</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Handover OTP has been verified. Once you have physically inspected and received your item, confirm below to complete the return.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-2 border-t border-primary/10">
                  <label className="flex items-start gap-3 p-3.5 rounded-lg bg-white border border-border cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="checkbox"
                      checked={acknowledgmentChecked}
                      onChange={(e) => setAcknowledgmentChecked(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded-sm border-gray-300 text-primary focus:ring-primary"
                    />
                    <div className="text-xs leading-normal">
                      <strong className="text-foreground block mb-0.5">Physical Receipt Acknowledgment</strong>
                      I explicitly acknowledge that I have physically received and inspected my item from the finder in good condition.
                    </div>
                  </label>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Optional Remarks / Thank you note:
                    </label>
                    <textarea
                      rows={2}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="e.g. Received calculator in perfect condition with thanks!"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary focus:outline-hidden"
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={handleConfirmReceipt}
                    disabled={loading || !acknowledgmentChecked}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2.5 text-sm"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Confirm Item Received
                  </Button>
                </div>
              </div>
            )}

            {isCompleted && (
              <div className="border border-emerald-200 rounded-xl p-5 bg-emerald-50 text-emerald-900 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-bold text-base">Receipt Successfully Confirmed!</h4>
                <p className="text-xs text-emerald-800 mt-1">
                  Thank you for confirming. Your lost item report is officially resolved.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Dispute Link */}
        {!isCompleted && !isDisputed && (
          <div className="mt-8 pt-6 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Encountering an issue or wrong item during handover?</span>
            <button
              type="button"
              onClick={() => setShowDisputeModal(true)}
              className="text-rose-600 hover:text-rose-700 font-semibold inline-flex items-center gap-1"
            >
              <AlertTriangle className="h-3.5 w-3.5" /> Report Handover Dispute
            </button>
          </div>
        )}
      </div>

      {/* 5. Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-bold text-base text-foreground">Report Handover Dispute</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              If the physical exchange failed or the item does not match, flag the issue below. The case will be halted and escalated to campus security desk.
            </p>

            <form onSubmit={handleDispute} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Verification Contact ({role === 'FINDER' ? 'Finder Phone' : 'Owner USN/Phone'}):
                </label>
                <input
                  type="text"
                  value={contactInput}
                  onChange={(e) => setContactInput(e.target.value)}
                  placeholder="Enter contact verification"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Reason for Dispute:</label>
                <textarea
                  rows={3}
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Describe why the exchange failed or what discrepancy was observed..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowDisputeModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-rose-600 hover:bg-rose-700 text-white">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Dispute'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Immutable Audit Trail */}
      <div className="bg-white border border-border rounded-xl p-6 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            Recovery Audit Trail &amp; Event History
          </h3>
          <span className="text-[11px] text-muted-foreground">Immutable Log</span>
        </div>

        <div className="mt-4 space-y-3">
          {(!data.auditTrail || data.auditTrail.length === 0) ? (
            <p className="text-xs text-muted-foreground py-2">No event records logged yet.</p>
          ) : (
            data.auditTrail.map((log: any) => (
              <div key={log.id} className="flex items-start justify-between text-xs py-2 border-b border-neutral-100 last:border-0">
                <div className="flex items-center gap-2.5">
                  <span className="font-semibold text-foreground px-2 py-0.5 rounded-md bg-neutral-100 text-[11px]">
                    {log.action}
                  </span>
                  <span className="text-muted-foreground text-[11px]">by {log.actorRole}</span>
                </div>
                <span className="text-neutral-400 font-mono text-[11px]">
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
