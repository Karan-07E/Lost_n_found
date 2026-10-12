import { notFound } from 'next/navigation';
import { db } from '@/server/db';
import { reports } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { ClaimForm } from './claim-form';
import type { Metadata } from 'next';

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: 'Submit a Claim — Campus Lost & Found',
};

export default async function ClaimPage({ params }: Props) {
  const { id } = await params;

  let report = null;
  try {
    const [row] = await db
      .select({
        id: reports.id,
        reportId: reports.reportId,
        title: reports.title,
        category: reports.category,
        location: reports.location,
        eventDate: reports.eventDate,
        status: reports.status,
        reportType: reports.reportType,
      })
      .from(reports)
      .where(eq(reports.id, id))
      .limit(1);
    report = row;
  } catch {
    report = null;
  }

  if (!report || report.reportType !== 'FOUND') notFound();
  if (report.status === 'RETURNED' || report.status === 'CLOSED') {
    return (
      <div className="section">
        <div className="page-container max-w-xl text-center">
          <div className="bg-muted rounded-xl p-12">
            <p className="text-lg font-semibold text-muted-foreground">This item has already been returned.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="page-container max-w-xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Submit an Ownership Claim</h1>
          <p className="text-muted-foreground mt-1">
            Provide details that prove this item belongs to you. Our admin team will review your claim.
          </p>
        </div>

        {/* Item summary */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
          <p className="text-xs text-muted-foreground mb-1">Claiming for found item:</p>
          <p className="font-semibold text-foreground">{report.title}</p>
          <p className="text-sm text-muted-foreground">{report.category} · {report.location} · {report.reportId}</p>
        </div>

        <ClaimForm foundReportId={report.id} foundReportTitle={report.title} />
      </div>
    </div>
  );
}
