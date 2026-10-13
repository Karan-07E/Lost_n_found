import type { Metadata } from 'next';
import { TrackForm } from './track-form';

export const metadata: Metadata = {
  title: 'Track My Report — Campus Lost & Found',
  description: 'Track the status of your lost or found item report using your Report ID.',
};

export default function TrackPage() {
  return (
    <div className="section">
      <div className="page-container max-w-xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Track Your Report</h1>
          <p className="text-muted-foreground mt-1">
            Enter your Report ID to see the current status.
          </p>
        </div>
        <TrackForm />
      </div>
    </div>
  );
}
