import { db } from '@/server/db';
import { reports } from '@/server/db/schema';
import { desc } from 'drizzle-orm';
import { HomeItemsView, ReportItem } from '@/components/home-items-view';

async function getAllReports(): Promise<ReportItem[]> {
  try {
    const rows = await db
      .select({
        id: reports.id,
        reportId: reports.reportId,
        reportType: reports.reportType,
        title: reports.title,
        description: reports.description,
        category: reports.category,
        location: reports.location,
        eventDate: reports.eventDate,
        eventTime: reports.eventTime,
        status: reports.status,
        reporterName: reports.reporterName,
        reporterContact: reports.reporterContact,
        reporterDept: reports.reporterDept,
        reporterUsn: reports.reporterUsn,
        adminNotes: reports.adminNotes,
        createdAt: reports.createdAt,
      })
      .from(reports)
      .orderBy(desc(reports.createdAt));

    return rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Failed to fetch reports for home page:', error);
    return [];
  }
}

export default async function HomePage() {
  const allItems = await getAllReports();

  return (
    <main className="min-h-screen bg-muted/20">
      <HomeItemsView initialItems={allItems} />
    </main>
  );
}
