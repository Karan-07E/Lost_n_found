import { NextResponse } from 'next/server';
import { requireAuth } from '../../../server/auth/session';
import { db } from '../../../server/db';
import { notifications } from '../../../server/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await requireAuth();
    
    const notifs = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, session.userId))
      .orderBy(desc(notifications.createdAt));
      
    return NextResponse.json({ success: true, data: notifs });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 401 });
  }
}
