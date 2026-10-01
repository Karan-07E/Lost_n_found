import { NextResponse } from 'next/server';
import { removeAuthCookie } from '../../../../server/auth/jwt';

export async function POST() {
  await removeAuthCookie();
  
  return NextResponse.json({
    success: true,
    data: null,
    message: 'Logout successful'
  });
}
