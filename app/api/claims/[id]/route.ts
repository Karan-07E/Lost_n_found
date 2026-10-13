import { NextRequest } from 'next/server';
import { db } from '@/server/db';
import { claims } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const adminPassword = req.headers.get('x-admin-password');
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const allowed = ['status', 'adminNotes'] as const;
    const updateData: Record<string, string | Date> = { updatedAt: new Date() };
    for (const key of allowed) {
      if (body[key] !== undefined) updateData[key] = body[key];
    }
    if (body.status === 'APPROVED' || body.status === 'REJECTED') {
      updateData.reviewedAt = new Date();
    }

    const [updated] = await db
      .update(claims)
      .set(updateData)
      .where(eq(claims.id, id))
      .returning({ claimId: claims.claimId, status: claims.status });

    if (!updated) return Response.json({ error: 'Claim not found' }, { status: 404 });
    return Response.json({ data: updated });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to update claim' }, { status: 500 });
  }
}
