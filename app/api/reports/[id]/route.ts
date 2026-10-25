import { NextRequest } from 'next/server';
import { db } from '@/server/db';
import { reports } from '@/server/db/schema';
import { eq, or } from 'drizzle-orm';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    // Support lookup by UUID or by reportId (e.g. LF-2026-00124)
    const [row] = await db
      .select()
      .from(reports)
      .where(isUuid ? or(eq(reports.id, id), eq(reports.reportId, id)) : eq(reports.reportId, id))
      .limit(1);

    if (!row) {
      return Response.json({ error: 'Report not found' }, { status: 404 });
    }

    // Omit sensitive private info for public view
    const publicRow = {
      id: row.id,
      reportId: row.reportId,
      reportType: row.reportType,
      title: row.title,
      description: row.description,
      category: row.category,
      location: row.location,
      specificLocation: row.specificLocation,
      eventDate: row.eventDate,
      eventTime: row.eventTime,
      imagePath: row.imagePath,
      status: row.status,
      createdAt: row.createdAt,
      // Note: identifying features are NOT returned publicly to prevent fraudulent claims
    };

    return Response.json({ data: publicRow });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to fetch report' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    // Admin-only: update status, add notes
    const adminPassword = req.headers.get('x-admin-password');
    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (adminPassword !== expectedPassword) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const allowed = ['status', 'adminNotes'] as const;
    const updateData: Record<string, string> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updateData[key] = body[key];
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const [updated] = await db
      .update(reports)
      .set({ ...updateData, updatedAt: new Date() })
      .where(isUuid ? or(eq(reports.id, id), eq(reports.reportId, id)) : eq(reports.reportId, id))
      .returning({ reportId: reports.reportId, status: reports.status });

    if (!updated) return Response.json({ error: 'Report not found' }, { status: 404 });
    return Response.json({ data: updated });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to update report' }, { status: 500 });
  }
}
