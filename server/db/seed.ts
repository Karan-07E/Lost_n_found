import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/db';
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

async function main() {
  console.log('Seeding College Lost & Found database...');

  const sampleReports = [
    {
      reportId: 'LF-2026-00101',
      reportType: 'FOUND' as const,
      title: 'College ID Card - CSE Dept',
      description: 'Found a student ID card near the main cafeteria entrance on a wooden bench.',
      category: 'Cards & IDs',
      location: 'Central Cafeteria Ground Floor',
      eventDate: '2026-10-06',
      eventTime: '13:30',
      identifyingFeatures: 'USN: 1VT22CS089, Name: Rahul S., Blue lanyard with VTU logo',
      reporterName: 'Priya Sharma',
      reporterDept: 'ISE',
      reporterSemester: '5',
      reporterContact: '+91 98765 43210',
      reporterEmail: 'priya.sharma@college.edu',
      status: 'VERIFICATION' as const,
      adminNotes: 'Deposited at Security Desk Room 102',
    },
    {
      reportId: 'LF-2026-00102',
      reportType: 'FOUND' as const,
      title: 'Casio fx-991EX Scientific Calculator',
      description: 'Black and white casing scientific calculator left on desk row 4.',
      category: 'Electronics',
      location: 'Block B - Room 304 (Math Lecture Hall)',
      eventDate: '2026-10-07',
      eventTime: '11:15',
      identifyingFeatures: 'Small scratch near solar cell, initials "AK" written with silver marker on back battery cover',
      reporterName: 'Prof. Ramesh Rao',
      reporterDept: 'Mathematics',
      reporterContact: 'Ext 421',
      reporterEmail: 'ramesh.rao@college.edu',
      status: 'SUBMITTED' as const,
      adminNotes: 'With faculty coordinator',
    },
    {
      reportId: 'LF-2026-00103',
      reportType: 'LOST' as const,
      title: 'Black Fastrack Backpack with Laptop',
      description: 'Black waterproof backpack containing Dell Inspiron laptop, notebook, and blue water bottle.',
      category: 'Bags & Wallets',
      location: 'Central Library 2nd Floor Reading Hall',
      eventDate: '2026-10-07',
      eventTime: '16:00',
      identifyingFeatures: 'Spider-man keychain on main zipper puller, Dell service tag ending in 49B2',
      reporterName: 'Aditya Kumar',
      reporterUsn: '1VT22CS014',
      reporterDept: 'CSE',
      reporterSemester: '5',
      reporterContact: '+91 91234 56789',
      reporterEmail: 'aditya.k@college.edu',
      status: 'UNDER_REVIEW' as const,
    },
    {
      reportId: 'LF-2026-00104',
      reportType: 'FOUND' as const,
      title: 'Bunch of 3 Keys with Hero Splendor Keychain',
      description: 'Found near bike parking stand 3 close to the south gate.',
      category: 'Keys',
      location: 'Student Two-Wheeler Parking Lot B',
      eventDate: '2026-10-08',
      eventTime: '09:45',
      identifyingFeatures: 'Two Godrej cabinet keys and one bike key with red rubber cap',
      reporterName: 'Suresh (Campus Security)',
      reporterContact: 'Security Post Gate 2',
      status: 'SUBMITTED' as const,
      adminNotes: 'Handed over to Security Post 2',
    },
    {
      reportId: 'LF-2026-00105',
      reportType: 'LOST' as const,
      title: 'Apple AirPods Pro 2nd Gen Case',
      description: 'White AirPods charging case (without buds) lost between Seminar Hall 1 and Lab 4.',
      category: 'Electronics',
      location: 'Academic Block A Corridor',
      eventDate: '2026-10-08',
      eventTime: '14:20',
      identifyingFeatures: 'Matte green silicone protective case with small carabiner',
      reporterName: 'Sneha Patel',
      reporterUsn: '1VT23EC052',
      reporterDept: 'ECE',
      reporterSemester: '3',
      reporterContact: '+91 99887 76655',
      reporterEmail: 'sneha.p@college.edu',
      status: 'SUBMITTED' as const,
    },
  ];

  for (const item of sampleReports) {
    try {
      await db.insert(schema.reports).values(item).onConflictDoNothing();
      console.log(`Inserted report: ${item.reportId} - ${item.title}`);
    } catch (err: any) {
      console.log(`Report ${item.reportId} skipped or failed: ${err.message}`);
    }
  }

  console.log('Done seeding!');
  await client.end();
}

main().catch((e) => {
  console.error('Seed error:', e);
  process.exit(1);
});
