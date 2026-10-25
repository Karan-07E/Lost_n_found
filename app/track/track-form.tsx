'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  CheckCircle,
  Loader2,
  AlertCircle,
  MapPin,
  Calendar,
  Tag,
  Sparkles,
  ArrowRight,
  Handshake,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';
import { formatDate } from '@/lib/format';

const STATUS_STEPS = [
  { key: 'SUBMITTED', label: 'Report Submitted', desc: 'Your report has been received.' },
  { key: 'UNDER_REVIEW', label: 'Under Review', desc: 'System is checking for potential matches.' },
  { key: 'MATCHED', label: 'Potential Match', desc: 'A match has been identified or confirmed.' },
  { key: 'VERIFICATION', label: 'Verification', desc: 'Physical handover and OTP verification.' },
  { key: 'RETURNED', label: 'Returned', desc: 'Item successfully returned to owner.' },
];

const STATUS_ORDER = STATUS_STEPS.map((s) => s.key);

type Report = {
  id: string;
  reportId: string;
  reportType: 'LOST' | 'FOUND';
  title: string;
  category: string;
  location: string;
  specificLocation?: string | null;
  eventDate: string;
  status: string;
  createdAt: string;
};

type MatchItem = {
  matchId: string;
  score: number;
  matchStatus: string;
  targetReport: {
    id: string;
    reportId: string;
    title: string;
    description: string;
    category: string;
    location: string;
    eventDate: string;
    imagePath?: string | null;
    status: string;
  };
  existingRecoveryCase?: {
    id: string;
    caseNumber: string;
    status: string;
  } | null;
};

export function TrackForm() {
  const router = useRouter();
  const [reportId, setReportId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [confirmingMatchId, setConfirmingMatchId] = useState<string | null>(null);
  const [contactVerification, setContactVerification] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = reportId.trim().toUpperCase();
    if (!id) {
      setError('Please enter your Report ID.');
      return;
    }
    setLoading(true);
    setError('');
    setReport(null);
    setMatches([]);
    setConfirmingMatchId(null);

    try {
      const res = await fetch(`/api/reports/${encodeURIComponent(id)}`);
      if (res.status === 404) {
        setError(`No report found with ID "${id}". Please check the ID and try again.`);
        return;
      }
      if (!res.ok) throw new Error('Lookup failed');
      const data = await res.json();
      setReport(data.data);

      // Fetch potential matches
      try {
        const matchRes = await fetch(`/api/reports/${encodeURIComponent(id)}/matches`);
        if (matchRes.ok) {
          const matchJson = await matchRes.json();
          setMatches(matchJson.data?.matches || []);
        }
      } catch (me) {
        console.warn('Could not fetch matches:', me);
      }
    } catch {
      setError("We couldn't look up your report right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmMatch = async (match: MatchItem) => {
    if (!contactVerification.trim()) {
      setConfirmError('Please enter your contact phone or USN to verify ownership before confirming.');
      return;
    }

    setConfirmError('');
    try {
      const res = await fetch('/api/recovery/confirm-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lostReportId: report?.reportType === 'LOST' ? report.id : match.targetReport.id,
          foundReportId: report?.reportType === 'FOUND' ? report.id : match.targetReport.id,
          matchId: match.matchId,
          actorRole: 'OWNER',
          contactVerification: contactVerification.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to confirm match');

      router.push(`/recovery/${json.data.caseId}`);
    } catch (err: any) {
      setConfirmError(err.message);
    }
  };

  const currentStatusIndex = report ? STATUS_ORDER.indexOf(report.status) : -1;

  return (
    <div className="space-y-6">
      {/* Search form */}
      <form onSubmit={handleTrack} className="bg-white border border-border rounded-xl p-6 shadow-2xs">
        <label htmlFor="report-id" className="form-label text-base font-semibold">Report ID</label>
        <div className="flex gap-3 mt-1">
          <input
            id="report-id"
            type="text"
            value={reportId}
            onChange={(e) => { setReportId(e.target.value); setError(''); }}
            placeholder="e.g. LF-2026-00007"
            className="form-input flex-1 font-mono uppercase"
            aria-describedby={error ? 'track-error' : undefined}
          />
          <Button type="submit" disabled={loading} className="gap-2 shrink-0">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {loading ? 'Checking...' : 'Check Status'}
          </Button>
        </div>
        {error && (
          <p id="track-error" className="form-error mt-2 text-rose-600 text-xs flex items-center gap-1.5" role="alert">
            <AlertCircle className="h-3.5 w-3.5" /> {error}
          </p>
        )}
        <p className="form-hint mt-2 text-xs text-muted-foreground">
          Enter the unique Report ID generated when your item was submitted (e.g. LF-2026-00007).
        </p>
      </form>

      {/* Results */}
      {report && (
        <div className="bg-white border border-border rounded-xl overflow-hidden shadow-xs">
          {/* Header */}
          <div className="bg-primary/5 border-b border-border px-6 py-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground font-mono">{report.reportId}</p>
              <h2 className="text-lg font-bold text-foreground mt-0.5">{report.title}</h2>
              <p className="text-sm text-muted-foreground">
                {report.reportType === 'LOST' ? 'Lost Item Report' : 'Found Item Report'}
              </p>
            </div>
            <StatusBadge status={report.status} />
          </div>

          {/* Quick details */}
          <div className="px-6 py-4 border-b border-border grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-2">
              <Tag className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="text-sm font-medium text-foreground">{report.category}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm font-medium text-foreground">
                  {report.location}
                  {report.specificLocation ? ` • ${report.specificLocation}` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium text-foreground">{formatDate(report.eventDate)}</p>
              </div>
            </div>
          </div>

          {/* Progress tracker */}
          <div className="px-6 py-5 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-5">Progress</p>
            <div className="space-y-0">
              {STATUS_STEPS.map((step, i) => {
                const isComplete = i <= currentStatusIndex;
                const isCurrent = i === currentStatusIndex;
                const isLast = i === STATUS_STEPS.length - 1;

                return (
                  <div key={step.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 shrink-0 ${
                        isComplete
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'bg-background border-border text-muted-foreground'
                      }`}>
                        {isComplete ? (
                          <CheckCircle className="h-3.5 w-3.5" />
                        ) : (
                          <span className="text-xs font-semibold">{i + 1}</span>
                        )}
                      </div>
                      {!isLast && <div className={`w-0.5 flex-1 my-1 ${isComplete ? 'bg-primary' : 'bg-border'}`} style={{ minHeight: '20px' }} />}
                    </div>

                    <div className="pb-4">
                      <p className={`text-sm font-semibold ${isComplete ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.label}
                        {isCurrent && <span className="ml-2 text-xs font-normal text-primary">← Current</span>}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AUTOMATED MATCHES & RECOVERY SECTION */}
          {matches.length > 0 && (
            <div className="px-6 py-6 bg-blue-50/40 border-b border-border">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-foreground">
                  Potential Matches ({matches.length})
                </h3>
              </div>

              <div className="space-y-4">
                {matches.map((m) => (
                  <div key={m.matchId} className="bg-white border border-border rounded-xl p-5 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            {m.score}% Match Score
                          </span>
                          <span className="text-xs font-mono text-muted-foreground">{m.targetReport.reportId}</span>
                        </div>
                        <h4 className="font-bold text-sm text-foreground mt-1.5">{m.targetReport.title}</h4>
                      </div>

                      {m.existingRecoveryCase ? (
                        <Link
                          href={`/recovery/${m.existingRecoveryCase.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-2xs shrink-0"
                        >
                          <Handshake className="h-4 w-4" /> Open Handover Portal ({m.existingRecoveryCase.caseNumber})
                        </Link>
                      ) : (
                        report.reportType === 'LOST' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setConfirmingMatchId(confirmingMatchId === m.matchId ? null : m.matchId);
                              setConfirmError('');
                            }}
                            className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold shrink-0"
                          >
                            <Handshake className="h-4 w-4 mr-1.5" />
                            {confirmingMatchId === m.matchId ? 'Cancel' : 'Confirm This Is My Item'}
                          </Button>
                        )
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mt-2.5 line-clamp-2">
                      {m.targetReport.description}
                    </p>

                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Location: <strong>{m.targetReport.location}</strong></span>
                      <span>Date: <strong>{formatDate(m.targetReport.eventDate)}</strong></span>
                    </div>

                    {/* Confirmation Input Card */}
                    {confirmingMatchId === m.matchId && (
                      <div className="mt-4 pt-4 border-t border-dashed border-blue-200 bg-blue-50/60 p-4 rounded-lg space-y-3 animate-in fade-in duration-150">
                        <div className="text-xs font-semibold text-blue-900">
                          Verify Your Identity to Confirm Match &amp; Initiate Handover:
                        </div>
                        <input
                          type="text"
                          value={contactVerification}
                          onChange={(e) => setContactVerification(e.target.value)}
                          placeholder="Enter your USN or phone number used in the lost report"
                          className="w-full px-3 py-2 text-xs rounded-md border border-blue-200 bg-white"
                        />
                        {confirmError && (
                          <p className="text-xs text-rose-600 font-medium">{confirmError}</p>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleConfirmMatch(m)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                        >
                          Establish Verified Handover Case →
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action */}
          {report.reportType === 'FOUND' && report.status !== 'RETURNED' && (
            <div className="px-6 py-5">
              <Link href={`/items/${report.id}`} className="block">
                <Button variant="outline" className="w-full gap-2">
                  View Full Item Details
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
