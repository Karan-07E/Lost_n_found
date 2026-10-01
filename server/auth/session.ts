import { getAuthSession, TokenPayload } from './jwt';

export async function requireAuth(): Promise<TokenPayload> {
  const session = await getAuthSession();
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}

export async function requireRole(roles: Array<'STUDENT' | 'TEACHER' | 'ADMIN'>): Promise<TokenPayload> {
  const session = await requireAuth();
  if (!roles.includes(session.role)) {
    throw new Error('FORBIDDEN');
  }
  return session;
}
