'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, AlertCircle, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DEPARTMENTS } from '@/lib/constants';

type Props = {
  foundReportId: string;
  foundReportTitle: string;
};

export function ClaimForm({ foundReportId, foundReportTitle }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [form, setForm] = useState({
    claimantName: '',
    claimantUsn: '',
    claimantDept: '',
    claimantContact: '',
    claimantEmail: '',
    ownershipEvidence: '',
    additionalInfo: '',
    lostReportId: '', // optional, link to their lost report
  });

  const set = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.claimantName.trim()) errs.claimantName = 'Your name is required.';
    if (!form.claimantUsn.trim()) errs.claimantUsn = 'USN is required.';
    else if (!/^\d[a-zA-Z]{2}\d{2}[a-zA-Z]{2}\d{3}$/i.test(form.claimantUsn.trim())) {
      errs.claimantUsn = 'Please enter your USN in the format 4VV23CS001.';
    }
    if (!form.claimantContact.trim()) errs.claimantContact = 'Contact number is required.';
    else if (!/^[6-9]\d{9}$/.test(form.claimantContact.trim())) {
      errs.claimantContact = 'Please enter a valid 10-digit Indian mobile number.';
    }
    if (!form.ownershipEvidence.trim() || form.ownershipEvidence.trim().length < 10) {
      errs.ownershipEvidence = 'Please provide at least 10 characters of ownership evidence.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, foundReportId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit claim');
      router.push(`/claim/status?claimId=${data.data.claimId}`);
    } catch (err: any) {
      setSubmitError(err.message || 'We couldn\'t submit your claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Your Info */}
      <div className="bg-white border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Your Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name *" id="c-name" error={errors.claimantName}>
            <input id="c-name" type="text" className="form-input" placeholder="Your full name"
              value={form.claimantName} onChange={(e) => set('claimantName', e.target.value)} />
          </Field>
          <Field label="USN *" id="c-usn" error={errors.claimantUsn} hint="Format: 4VV23CS001">
            <input id="c-usn" type="text" className="form-input" placeholder="4VV23CS001"
              value={form.claimantUsn} onChange={(e) => set('claimantUsn', e.target.value.toUpperCase())}
              maxLength={10} />
          </Field>
          <Field label="Department" id="c-dept">
            <select id="c-dept" className="form-input"
              value={form.claimantDept} onChange={(e) => set('claimantDept', e.target.value)}>
              <option value="">Select department</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Mobile Number *" id="c-contact" error={errors.claimantContact}>
            <input id="c-contact" type="tel" className="form-input" placeholder="9876543210"
              value={form.claimantContact} onChange={(e) => set('claimantContact', e.target.value)}
              maxLength={10} />
          </Field>
          <Field label="Email" id="c-email" hint="Optional" className="sm:col-span-2">
            <input id="c-email" type="email" className="form-input" placeholder="you@example.com"
              value={form.claimantEmail} onChange={(e) => set('claimantEmail', e.target.value)} />
          </Field>
        </div>
      </div>

      {/* Ownership Evidence */}
      <div className="bg-white border border-border rounded-xl p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-foreground">Ownership Evidence</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Describe details about this item that only its owner would know.
          </p>
        </div>

        <div className="flex gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            Do NOT include your full name, phone number, or other personal information here. Describe
            the item itself — unique features, saved names in contacts, stickers, engraving, etc.
          </p>
        </div>

        <Field label="Describe a unique feature of this item *" id="c-evidence" error={errors.ownershipEvidence}
          hint="e.g. My phone has a cracked corner, the lock screen shows a dog photo, there's a '21CSB105' sticker on the back">
          <textarea id="c-evidence" className="form-input" rows={4}
            placeholder="Describe specific details that prove this item is yours..."
            value={form.ownershipEvidence} onChange={(e) => set('ownershipEvidence', e.target.value)} />
        </Field>

        <Field label="Lost Item Report ID" id="c-lost-id" hint="Optional — if you submitted a Lost report, enter its ID here">
          <input id="c-lost-id" type="text" className="form-input font-mono" placeholder="LF-2026-00001"
            value={form.lostReportId} onChange={(e) => set('lostReportId', e.target.value.toUpperCase())} />
        </Field>

        <Field label="Any additional information" id="c-additional" hint="Optional">
          <textarea id="c-additional" className="form-input" rows={2}
            placeholder="Anything else you'd like to add..."
            value={form.additionalInfo} onChange={(e) => set('additionalInfo', e.target.value)} />
        </Field>
      </div>

      {submitError && (
        <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm" role="alert">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          {submitError}
        </div>
      )}

      <Button type="submit" disabled={submitting} size="lg" className="w-full gap-2">
        {submitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Submitting Claim...</>
        ) : (
          <><CheckCircle className="h-4 w-4" /> Submit Claim</>
        )}
      </Button>
    </form>
  );
}

function Field({
  label, id, error, hint, children, className,
}: {
  label: string; id: string; error?: string; hint?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="form-label">{label}</label>
      {children}
      {hint && <p className="form-hint">{hint}</p>}
      {error && (
        <p className="form-error" role="alert">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
}
