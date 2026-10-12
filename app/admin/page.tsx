import type { Metadata } from 'next';
import { AdminDashboard } from './admin-dashboard';

export const metadata: Metadata = {
  title: 'Admin Dashboard — Campus Lost & Found',
};

export default function AdminPage() {
  return <AdminDashboard />;
}
