import type { Metadata } from 'next';
import { FoundReportForm } from './found-form';

export const metadata: Metadata = {
  title: 'Report Found Item — Campus Lost & Found',
  description: 'Report an item you found on campus so its owner can claim it.',
};

export default function ReportFoundPage() {
  return (
    <div className="section">
      <div className="page-container max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Report a Found Item</h1>
          <p className="text-muted-foreground mt-1">
            Thank you for taking the time to report this. Fill in the details so the owner can identify and claim it.
          </p>
        </div>
        <FoundReportForm />
      </div>
    </div>
  );
}
