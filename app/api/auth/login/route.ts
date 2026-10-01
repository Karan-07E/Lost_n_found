import { NextResponse } from 'next/server';
import { loginService } from '../../../../server/services/auth/login';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = await loginService(body);
    
    return NextResponse.json({
      success: true,
      data: user,
      message: 'Login successful'
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: error.message || 'Login failed'
        }
      },
      { status: 401 }
    );
  }
}
