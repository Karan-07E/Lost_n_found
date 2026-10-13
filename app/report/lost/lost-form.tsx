'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, ChevronRight, ChevronLeft, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS, DEPARTMENTS } from '@/lib/constants';
import { getLocalDateString, getThirtyDaysAgoString } from '@/lib/format';

type FormData = {
  // Step 1 — Student Info
  reporterName: string;
  reporterUsn: string;
  reporterDept: string;
  reporterSemester: string;
  reporterContact: string;
  reporterEmail: string;
  // Step 2 — Item Details
  category: string;
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  location: string;
  specificLocation: string;
  additionalDetails: string;
};

type Errors = Partial<Record<keyof FormData, string>>;

const STEPS = ['Student Info', 'Item Details', 'Review & Submit'];

const SEMESTERS = ['1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'];

export function LostReportForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [form, setForm] = useState<FormData>(() => ({
    reporterName: '',
    reporterUsn: '',
    reporterDept: '',
    reporterSemester: '',
    reporterContact: '',
    reporterEmail: '',
    category: '',
    title: '',
    description: '',
    eventDate: getLocalDateString(),
    eventTime: '',
    location: '',
    specificLocation: '',
    additionalDetails: '',
  }));

  const set = (field: keyof FormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  const validateStep1 = (): boolean => {
    const errs: Errors = {};
    if (!form.reporterName.trim()) errs.reporterName = 'Full name is required.';
    if (!form.reporterUsn.trim()) errs.reporterUsn = 'USN is required.';
    else if (!/^\d[a-zA-Z]{2}\d{2}[a-zA-Z]{2}\d{3}$/i.test(form.reporterUsn.trim())) {
      errs.reporterUsn = 'Please enter your USN in the format 4VV23CS001.';
    }
    if (!form.reporterContact.trim()) errs.reporterContact = 'Contact number is required.';
    else if (!/^[6-9]\d{9}$/.test(form.reporterContact.trim())) {
      errs.reporterContact = 'Please enter a valid 10-digit Indian mobile number.';
    }
    if (form.reporterEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.reporterEmail)) {
      errs.reporterEmail = 'Please enter a valid email address.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errs: Errors = {};
    const todayStr = getLocalDateString();
    const minDateStr = getThirtyDaysAgoString();

    if (!form.category) errs.category = 'Please select a category.';
    if (!form.title.trim()) errs.title = 'Item name is required.';
    else if (form.title.trim().length < 2) errs.title = 'Please provide a more descriptive item name.';
    if (!form.description.trim()) errs.description = 'Description is required.';
    else if (form.description.trim().length < 10) errs.description = 'Please provide at least 10 characters of description.';
    if (!form.eventDate) {
      errs.eventDate = 'Please select the date you lost the item.';
    } else if (form.eventDate > todayStr) {
      errs.eventDate = 'Date cannot be in the future.';
    } else if (form.eventDate < minDateStr) {
      errs.eventDate = 'Date is invalid. Must be within the past 30 days.';
    }
    if (!form.location) errs.location = 'Please select a location.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && validateStep1()) setStep(1);
    else if (step === 1 && validateStep2()) setStep(2);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, reportType: 'LOST' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      router.push(`/report/success?reportId=${data.data.reportId}&type=LOST`);
    } catch (err: any) {
      setErrors({ title: err.message || 'We couldn\'t submit your report right now. Please try again.' });
      setStep(1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center" aria-label="Form progress">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`step-dot ${
                i < step ? 'step-dot-complete' : i === step ? 'step-dot-active' : 'step-dot-inactive'
              }`} aria-current={i === step ? 'step' : undefined}>
                {i < step ? <CheckCircle className="h-4 w-4" /> : <span>{i + 1}</span>}
              </div>
              <span className={`text-xs mt-1 hidden sm:block font-medium ${i === step ? 'text-primary' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`step-line ${i < step ? 'step-line-active' : ''}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 — Student Info */}
      {step === 0 && (
        <div className="bg-white border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Your Information</h2>
          <p className="text-sm text-muted-foreground">This helps us contact you if a match is found.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Full Name *" error={errors.reporterName} id="name">
              <input id="name" type="text" className="form-input" placeholder="e.g. Rahul Kumar"
                value={form.reporterName} onChange={(e) => set('reporterName', e.target.value)} autoComplete="name" />
            </FormField>

            <FormField label="USN *" error={errors.reporterUsn} id="usn" hint="Format: 4VV23CS001">
              <input id="usn" type="text" className="form-input" placeholder="4VV23CS001"
                value={form.reporterUsn} onChange={(e) => set('reporterUsn', e.target.value.toUpperCase())}
                maxLength={10} />
            </FormField>

            <FormField label="Department" error={errors.reporterDept} id="dept">
              <select id="dept" className="form-input"
                value={form.reporterDept} onChange={(e) => set('reporterDept', e.target.value)}>
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </FormField>

            <FormField label="Semester / Year" error={errors.reporterSemester} id="semester">
              <select id="semester" className="form-input"
                value={form.reporterSemester} onChange={(e) => set('reporterSemester', e.target.value)}>
                <option value="">Select semester</option>
                {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>

            <FormField label="Mobile Number *" error={errors.reporterContact} id="contact">
              <input id="contact" type="tel" className="form-input" placeholder="9876543210"
                value={form.reporterContact} onChange={(e) => set('reporterContact', e.target.value)}
                maxLength={10} autoComplete="tel" />
            </FormField>

            <FormField label="Email Address" error={errors.reporterEmail} id="email" hint="Optional — for status updates">
              <input id="email" type="email" className="form-input" placeholder="you@example.com"
                value={form.reporterEmail} onChange={(e) => set('reporterEmail', e.target.value)}
                autoComplete="email" />
            </FormField>
          </div>
        </div>
      )}

      {/* Step 2 — Item Details */}
      {step === 1 && (
        <div className="bg-white border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Lost Item Details</h2>
          <p className="text-sm text-muted-foreground">Provide as much detail as possible to help identify your item.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Item Category *" error={errors.category} id="category">
              <select id="category" className="form-input"
                value={form.category} onChange={(e) => set('category', e.target.value)}>
                <option value="">Select category</option>
                {ITEM_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>

            <FormField label="Item Name *" error={errors.title} id="title">
              <input id="title" type="text" className="form-input" placeholder="e.g. Black leather wallet"
                value={form.title} onChange={(e) => set('title', e.target.value)} />
            </FormField>

            <FormField label="Date Lost *" error={errors.eventDate} id="eventDate" hint="Within past 30 days">
              <input id="eventDate" type="date" className="form-input"
                value={form.eventDate} onChange={(e) => set('eventDate', e.target.value)}
                min={getThirtyDaysAgoString()}
                max={getLocalDateString()} />
            </FormField>

            <FormField label="Approximate Time" error={errors.eventTime} id="eventTime" hint="Optional">
              <input id="eventTime" type="time" className="form-input"
                value={form.eventTime} onChange={(e) => set('eventTime', e.target.value)} />
            </FormField>

            <FormField label="Campus Location *" error={errors.location} id="location">
              <select id="location" className="form-input"
                value={form.location} onChange={(e) => set('location', e.target.value)}>
                <option value="">Select location</option>
                {CAMPUS_LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </FormField>

            <FormField label="Specific Location" error={errors.specificLocation} id="specificLocation"
              hint="e.g. Room 204, 2nd floor lab, bench near entrance">
              <input id="specificLocation" type="text" className="form-input"
                placeholder="e.g. Room 204, 2nd floor lab"
                value={form.specificLocation} onChange={(e) => set('specificLocation', e.target.value)} />
            </FormField>

            <FormField label="Description *" error={errors.description} id="description" className="sm:col-span-2"
              hint="Describe color, brand, size, condition, and any distinguishing markings or identifiers.">
              <textarea id="description" className="form-input" rows={4}
                placeholder="e.g. Black Nike backpack with red keychain, Dell Inspiron laptop inside, scratch on bottom right corner..."
                value={form.description} onChange={(e) => set('description', e.target.value)} />
            </FormField>
          </div>
        </div>
      )}

      {/* Step 3 — Review */}
      {step === 2 && (
        <div className="bg-white border border-border rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-foreground">Review Your Report</h2>
          <p className="text-sm text-muted-foreground">Please review the details before submitting.</p>

          {errors.title && (
            <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {errors.title}
            </div>
          )}

          <div className="space-y-4">
            <ReviewSection title="Your Information">
              <ReviewRow label="Name" value={form.reporterName} />
              <ReviewRow label="USN" value={form.reporterUsn} />
              {form.reporterDept && <ReviewRow label="Department" value={form.reporterDept} />}
              {form.reporterSemester && <ReviewRow label="Semester" value={form.reporterSemester} />}
              <ReviewRow label="Contact" value={form.reporterContact} />
              {form.reporterEmail && <ReviewRow label="Email" value={form.reporterEmail} />}
            </ReviewSection>

            <ReviewSection title="Lost Item Details">
              <ReviewRow label="Category" value={form.category} />
              <ReviewRow label="Item Name" value={form.title} />
              <ReviewRow label="Date Lost" value={form.eventDate} />
              {form.eventTime && <ReviewRow label="Time" value={form.eventTime} />}
              <ReviewRow label="Campus Location" value={form.location} />
              {form.specificLocation && <ReviewRow label="Specific Location" value={form.specificLocation} />}
              <ReviewRow label="Description" value={form.description} />
            </ReviewSection>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3">
        {step > 0 ? (
          <Button variant="outline" onClick={() => setStep(step - 1)} className="gap-2">
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
        ) : (
          <div />
        )}
        <div className="flex gap-3">
          {step < 2 ? (
            <Button onClick={handleNext} className="gap-2">
              Continue <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting} className="gap-2 min-w-36">
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
              ) : (
                <><CheckCircle className="h-4 w-4" /> Submit Lost Report</>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
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

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="bg-muted/50 px-4 py-2.5 border-b border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 px-4 py-3">
      <p className="text-sm text-muted-foreground w-36 shrink-0">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}
