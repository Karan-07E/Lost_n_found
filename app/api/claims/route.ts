import { NextResponse } from 'next/server';
import { requireAuth } from '../../../server/auth/session';
import { createClaimSchema } from '../../../server/validation/claims';
import { createClaim, getUserClaims } from '../../../server/repositories/claims';
import { getReportById } from '../../../server/repositories/reports';
import { db } from '../../../server/db';
import { notifications } from '../../../server/db/schema';
import { uploadImage } from '../../../server/utils/upload';

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const formData = await req.formData();
    
    const foundReportId = formData.get('foundReportId') as string;
    const justification = formData.get('justification') as string;
    
    const validated = createClaimSchema.parse({ foundReportId, justification });
    
    // Check if report exists and is FOUND
    const report = await getReportById(validated.foundReportId);
    if (!report || report.reportType !== 'FOUND' || report.status !== 'ACTIVE') {
      return NextResponse.json({ success: false, error: { code: 'INVALID_TARGET', message: 'Report is not available for claiming' } }, { status: 400 });
    }
    
    if (report.userId === session.userId) {
      return NextResponse.json({ success: false, error: { code: 'INVALID_TARGET', message: 'You cannot claim your own report' } }, { status: 400 });
    }

    let proofImagePath = null;
    const imageFile = formData.get('proofImage') as File | null;
    if (imageFile && imageFile.size > 0) {
      proofImagePath = await uploadImage(imageFile);
    }

    const claim = await createClaim({
      foundReportId: validated.foundReportId,
      claimantId: session.userId,
      justification: validated.justification,
      proofImagePath,
      status: 'PENDING',
    });

    // Notify the finder (owner of the found report)
    await db.insert(notifications).values({
      userId: report.userId,
      type: 'CLAIM_SUBMITTED',
      message: `Someone has submitted a claim for your found item: ${report.title}`,
      relatedClaimId: claim.id,
      relatedReportId: report.id,
    });

    return NextResponse.json({ success: true, data: claim, message: 'Claim submitted successfully' });
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
    const session = await requireAuth();
    const claimsList = await getUserClaims(session.userId);
    return NextResponse.json({ success: true, data: claimsList });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: error.message } },
      { status: 401 }
    );
  }
}
