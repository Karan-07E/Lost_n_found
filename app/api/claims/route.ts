import { NextRequest } from 'next/server';
import { db } from '@/server/db';
import { claims, reports } from '@/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { generateClaimId } from '@/server/utils/helpers';
import { z } from 'zod';

const ClaimSchema = z.object({
  foundReportId: z.string().uuid(),
  lostReportId: z.string().uuid().optional(),
  claimantName: z.string().min(2),
  claimantUsn: z.string().min(3),
  claimantDept: z.string().optional(),
  claimantContact: z.string().min(5),
  claimantEmail: z.string().email().optional().or(z.literal('')),
  ownershipEvidence: z.string().min(10),
  additionalInfo: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ClaimSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data;
    const claimId = await generateClaimId();

    const [row] = await db.insert(claims).values({
      claimId,
      foundReportId: data.foundReportId,
      lostReportId: data.lostReportId || null,
      claimantName: data.claimantName,
      claimantUsn: data.claimantUsn,
      claimantDept: data.claimantDept || null,
      claimantContact: data.claimantContact,
      claimantEmail: data.claimantEmail || null,
      ownershipEvidence: data.ownershipEvidence,
      additionalInfo: data.additionalInfo || null,
      status: 'PENDING',
    }).returning();

    return Response.json({ data: { claimId: row.claimId, id: row.id } }, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to submit claim' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Admin only
  const adminPassword = request.headers.get('x-admin-password');
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rows = await db
      .select()
      .from(claims)
      .orderBy(desc(claims.createdAt))
      .limit(100);
    return Response.json({ data: rows });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to fetch claims' }, { status: 500 });
  }
}
