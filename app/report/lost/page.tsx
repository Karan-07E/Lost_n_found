import type { Metadata } from 'next';
import { LostReportForm } from './lost-form';

export const metadata: Metadata = {
  title: 'Report Lost Item — Campus Lost & Found',
  description: 'Submit a lost item report. No account required.',
};

export default function ReportLostPage() {
  return (
    <div className="section">
      <div className="page-container max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Report a Lost Item</h1>
          <p className="text-muted-foreground mt-1">
            Fill in the details below. A unique Report ID will be generated for tracking.
          </p>
        </div>
        <LostReportForm />
      </div>
    </div>
  );
}
