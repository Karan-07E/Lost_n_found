import { NextResponse } from 'next/server';
import { getReportById, updateReportStatus, deleteReport } from '../../../../server/repositories/reports';
import { requireAuth } from '../../../../server/auth/session';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const report = await getReportById(id);
    if (!report) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Report not found' } }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: report });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch report' } }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requireAuth();
    const body = await req.json();
    
    // Admins have their own route for overriding status, this is for standard users.
    const updated = await updateReportStatus(id, body.status, session.userId);
    if (!updated) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND_OR_FORBIDDEN', message: 'Cannot update report' } }, { status: 403 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: error.message } },
      { status: error.message === 'UNAUTHORIZED' ? 401 : 400 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requireAuth();
    const deleted = await deleteReport(id, session.userId);
    if (!deleted) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND_OR_FORBIDDEN', message: 'Cannot delete report' } }, { status: 403 });
    }
    return NextResponse.json({ success: true, message: 'Report deleted' });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: error.message } },
      { status: error.message === 'UNAUTHORIZED' ? 401 : 400 }
    );
  }
}
