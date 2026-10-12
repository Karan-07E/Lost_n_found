import { Suspense } from 'react';
import { ClaimStatusContent } from './claim-status-content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Claim Submitted — Campus Lost & Found',
};

export default function ClaimStatusPage() {
  return (
    <div className="section">
      <div className="page-container max-w-lg">
        <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-xl" />}>
          <ClaimStatusContent />
        </Suspense>
      </div>
    </div>
  );
}
