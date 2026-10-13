'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Search, Clock, ArrowRight, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function SuccessContent() {
  const params = useSearchParams();
  const reportId = params.get('reportId') || 'LF-2026-00001';
  const type = params.get('type') || 'LOST';
  const [copied, setCopied] = useState(false);

  const copyId = () => {
    navigator.clipboard.writeText(reportId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLost = type === 'LOST';

  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden">
      {/* Success header */}
      <div className="bg-green-50 border-b border-green-200 p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-7 w-7 text-green-600" />
        </div>
        <h1 className="text-xl font-bold text-green-900 mb-1">
          {isLost ? 'Lost Report Submitted Successfully' : 'Found Report Submitted Successfully'}
        </h1>
        <p className="text-sm text-green-700">
          {isLost
            ? 'We\'ll notify you when a potential match is identified.'
            : 'Thank you for helping return this item to its owner.'}
        </p>
      </div>

      {/* Report ID */}
      <div className="p-6 text-center border-b border-border">
        <p className="text-sm text-muted-foreground mb-2">Your Report ID</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl font-bold font-mono text-primary tracking-wider">{reportId}</span>
          <button
            onClick={copyId}
            className="p-2 rounded-md border border-border hover:bg-muted transition-colors"
            aria-label="Copy report ID"
            title="Copy to clipboard"
          >
            {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Save this ID to track your report status
        </p>
      </div>

      {/* Details */}
      <div className="p-6 space-y-3">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
          <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Status: Submitted</p>
            <p className="text-xs text-muted-foreground">Your report is now visible to the admin team</p>
          </div>
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <p className="font-medium text-foreground text-sm">What happens next?</p>
          {isLost ? (
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Our team will review your report</li>
              <li>If a found item matches, you'll be notified at your contact number</li>
              <li>You can track the status using your Report ID</li>
              <li>Visit the Security Office with proof of identity to collect the item</li>
            </ol>
          ) : (
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Please submit the found item to the Security Office, Admin Block</li>
              <li>The item will be listed publicly for potential claimants</li>
              <li>Our team will verify any claims and notify you if needed</li>
            </ol>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
        <Link href="/track" className="flex-1">
          <Button variant="outline" className="w-full gap-2">
            <Clock className="h-4 w-4" />
            Track This Report
          </Button>
        </Link>
        <Link href="/search" className="flex-1">
          <Button className="w-full gap-2">
            <Search className="h-4 w-4" />
            Search Found Items
          </Button>
        </Link>
      </div>
    </div>
  );
}
