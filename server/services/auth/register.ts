import { registerSchema, RegisterInput } from '../../validation/auth';
import { getUserByEmail, createUser } from '../../repositories/users';
import { hashPassword } from '../../auth/password';
import { generateToken, setAuthCookie } from '../../auth/jwt';

export async function registerService(input: RegisterInput) {
  const validated = registerSchema.parse(input);

  const existingUser = await getUserByEmail(validated.email);
  if (existingUser) {
    throw new Error('User already exists');
  }

  const passwordHash = await hashPassword(validated.password);

  const newUser = await createUser({
    name: validated.name,
    email: validated.email,
    passwordHash,
    role: 'STUDENT', // Default role for open registration
  });

  const token = generateToken({ userId: newUser.id, role: newUser.role });
  await setAuthCookie(token);

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  };
}
