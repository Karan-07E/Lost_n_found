import { NextResponse } from 'next/server';
import { requireAuth } from '../../../../../server/auth/session';
import { db } from '../../../../../server/db';
import { notifications } from '../../../../../server/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requireAuth();
    
    await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, session.userId)));
      
    return NextResponse.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 401 });
  }
}
