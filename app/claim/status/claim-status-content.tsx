'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Clock, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function ClaimStatusContent() {
  const params = useSearchParams();
  const claimId = params.get('claimId') || 'CLM-2026-12345';
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(claimId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden">
      <div className="bg-green-50 border-b border-green-200 p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-7 w-7 text-green-600" />
        </div>
        <h1 className="text-xl font-bold text-green-900 mb-1">Claim Submitted</h1>
        <p className="text-sm text-green-700">Our admin team will review your claim and contact you.</p>
      </div>

      <div className="p-6 text-center border-b border-border">
        <p className="text-sm text-muted-foreground mb-2">Your Claim ID</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-xl font-bold font-mono text-primary">{claimId}</span>
          <button onClick={copy} className="p-2 rounded-md border border-border hover:bg-muted transition-colors" aria-label="Copy">
            {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="text-sm text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">What happens next?</p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>The admin team will review your ownership evidence</li>
            <li>You'll be contacted at the number you provided</li>
            <li>If approved, bring your college ID to the Security Office</li>
            <li>The item will be handed over after identity verification</li>
          </ol>
        </div>
        <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
          <strong>Security Office:</strong> Ground Floor, Admin Block. Open Mon–Sat, 9 AM–5 PM.
          Contact: +91 80 2345 6789
        </p>
      </div>

      <div className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
        <Link href="/search" className="flex-1">
          <Button variant="outline" className="w-full">Back to Search</Button>
        </Link>
        <Link href="/" className="flex-1">
          <Button className="w-full">Go to Home</Button>
        </Link>
      </div>
    </div>
  );
}
