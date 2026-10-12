'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, AlertCircle, Loader2, Search, RefreshCcw, Check, X, MoreHorizontal, Eye, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';
import { formatDateTime } from '@/lib/format';

type Report = {
  id: string;
  reportId: string;
  reportType: string;
  title: string;
  category: string;
  location: string;
  eventDate: string;
  reporterName: string;
  reporterContact: string;
  reporterUsn: string | null;
  status: string;
  createdAt: string;
};

type Claim = {
  id: string;
  claimId: string;
  foundReportId: string;
  claimantName: string;
  claimantUsn: string;
  claimantContact: string;
  ownershipEvidence: string;
  status: string;
  createdAt: string;
};

type Stats = {
  totalReports: number;
  lostReports: number;
  foundReports: number;
  pendingClaims: number;
  resolvedReports: number;
};

const REPORT_STATUSES = ['SUBMITTED', 'UNDER_REVIEW', 'MATCHED', 'VERIFICATION', 'RETURNED', 'CLOSED'];

export function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [tab, setTab] = useState<'reports' | 'claims'>('reports');

  const [stats, setStats] = useState<Stats | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const headers = { 'x-admin-password': password, 'Content-Type': 'application/json' };

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const res = await fetch('/api/admin/stats', { headers: { 'x-admin-password': password } });
    if (res.ok) {
      setAuthenticated(true);
      const data = await res.json();
      setStats(data.data);
    } else {
      setAuthError('Incorrect password. Please try again.');
    }
  };

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/reports?limit=50', { headers });
      const data = await res.json();
      setReports(data.data || []);
    } catch { setError('Failed to load reports'); }
    finally { setLoading(false); }
  }, [password]);

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/claims', { headers });
      const data = await res.json();
      setClaims(data.data || []);
    } catch { setError('Failed to load claims'); }
    finally { setLoading(false); }
  }, [password]);

  useEffect(() => {
    if (authenticated) {
      fetchReports();
      fetchClaims();
    }
  }, [authenticated, fetchReports, fetchClaims]);

  const updateReportStatus = async (id: string, status: string) => {
    await fetch(`/api/reports/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    });
    fetchReports();
  };

  const updateClaim = async (id: string, status: string) => {
    await fetch(`/api/claims/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    });
    fetchClaims();
  };

  // Login screen
  if (!authenticated) {
    return (
      <div className="section">
        <div className="page-container max-w-sm">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Admin Access</h1>
            <p className="text-muted-foreground text-sm mt-1">Enter the admin password to continue.</p>
          </div>
          <form onSubmit={login} className="bg-white border border-border rounded-xl p-6 space-y-4">
            <div>
              <label htmlFor="admin-pass" className="form-label">Password</label>
              <input id="admin-pass" type="password" className="form-input"
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password" autoFocus />
              {authError && (
                <p className="form-error mt-2" role="alert">
                  <AlertCircle className="h-3 w-3" /> {authError}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full gap-2">
              <Shield className="h-4 w-4" /> Access Dashboard
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="page-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage reports and claims</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => { fetchReports(); fetchClaims(); }} className="gap-2">
            <RefreshCcw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Total Reports', value: stats.totalReports },
              { label: 'Lost Reports', value: stats.lostReports },
              { label: 'Found Reports', value: stats.foundReports },
              { label: 'Pending Claims', value: stats.pendingClaims, highlight: true },
              { label: 'Resolved', value: stats.resolvedReports },
            ].map(({ label, value, highlight }) => (
              <div key={label} className={`rounded-xl border p-4 text-center ${highlight ? 'border-amber-200 bg-amber-50' : 'border-border bg-white'}`}>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-6">
          {(['reports', 'claims'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${
                tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}>
              {t === 'claims' ? `Claims ${claims.filter(c => c.status === 'PENDING').length > 0 ? `(${claims.filter(c => c.status === 'PENDING').length} pending)` : ''}` : 'Reports'}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-4 flex gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : tab === 'reports' ? (
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Report ID</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Item</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Reporter</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {reports.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No reports yet.</td></tr>
                  ) : reports.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs">{r.reportId}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{r.title}</p>
                        <p className="text-xs text-muted-foreground">{r.category} · {r.location}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.reportType === 'FOUND' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                          {r.reportType}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <p className="text-sm">{r.reporterName}</p>
                        <p className="text-xs text-muted-foreground">{r.reporterContact}</p>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <a href={`/items/${r.id}`} target="_blank" className="p-1.5 rounded hover:bg-muted transition-colors" title="View item">
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                          </a>
                          <select
                            className="text-xs border border-border rounded px-1.5 py-1 bg-background"
                            value={r.status}
                            onChange={(e) => updateReportStatus(r.id, e.target.value)}
                            aria-label="Change status"
                          >
                            {REPORT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.length === 0 ? (
              <div className="text-center py-16 bg-white border border-border rounded-xl">
                <p className="text-muted-foreground">No claims submitted yet.</p>
              </div>
            ) : claims.map((c) => (
              <div key={c.id} className="bg-white border border-border rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{c.claimId}</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="font-semibold text-foreground mt-1">{c.claimantName}</p>
                    <p className="text-sm text-muted-foreground">USN: {c.claimantUsn} · {c.claimantContact}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDateTime(c.createdAt)}</p>
                </div>

                <div className="bg-muted/50 rounded-lg p-3 mb-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Ownership Evidence:</p>
                  <p className="text-sm text-foreground">{c.ownershipEvidence}</p>
                </div>

                {c.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateClaim(c.id, 'APPROVED')} className="gap-1.5 bg-green-600 hover:bg-green-700">
                      <Check className="h-3.5 w-3.5" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateClaim(c.id, 'REJECTED')} className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10">
                      <X className="h-3.5 w-3.5" /> Reject
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateClaim(c.id, 'MORE_INFO_NEEDED')} className="gap-1.5">
                      More Info Needed
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
