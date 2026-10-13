import Link from 'next/link';
import { ClipboardList, CheckCircle, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Report an Item — Campus Lost & Found',
  description: 'Report a lost or found item on campus.',
};

export default function ReportSelectPage() {
  return (
    <div className="section">
      <div className="page-container max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-foreground mb-2">What would you like to report?</h1>
          <p className="text-muted-foreground">Choose the type of report that applies to your situation.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Link
            href="/report/lost"
            id="select-lost"
            className="group flex flex-col items-center text-center p-8 bg-white border-2 border-border rounded-xl hover:border-primary hover:shadow-sm transition-all focus-ring"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 group-hover:bg-primary/10 transition-colors">
              <ClipboardList className="h-7 w-7 text-blue-600 group-hover:text-primary transition-colors" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">I Lost Something</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Submit a report for an item you've lost on campus. We'll search for potential matches.
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
              Start Report <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            href="/report/found"
            id="select-found"
            className="group flex flex-col items-center text-center p-8 bg-white border-2 border-border rounded-xl hover:border-primary hover:shadow-sm transition-all focus-ring"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 group-hover:bg-primary/10 transition-colors">
              <CheckCircle className="h-7 w-7 text-green-600 group-hover:text-primary transition-colors" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">I Found Something</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Report an item you've found on campus so its owner can claim it.
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
              Start Report <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>

        <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border text-center">
          <p className="text-sm text-muted-foreground">
            Already submitted a report?{' '}
            <Link href="/track" className="text-primary hover:underline font-medium">
              Track its status here →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
