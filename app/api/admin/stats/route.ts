import { NextRequest } from 'next/server';
import { db } from '@/server/db';
import { reports, claims } from '@/server/db/schema';
import { eq, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const adminPassword = request.headers.get('x-admin-password');
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [totalReports] = await db.select({ value: count() }).from(reports);
    const [lostReports] = await db.select({ value: count() }).from(reports).where(eq(reports.reportType, 'LOST'));
    const [foundReports] = await db.select({ value: count() }).from(reports).where(eq(reports.reportType, 'FOUND'));
    const [pendingClaims] = await db.select({ value: count() }).from(claims).where(eq(claims.status, 'PENDING'));
    const [resolvedReports] = await db.select({ value: count() }).from(reports).where(eq(reports.status, 'RETURNED'));

    return Response.json({
      data: {
        totalReports: Number(totalReports.value),
        lostReports: Number(lostReports.value),
        foundReports: Number(foundReports.value),
        pendingClaims: Number(pendingClaims.value),
        resolvedReports: Number(resolvedReports.value),
      }
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
