'use client';

import { useState } from 'react';
import { Search, CheckCircle, Loader2, AlertCircle, MapPin, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';
import { formatDate, formatDateTime } from '@/lib/format';

const STATUS_STEPS = [
  { key: 'SUBMITTED', label: 'Report Submitted', desc: 'Your report has been received.' },
  { key: 'UNDER_REVIEW', label: 'Under Review', desc: 'Admin team is reviewing your report.' },
  { key: 'MATCHED', label: 'Potential Match', desc: 'A potential match has been identified.' },
  { key: 'VERIFICATION', label: 'Verification', desc: 'Ownership is being verified.' },
  { key: 'RETURNED', label: 'Returned', desc: 'Item has been returned to its owner.' },
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

export function TrackForm() {
  const [reportId, setReportId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState<Report | null>(null);

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

    try {
      const res = await fetch(`/api/reports/${encodeURIComponent(id)}`);
      if (res.status === 404) {
        setError(`No report found with ID "${id}". Please check the ID and try again.`);
        return;
      }
      if (!res.ok) throw new Error('Lookup failed');
      const data = await res.json();
      setReport(data.data);
    } catch {
      setError('We couldn\'t look up your report right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentStatusIndex = report ? STATUS_ORDER.indexOf(report.status) : -1;

  return (
    <div className="space-y-6">
      {/* Search form */}
      <form onSubmit={handleTrack} className="bg-white border border-border rounded-xl p-6">
        <label htmlFor="report-id" className="form-label text-base font-semibold">Report ID</label>
        <div className="flex gap-3 mt-1">
          <input
            id="report-id"
            type="text"
            value={reportId}
            onChange={(e) => { setReportId(e.target.value); setError(''); }}
            placeholder="e.g. LF-2026-00124"
            className="form-input flex-1 font-mono"
            aria-describedby={error ? 'track-error' : undefined}
          />
          <Button type="submit" disabled={loading} className="gap-2 shrink-0">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {loading ? 'Checking...' : 'Check Status'}
          </Button>
        </div>
        {error && (
          <p id="track-error" className="form-error mt-2" role="alert">
            <AlertCircle className="h-3 w-3" /> {error}
          </p>
        )}
        <p className="form-hint mt-2">
          Your Report ID was shown on the confirmation screen after submitting your report (e.g. LF-2026-00124).
        </p>
      </form>

      {/* Results */}
      {report && (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
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
          <div className="px-6 py-4 border-b border-border grid grid-cols-3 gap-4">
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
          <div className="px-6 py-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-5">Progress</p>
            <div className="space-y-0">
              {STATUS_STEPS.map((step, i) => {
                const isComplete = i <= currentStatusIndex;
                const isCurrent = i === currentStatusIndex;
                const isLast = i === STATUS_STEPS.length - 1;

                return (
                  <div key={step.key} className="flex gap-4">
                    {/* Connector */}
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

                    {/* Content */}
                    <div className={`pb-4 ${isLast ? '' : ''}`}>
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

          {/* Action */}
          {report.reportType === 'FOUND' && report.status !== 'RETURNED' && (
            <div className="px-6 pb-5">
              <Button variant="outline" className="w-full gap-2" onClick={() => window.location.href = `/items/${report.id}`}>
                View Full Item Details
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
