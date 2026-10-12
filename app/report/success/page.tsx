import { Suspense } from 'react';
import { SuccessContent } from './success-content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Report Submitted — Campus Lost & Found',
};

export default function SuccessPage() {
  return (
    <div className="section">
      <div className="page-container max-w-xl">
        <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-xl" />}>
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
