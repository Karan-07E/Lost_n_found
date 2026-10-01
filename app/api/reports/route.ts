import { NextResponse } from 'next/server';
import { requireAuth } from '../../../server/auth/session';
import { createReportService } from '../../../server/services/reports/createReport';
import { getReportsByType } from '../../../server/repositories/reports';

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const formData = await req.formData();
    
    const report = await createReportService(formData, session.userId);
    
    return NextResponse.json({
      success: true,
      data: report,
      message: 'Report created successfully'
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: error.message } },
      { status: error.message === 'UNAUTHORIZED' ? 401 : 400 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as 'LOST' | 'FOUND' | null;
    const page = parseInt(searchParams.get('page') || '1');
    
    if (!type || !['LOST', 'FOUND'].includes(type)) {
      return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Valid type is required' } }, { status: 400 });
    }

    const reports = await getReportsByType(type, page);
    return NextResponse.json({ success: true, data: reports });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch reports' } },
      { status: 500 }
    );
  }
}
