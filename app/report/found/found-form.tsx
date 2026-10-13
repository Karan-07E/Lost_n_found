'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, ChevronRight, ChevronLeft, AlertCircle, Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS } from '@/lib/constants';
import { getLocalDateString, getThirtyDaysAgoString } from '@/lib/format';

type FormData = {
  category: string;
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  location: string;
  additionalDetails: string;
  reporterName: string;
  reporterContact: string;
  reporterEmail: string;
};

type Errors = Partial<Record<keyof FormData, string>>;

export function FoundReportForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState('');
  const [form, setForm] = useState<FormData>(() => ({
    category: '',
    title: '',
    description: '',
    eventDate: getLocalDateString(),
    eventTime: '',
    location: '',
    additionalDetails: '',
    reporterName: '',
    reporterContact: '',
    reporterEmail: '',
  }));

  const set = (field: keyof FormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  const validate = (): boolean => {
    const errs: Errors = {};
    const todayStr = getLocalDateString();
    const minDateStr = getThirtyDaysAgoString();

    if (!form.category) errs.category = 'Please select a category.';
    if (!form.title.trim()) errs.title = 'Item name is required.';
    if (!form.description.trim() || form.description.trim().length < 10) {
      errs.description = 'Please provide at least 10 characters of description.';
    }
    if (!form.eventDate) {
      errs.eventDate = 'Please select the date you found the item.';
    } else if (form.eventDate > todayStr) {
      errs.eventDate = 'Date cannot be in the future.';
    } else if (form.eventDate < minDateStr) {
      errs.eventDate = 'Date is invalid. Must be within the past 30 days.';
    }
    if (!form.location) errs.location = 'Please select the location where you found it.';
    if (!form.reporterName.trim()) errs.reporterName = 'Your name is required.';
    if (!form.reporterContact.trim()) errs.reporterContact = 'Contact number is required.';
    else if (!/^[6-9]\d{9}$/.test(form.reporterContact.trim())) {
      errs.reporterContact = 'Please enter a valid 10-digit Indian mobile number.';
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
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, reportType: 'FOUND' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      router.push(`/report/success?reportId=${data.data.reportId}&type=FOUND`);
    } catch (err: any) {
      setSubmitError(err.message || 'We couldn\'t submit your report right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Item Details */}
      <div className="bg-white border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Found Item Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Item Category *" error={errors.category} id="f-category">
            <select id="f-category" className="form-input"
              value={form.category} onChange={(e) => set('category', e.target.value)}>
              <option value="">Select category</option>
              {ITEM_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </FormField>

          <FormField label="Item Name *" error={errors.title} id="f-title">
            <input id="f-title" type="text" className="form-input" placeholder="e.g. Blue water bottle"
              value={form.title} onChange={(e) => set('title', e.target.value)} />
          </FormField>

          <FormField label="Date Found *" error={errors.eventDate} id="f-date" hint="Within past 30 days">
            <input id="f-date" type="date" className="form-input"
              value={form.eventDate} onChange={(e) => set('eventDate', e.target.value)}
              min={getThirtyDaysAgoString()}
              max={getLocalDateString()} />
          </FormField>

          <FormField label="Approximate Time" error={errors.eventTime} id="f-time" hint="Optional">
            <input id="f-time" type="time" className="form-input"
              value={form.eventTime} onChange={(e) => set('eventTime', e.target.value)} />
          </FormField>

          <FormField label="Location Found *" error={errors.location} id="f-location" className="sm:col-span-2">
            <select id="f-location" className="form-input"
              value={form.location} onChange={(e) => set('location', e.target.value)}>
              <option value="">Select location</option>
              {CAMPUS_LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </FormField>

          <FormField label="Description *" error={errors.description} id="f-desc" className="sm:col-span-2"
            hint="Describe the item — color, brand, condition, visible markings, etc.">
            <textarea id="f-desc" className="form-input" rows={3}
              placeholder="e.g. Black Samsung phone with cracked screen protector, found near library entrance..."
              value={form.description} onChange={(e) => set('description', e.target.value)} />
          </FormField>

          <FormField label="Additional Information" error={errors.additionalDetails} id="f-additional"
            className="sm:col-span-2" hint="Optional — any other details that might help identify the owner">
            <textarea id="f-additional" className="form-input" rows={2}
              placeholder="e.g. Has a college ID inside, found near seat number 14..."
              value={form.additionalDetails} onChange={(e) => set('additionalDetails', e.target.value)} />
          </FormField>
        </div>
      </div>

      {/* Your Details */}
      <div className="bg-white border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Your Contact Information</h2>
        <p className="text-sm text-muted-foreground">We'll only contact you if the item needs to be verified.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Your Name *" error={errors.reporterName} id="f-name">
            <input id="f-name" type="text" className="form-input" placeholder="e.g. Priya Sharma"
              value={form.reporterName} onChange={(e) => set('reporterName', e.target.value)}
              autoComplete="name" />
          </FormField>

          <FormField label="Mobile Number *" error={errors.reporterContact} id="f-contact">
            <input id="f-contact" type="tel" className="form-input" placeholder="9876543210"
              value={form.reporterContact} onChange={(e) => set('reporterContact', e.target.value)}
              maxLength={10} autoComplete="tel" />
          </FormField>

          <FormField label="Email Address" error={errors.reporterEmail} id="f-email"
            hint="Optional" className="sm:col-span-2">
            <input id="f-email" type="email" className="form-input" placeholder="you@example.com"
              value={form.reporterEmail} onChange={(e) => set('reporterEmail', e.target.value)}
              autoComplete="email" />
          </FormField>
        </div>
      </div>

      {submitError && (
        <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm" role="alert">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          {submitError}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting} size="lg" className="gap-2 min-w-44">
          {submitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
          ) : (
            <><CheckCircle className="h-4 w-4" /> Submit Found Report</>
          )}
        </Button>
      </div>
    </form>
  );
}

function FormField({
  label, error, id, hint, children, className,
}: {
  label: string; error?: string; id: string; hint?: string; children: React.ReactNode; className?: string;
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
