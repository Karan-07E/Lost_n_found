import { NextResponse } from 'next/server';
import { registerService } from '../../../../server/services/auth/register';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = await registerService(body);
    
    return NextResponse.json({
      success: true,
      data: user,
      message: 'Registration successful'
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message || 'Registration failed'
        }
      },
      { status: 400 }
    );
  }
}
