import { NextRequest } from 'next/server';
import { db } from '@/server/db';
import { reports } from '@/server/db/schema';
import { eq, desc, ilike, and, or } from 'drizzle-orm';
import { generateReportId } from '@/server/utils/helpers';
import { triggerMatching } from '@/server/services/matching/engine';
import { z } from 'zod';

const ReportSchema = z.object({
  reportType: z.enum(['LOST', 'FOUND']),
  title: z.string().min(2),
  description: z.string().min(10),
  category: z.string().min(1),
  location: z.string().min(1),
  specificLocation: z.string().optional().nullable(),
  eventDate: z.string().min(1).refine((val) => {
    const d = new Date(val);
    if (isNaN(d.getTime())) return false;
    const now = new Date();
    const max = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59, 59);
    const min = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 31, 0, 0, 0);
    return d <= max && d >= min;
  }, 'Date must be within the past 30 days and cannot be in the future'),
  eventTime: z.string().optional(),
  identifyingFeatures: z.string().optional().nullable(),
  imagePath: z.string().optional(),
  additionalDetails: z.string().optional(),
  reporterName: z.string().min(2),
  reporterUsn: z.string().optional(),
  reporterDept: z.string().optional(),
  reporterSemester: z.string().optional(),
  reporterContact: z.string().min(5),
  reporterEmail: z.string().email().optional().or(z.literal('')),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type'); // LOST | FOUND | null (all)
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const query = searchParams.get('q');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');

    const conditions = [];
    if (type === 'LOST' || type === 'FOUND') {
      conditions.push(eq(reports.reportType, type));
    }
    if (category) conditions.push(ilike(reports.category, `%${category}%`));
    if (location) conditions.push(ilike(reports.location, `%${location}%`));
    if (query) {
      conditions.push(
        or(
          ilike(reports.title, `%${query}%`),
          ilike(reports.description, `%${query}%`),
          ilike(reports.location, `%${query}%`),
          ilike(reports.specificLocation, `%${query}%`),
          ilike(reports.category, `%${query}%`)
        )
      );
    }

    const rows = await db
      .select({
        id: reports.id,
        reportId: reports.reportId,
        reportType: reports.reportType,
        title: reports.title,
        description: reports.description,
        category: reports.category,
        location: reports.location,
        specificLocation: reports.specificLocation,
        eventDate: reports.eventDate,
        imagePath: reports.imagePath,
        status: reports.status,
        createdAt: reports.createdAt,
      })
      .from(reports)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(reports.createdAt))
      .limit(limit)
      .offset(offset);

    return Response.json({ data: rows });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ReportSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data;
    const reportId = await generateReportId();
    const accessToken = 'sec_' + (await import('crypto')).randomBytes(24).toString('hex');

    const [row] = await db.insert(reports).values({
      reportId,
      reportType: data.reportType,
      title: data.title,
      description: data.description,
      category: data.category,
      location: data.location,
      specificLocation: data.specificLocation || null,
      eventDate: data.eventDate,
      eventTime: data.eventTime || null,
      identifyingFeatures: data.identifyingFeatures || null,
      imagePath: data.imagePath || null,
      additionalDetails: data.additionalDetails || null,
      reporterName: data.reporterName,
      reporterUsn: data.reporterUsn || null,
      reporterDept: data.reporterDept || null,
      reporterSemester: data.reporterSemester || null,
      reporterContact: data.reporterContact,
      reporterEmail: data.reporterEmail || null,
      status: 'SUBMITTED',
      accessToken,
    }).returning();

    // Trigger heuristic matching in background
    triggerMatching(row.id).catch(console.error);

    return Response.json({ data: { reportId: row.reportId, id: row.id, accessToken } }, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to create report' }, { status: 500 });
  }
}
