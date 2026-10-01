import { loginSchema, LoginInput } from '../../validation/auth';
import { getUserByEmail } from '../../repositories/users';
import { comparePassword } from '../../auth/password';
import { generateToken, setAuthCookie } from '../../auth/jwt';

export async function loginService(input: LoginInput) {
  const validated = loginSchema.parse(input);

  const user = await getUserByEmail(validated.email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValid = await comparePassword(validated.password, user.passwordHash);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken({ userId: user.id, role: user.role });
  await setAuthCookie(token);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
