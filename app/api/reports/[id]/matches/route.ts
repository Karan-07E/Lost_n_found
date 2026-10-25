import { NextRequest } from 'next/server';
import { db } from '@/server/db';
import { reports, matches, recoveryCases } from '@/server/db/schema';
import { eq, or, and, desc } from 'drizzle-orm';

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    // 1. Fetch current report
    const [report] = await db
      .select()
      .from(reports)
      .where(isUuid ? or(eq(reports.id, id), eq(reports.reportId, id)) : eq(reports.reportId, id))
      .limit(1);

    if (!report) {
      return Response.json({ error: 'Report not found' }, { status: 404 });
    }

    // 2. Fetch matches where this report is lostReportId or foundReportId
    const isLost = report.reportType === 'LOST';
    const matchConditions = isLost ? eq(matches.lostReportId, report.id) : eq(matches.foundReportId, report.id);

    const matchRows = await db
      .select()
      .from(matches)
      .where(matchConditions)
      .orderBy(desc(matches.score));

    // 3. Join with counterpart report info
    const potentialMatches = [];
    for (const m of matchRows) {
      const targetReportId = isLost ? m.foundReportId : m.lostReportId;
      const [targetReport] = await db.select().from(reports).where(eq(reports.id, targetReportId)).limit(1);

      if (targetReport && targetReport.status !== 'RETURNED' && targetReport.status !== 'CLOSED') {
        // Check if an existing recovery case links these two reports
        const [existingCase] = await db
          .select({ id: recoveryCases.id, caseNumber: recoveryCases.caseNumber, status: recoveryCases.status })
          .from(recoveryCases)
          .where(and(eq(recoveryCases.lostReportId, isLost ? report.id : targetReport.id), eq(recoveryCases.foundReportId, isLost ? targetReport.id : report.id)))
          .limit(1);

        potentialMatches.push({
          matchId: m.id,
          score: m.score,
          matchStatus: m.status,
          targetReport: {
            id: targetReport.id,
            reportId: targetReport.reportId,
            reportType: targetReport.reportType,
            title: targetReport.title,
            description: targetReport.description,
            category: targetReport.category,
            location: targetReport.location,
            eventDate: targetReport.eventDate,
            imagePath: targetReport.imagePath,
            status: targetReport.status,
            createdAt: targetReport.createdAt,
          },
          existingRecoveryCase: existingCase || null,
        });
      }
    }

    return Response.json({
      data: {
        reportId: report.reportId,
        reportType: report.reportType,
        matches: potentialMatches,
      },
    });
  } catch (err: any) {
    console.error('Error fetching report matches:', err);
    return Response.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}
