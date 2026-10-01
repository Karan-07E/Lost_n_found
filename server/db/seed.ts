import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import * as dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/db';
const sql = neon(connectionString);
const db = drizzle({ client: sql, schema });

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('admin123', 10);

  try {
    await db.insert(schema.users).values({
      name: 'System Admin',
      email: 'admin@college.edu',
      passwordHash,
      role: 'ADMIN',
    });
    console.log('Created admin user: admin@college.edu / admin123');
  } catch (e: any) {
    if (e.code === '23505') {
      console.log('Admin user already exists.');
    } else {
      console.error('Error creating admin user:', e);
    }
  }

  // Create a sample student
  try {
    const studentPassword = await bcrypt.hash('student123', 10);
    await db.insert(schema.users).values({
      name: 'John Student',
      email: 'john@college.edu',
      passwordHash: studentPassword,
      role: 'STUDENT',
    });
    console.log('Created student user: john@college.edu / student123');
  } catch (e: any) {
    if (e.code === '23505') {
      console.log('Student user already exists.');
    }
  }

  console.log('Done seeding!');
}

main().catch((e) => {
  console.error('Seed error:', e);
  process.exit(1);
});
