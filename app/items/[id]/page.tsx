import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Calendar, Clock, Tag, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { db } from '@/server/db';
import { reports } from '@/server/db/schema';
import { eq, or } from 'drizzle-orm';
import { StatusBadge } from '@/components/status-badge';
import { formatDate } from '@/lib/format';
import type { Metadata } from 'next';

type Props = { params: Promise<{ id: string }> };

async function getReport(id: string) {
  try {
    const [row] = await db
      .select()
      .from(reports)
      .where(or(eq(reports.id, id), eq(reports.reportId, id)))
      .limit(1);
    return row || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const report = await getReport(id);
  if (!report) return { title: 'Item Not Found' };
  return {
    title: `${report.title} — Campus Lost & Found`,
    description: `${report.reportType === 'FOUND' ? 'Found' : 'Lost'}: ${report.description.slice(0, 120)}`,
  };
}

const CATEGORY_EMOJI: Record<string, string> = {
  'Mobile / Electronics': '📱',
  'ID Card': '🪪',
  'Wallet': '👛',
  'Bag / Backpack': '🎒',
  'Keys': '🔑',
  'Books / Notes': '📚',
  'Accessories': '⌚',
  'Documents': '📄',
  'Water Bottle': '💧',
  'Clothing': '👕',
};

export default async function ItemDetailPage({ params }: Props) {
  const { id } = await params;
  const report = await getReport(id);

  if (!report) notFound();

  const emoji = CATEGORY_EMOJI[report.category] || '📦';
  const isFound = report.reportType === 'FOUND';
  const canClaim = isFound && report.status !== 'RETURNED' && report.status !== 'CLOSED';

  return (
    <div className="section">
      <div className="page-container max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
          <Link href="/search" className="hover:text-primary flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Search
          </Link>
          <span>/</span>
          <span className="text-foreground">{report.title}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Left: Image */}
          <div className="md:col-span-2">
            <div className="bg-muted rounded-xl border border-border overflow-hidden aspect-square flex items-center justify-center text-6xl">
              {report.imagePath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={report.imagePath} alt={report.title} className="w-full h-full object-cover" />
              ) : (
                <span role="img" aria-label={report.category}>{emoji}</span>
              )}
            </div>

            {/* Type badge */}
            <div className={`mt-4 p-3 rounded-lg border text-center text-sm font-semibold ${
              isFound
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}>
              {isFound ? '✓ Found Item' : '⚠ Lost Item Report'}
            </div>
          </div>

          {/* Right: Details */}
          <div className="md:col-span-3 space-y-6">
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h1 className="text-2xl font-bold text-foreground">{report.title}</h1>
                <StatusBadge status={report.status} />
              </div>
              <p className="text-xs text-muted-foreground font-mono">{report.reportId}</p>
            </div>

            {/* Key details */}
            <div className="grid grid-cols-2 gap-4">
              <DetailItem icon={Tag} label="Category" value={report.category} />
              <DetailItem icon={MapPin} label="Campus Location" value={report.location} />
              {report.specificLocation && (
                <DetailItem icon={MapPin} label="Specific Spot" value={report.specificLocation} />
              )}
              <DetailItem icon={Calendar} label="Date" value={formatDate(report.eventDate)} />
              {report.eventTime && (
                <DetailItem icon={Clock} label="Time" value={report.eventTime} />
              )}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-2">Description</h2>
              <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 rounded-lg p-3">
                {report.description}
              </p>
            </div>

            {/* Additional details */}
            {report.additionalDetails && (
              <div>
                <h2 className="text-sm font-semibold text-foreground mb-2">Additional Information</h2>
                <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 rounded-lg p-3">
                  {report.additionalDetails}
                </p>
              </div>
            )}

            {/* Privacy note */}
            {isFound && (
              <div className="flex gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>
                  Some identifying details are not displayed publicly to prevent fraudulent claims.
                  You'll need to provide ownership evidence when claiming.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {canClaim && (
                <Link href={`/claim/${report.id}`} className="flex-1">
                  <Button className="w-full gap-2" size="lg">
                    I Think This Is Mine
                  </Button>
                </Link>
              )}
              <Link href="/track">
                <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
                  Track My Report
                </Button>
              </Link>
            </div>

            {report.status === 'RETURNED' && (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 text-center font-medium">
                ✓ This item has been returned to its owner.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }: { icon: React.ComponentType<any>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
