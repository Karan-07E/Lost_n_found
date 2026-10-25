'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  Sparkles,
  KeyRound,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  Search,
  AlertTriangle,
  HelpCircle,
  Eye,
  FileCheck,
  Clock,
  Mail,
  UserCheck,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type TabType = 'overview' | 'lost' | 'found' | 'security';

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  return (
    <div className="flex flex-col min-h-screen">
      {/* ─── HERO SECTION ────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-blue-50/60 via-white to-background border-b border-border py-12 sm:py-16">
        <div className="page-container text-center max-w-3xl mx-auto px-4">

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            How Campus Lost &amp; Found Works
          </h1>

          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A fast, secure, and admin-free campus recovery system. Report items in under 60 seconds, connect directly with finders, and verify handovers with single-use cryptographic email OTPs.
          </p>

          {/* Role Filter Tabs */}
          <div className="mt-8 inline-flex p-1.5 bg-neutral-100 rounded-xl border border-neutral-200 shadow-inner max-w-md w-full justify-center">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              System Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('lost')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'lost'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              I Lost an Item
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('found')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'found'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              I Found an Item
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'security'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Security &amp; OTP
            </button>
          </div>
        </div>
      </section>

      {/* ─── TAB 1: SYSTEM OVERVIEW ──────────────────────────────────── */}
      {activeTab === 'overview' && (
        <section className="py-12 bg-background">
          <div className="page-container max-w-5xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                The 4-Step Automated Recovery Journey
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                No bureaucratic delays. No waiting for physical office hours. Everything is verified directly on campus.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {/* Step 1 */}
              <div className="relative p-6 sm:p-7 rounded-2xl bg-white border border-border shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-3xl font-black text-neutral-200">01</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  1. Anonymous &amp; Fast Reporting
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Submit a report in 60 seconds without creating an account or memorizing passwords.
                </p>
                <ul className="space-y-2 text-xs sm:text-sm text-neutral-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Enter item details, campus location, date, and contact USN / phone / email.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Receive an instant unique Report ID (e.g. <code className="font-mono font-bold text-neutral-800">LF-2026-00008</code>) with an encrypted Access Token.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Public listings automatically mask private phone numbers and emails to stop spam.</span>
                  </li>
                </ul>
              </div>

              {/* Step 2 */}
              <div className="relative p-6 sm:p-7 rounded-2xl bg-white border border-border shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-3xl font-black text-neutral-200">02</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  2. Automated Smart Matching
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  The system scans existing reports and pairs potential lost items with found reports in real-time.
                </p>
                <ul className="space-y-2 text-xs sm:text-sm text-neutral-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Matching algorithm scores category overlap, campus zone proximity, and date closeness.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>View match confidence badges (e.g., <strong>85% High Match</strong>) on the Track Report portal.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>The verified owner clicks <em>"Confirm This Is My Item &amp; Start Handover"</em> to launch a secure case.</span>
                  </li>
                </ul>
              </div>

              {/* Step 3 */}
              <div className="relative p-6 sm:p-7 rounded-2xl bg-white border border-border shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-3xl font-black text-neutral-200">03</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  3. In-Person Email OTP Verification
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  When the finder and owner meet on campus, identity is cryptographically proven before the item changes hands.
                </p>
                <ul className="space-y-2 text-xs sm:text-sm text-neutral-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Finder clicks <em>"Verify Handover"</em> on the Recovery Console when meeting in person.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>A single-use 6-digit numeric OTP is immediately dispatched to the owner&apos;s verified email inbox (5-minute expiry).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Finder enters the OTP on their phone. Salted SHA-256 validation prevents unauthorized pickups.</span>
                  </li>
                </ul>
              </div>

              {/* Step 4 */}
              <div className="relative p-6 sm:p-7 rounded-2xl bg-white border border-border shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-3xl font-black text-neutral-200">04</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  4. Explicit Receipt &amp; Atomic Closure
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  OTP verification authorizes the exchange; the owner&apos;s physical receipt confirmation officially closes the case.
                </p>
                <ul className="space-y-2 text-xs sm:text-sm text-neutral-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Owner inspects their belonging and marks the mandatory physical receipt acknowledgment checkbox.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>An atomic database transaction switches both the Lost &amp; Found reports to <code className="text-emerald-700 bg-emerald-50 font-bold px-1.5 py-0.5 rounded">RETURNED</code>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Automated thank-you &amp; return confirmation emails are instantly delivered to both parties&apos; real inboxes.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Visual Process Flow Diagram */}
            <div className="mt-14 bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-xs">
              <h3 className="text-lg font-bold text-foreground text-center mb-6">
                System Workflow Pipeline
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                <div className="flex flex-col items-center p-4 rounded-xl bg-neutral-50 border border-neutral-200/80">
                  <span className="text-xs font-bold text-primary mb-1">PHASE 1</span>
                  <span className="text-sm font-bold text-neutral-800">Submit Report</span>
                  <span className="text-xs text-neutral-500 mt-1">Instant LF- ID &amp; private Access Token</span>
                </div>
                <div className="flex flex-col items-center p-4 rounded-xl bg-purple-50/60 border border-purple-200/60">
                  <span className="text-xs font-bold text-purple-700 mb-1">PHASE 2</span>
                  <span className="text-sm font-bold text-neutral-800">Smart Matching</span>
                  <span className="text-xs text-neutral-500 mt-1">Confidence score calculated automatically</span>
                </div>
                <div className="flex flex-col items-center p-4 rounded-xl bg-amber-50/60 border border-amber-200/60">
                  <span className="text-xs font-bold text-amber-700 mb-1">PHASE 3</span>
                  <span className="text-sm font-bold text-neutral-800">5-Min Email OTP</span>
                  <span className="text-xs text-neutral-500 mt-1">Sent to owner, verified by finder in person</span>
                </div>
                <div className="flex flex-col items-center p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/60">
                  <span className="text-xs font-bold text-emerald-700 mb-1">PHASE 4</span>
                  <span className="text-sm font-bold text-neutral-800">Atomic Return</span>
                  <span className="text-xs text-neutral-500 mt-1">Owner confirms receipt; reports marked RETURNED</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── TAB 2: I LOST AN ITEM ───────────────────────────────────── */}
      {activeTab === 'lost' && (
        <section className="py-12 bg-background animate-in fade-in-50 duration-200">
          <div className="page-container max-w-4xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
                For Students &amp; Faculty Who Lost an Item
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-3">
                How to Recover Your Lost Belonging
              </h2>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white border border-border shadow-xs flex flex-col sm:flex-row gap-5 items-start">
                <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">File a Lost Item Report</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Head to <Link href="/report/lost" className="text-primary font-semibold hover:underline">Report Lost</Link> and enter what you lost (brand, color, identifying marks), where you last had it (classroom, lab, canteen, hostel), and your contact details (USN, phone, email).
                  </p>
                  <div className="mt-3 text-xs bg-rose-50/60 text-rose-900 border border-rose-200 rounded-lg p-2.5">
                    <strong>Tip:</strong> Keep your Report ID (e.g. <code>LF-2026-00008</code>) safe. You can check status anytime on <Link href="/track" className="underline font-semibold">Track Report</Link>.
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-border shadow-xs flex flex-col sm:flex-row gap-5 items-start">
                <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Review Matches &amp; Start Handover</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Whenever a finder logs a matching item on campus, it shows up on your report&apos;s tracking page with a match score. If the photo or description matches, click <strong>&quot;Confirm This Is My Item &amp; Start Handover&quot;</strong>.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-border shadow-xs flex flex-col sm:flex-row gap-5 items-start">
                <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Meet the Finder &amp; Receive Your OTP</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Coordinate a safe, public campus meetup (such as the Central Library, Department Reception, or Canteen). When you meet, the finder triggers the OTP. Check your inbox, read the 6-digit code to the finder, and receive your item.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-border shadow-xs flex flex-col sm:flex-row gap-5 items-start">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Confirm Physical Receipt on Your Device</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Inspect your item carefully. Once you are satisfied, click <strong>&quot;Confirm Item Received&quot;</strong> on your recovery screen to finalize the return. You will immediately receive a return completion receipt in your email.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link href="/report/lost">
                <Button size="lg" className="bg-rose-600 hover:bg-rose-700 text-white font-semibold gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Report a Lost Item Now
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── TAB 3: I FOUND AN ITEM ──────────────────────────────────── */}
      {activeTab === 'found' && (
        <section className="py-12 bg-background animate-in fade-in-50 duration-200">
          <div className="page-container max-w-4xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                For Honest Finders &amp; Good Samaritans
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-3">
                How to Safely Return a Found Item
              </h2>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white border border-border shadow-xs flex flex-col sm:flex-row gap-5 items-start">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Log the Found Item</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Go to <Link href="/report/found" className="text-emerald-700 font-semibold hover:underline">Report Found</Link>. Upload a photo of the item, select where you found it on campus, and provide your contact information.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Your contact information will stay private from the general public.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-border shadow-xs flex flex-col sm:flex-row gap-5 items-start">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Wait for Owner Confirmation</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Our matching system immediately searches for matching lost reports. Once the genuine owner reviews your listing and confirms ownership, a Recovery Session is opened.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-border shadow-xs flex flex-col sm:flex-row gap-5 items-start">
                <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Meet on Campus &amp; Verify Owner via OTP</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Meet the claimant in a public campus area. Open your recovery link, click <strong>&quot;Verify Handover&quot;</strong> to send them an instant 6-digit OTP, and type the code they read to you into your screen.
                  </p>
                  <div className="mt-3 text-xs bg-amber-50/70 text-amber-900 border border-amber-200 rounded-lg p-2.5">
                    <strong>Zero Liability:</strong> The OTP proves you handed the item to the genuine person who submitted the lost report.
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-border shadow-xs flex flex-col sm:flex-row gap-5 items-start">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Hand Over &amp; Receive Appreciation</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Once the OTP is validated and the owner confirms receipt, both reports are closed and an automated acknowledgment email is sent to you thanking you for your campus citizenship!
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link href="/report/found">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Report a Found Item
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── TAB 4: SECURITY & OTP ───────────────────────────────────── */}
      {activeTab === 'security' && (
        <section className="py-12 bg-background animate-in fade-in-50 duration-200">
          <div className="page-container max-w-4xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                Security Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-3">
                How Your Safety &amp; Privacy Are Protected
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-border shadow-xs">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-foreground mb-2">Cryptographic Salted OTPs</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  OTPs are generated on the secure backend using cryptographically secure random integers (<code className="font-mono">crypto.randomInt</code>). They are hashed with a server salt using SHA-256 and compared using constant-time algorithms to prevent timing attacks.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-border shadow-xs">
                <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-foreground mb-2">5-Minute Expiry &amp; Rate Limits</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Each OTP expires in exactly 5 minutes. To prevent brute-force attacks, the system enforces a strict maximum of 5 verification attempts and a 60-second resend cooldown.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-border shadow-xs">
                <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-foreground mb-2">Public PII Data Masking</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Student phone numbers, USNs, and personal email addresses are never displayed in raw text on public search pages. Only verified participants in an active recovery case can access coordination details.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-border shadow-xs">
                <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center mb-3">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-foreground mb-2">Instant Dispute Escalation</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  If someone presents the wrong item, or if there is any dispute during meeting, either participant can immediately click <em>&quot;Report Dispute&quot;</em>. This freezes the recovery case instantly and alerts campus administrators.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── OLD VS NEW SYSTEM COMPARISON ────────────────────────────── */}
      <section className="py-12 bg-muted/40 border-t border-border">
        <div className="page-container max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">
            Why the New Automated Workflow?
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground text-center mb-8">
            Engineered to remove bureaucratic friction while enhancing verification accuracy.
          </p>

          <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
            <div className="grid grid-cols-2 bg-neutral-100/70 border-b border-border p-4 text-xs sm:text-sm font-bold">
              <div className="text-neutral-500">Traditional Campus Process</div>
              <div className="text-primary">New Automated Peer-to-Peer System</div>
            </div>
            <div className="divide-y divide-neutral-100 text-xs sm:text-sm">
              <div className="grid grid-cols-2 p-4 items-center">
                <div className="text-neutral-600">Manual paper forms and office queues</div>
                <div className="font-semibold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  60-second online reporting (no login needed)
                </div>
              </div>
              <div className="grid grid-cols-2 p-4 items-center">
                <div className="text-neutral-600">Manual staff inspection to pair items</div>
                <div className="font-semibold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Automated smart matching with confidence scores
                </div>
              </div>
              <div className="grid grid-cols-2 p-4 items-center">
                <div className="text-neutral-600">Waiting days for admin office approval</div>
                <div className="font-semibold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Direct on-campus handover anytime
                </div>
              </div>
              <div className="grid grid-cols-2 p-4 items-center">
                <div className="text-neutral-600">Unverified handovers with risk of impostors</div>
                <div className="font-semibold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  5-minute single-use email OTP verification
                </div>
              </div>
              <div className="grid grid-cols-2 p-4 items-center">
                <div className="text-neutral-600">Lost paperwork and missing receipts</div>
                <div className="font-semibold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Atomic database update + immutable audit log
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FREQUENTLY ASKED QUESTIONS ──────────────────────────────── */}
      <section className="py-14 bg-white border-t border-border">
        <div className="page-container max-w-3xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Have questions about the automated recovery workflow? Find quick answers below.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Do I need to create an account or sign in to report an item?',
                a: 'No! You do not need to register or remember a password. The portal is completely open to students, staff, and visitors. When you submit a report, you get a unique Report ID (e.g. LF-2026-00008) and an Access Token to manage your report securely.',
              },
              {
                q: 'Do I have to wait for college staff or admin approval to recover my item?',
                a: 'No! Routine recoveries are 100% automated and peer-to-peer. Once an owner confirms a match, they coordinate directly with the finder, verify in person using the 5-minute single-use email OTP, and confirm receipt immediately.',
              },
              {
                q: 'How does the single-use email OTP work during handover?',
                a: 'When the finder and owner meet on campus, the finder taps "Verify Handover" on their phone. Our secure server generates a 6-digit numeric OTP and emails it exclusively to the original owner\'s registered email address. The owner tells the finder the code in person to authorize the handover.',
              },
              {
                q: 'Does verifying the OTP automatically mark the item as returned?',
                a: 'No. The OTP proves physical presence and identity. After receiving the physical item, the owner must also inspect it and check the explicit acknowledgment box ("I have physically inspected and received my item") to atomically close the report.',
              },
              {
                q: 'What if someone turns up with the wrong item or there is a dispute?',
                a: 'Both participants have a "Report Handover Dispute" button on their recovery screen. Clicking this immediately halts the case, freezes the reports, and alerts campus security and administration for investigation.',
              },
              {
                q: 'Will both the finder and owner receive a confirmation email?',
                a: 'Yes! As soon as the owner confirms physical receipt of the item, automated confirmation and thank-you emails are immediately dispatched to both participants\' registered inboxes.',
              },
              {
                q: 'Is my personal phone number or email exposed publicly?',
                a: 'No. Public listings mask contact details. Your USN, phone, and email are never shown to random anonymous visitors.',
              },
            ].map(({ q, a }) => (
              <div
                key={q}
                className="p-5 rounded-xl border border-border/80 bg-neutral-50/40 hover:border-primary/40 transition-colors"
              >
                <h3 className="font-bold text-foreground text-sm flex items-start gap-2.5">
                  <span className="text-primary font-mono font-bold text-xs mt-0.5">Q.</span>
                  <span>{q}</span>
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed pl-5">
                  {a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── QUICK CTA BANNER ────────────────────────────────────────── */}
      <section className="bg-primary text-primary-foreground py-12 border-t border-primary/20">
        <div className="page-container text-center max-w-2xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to Find or Return an Item?
          </h2>
          <p className="text-primary-foreground/80 text-xs sm:text-sm mt-2 mb-6 max-w-lg mx-auto">
            Get started in seconds. No login required. Track real-time matches across the campus.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/report/lost">
              <Button
                variant="secondary"
                size="lg"
                className="font-bold text-xs sm:text-sm shadow-xs hover:bg-red-500"
              >
                Report Lost Item
              </Button>
            </Link>
            <Link href="/report/found">
              <Button
                variant="secondary"
                size="lg"
                className="font-bold text-xs sm:text-sm shadow-xs hover:bg-green-500"
              >
                Report Found Item
              </Button>
            </Link>
            <Link href="/track">
              <Button
                variant="secondary"
                size="lg"
                className="font-bold text-xs sm:text-sm shadow-xs hover:bg-yellow-500"
              >
                Track a Report
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
