import Link from 'next/link';
import { Package, Phone, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-white mt-auto">
      <div className="page-container py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Package className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm">Campus Lost & Found</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The official Lost & Found platform for VTU College. Helping students and staff recover their belongings safely.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/report/lost" className="hover:text-primary transition-colors">Report Lost Item</Link></li>
              <li><Link href="/report/found" className="hover:text-primary transition-colors">Report Found Item</Link></li>
              <li><Link href="/search" className="hover:text-primary transition-colors">Search Found Items</Link></li>
              <li><Link href="/track" className="hover:text-primary transition-colors">Track My Report</Link></li>
              <li><Link href="/admin" className="hover:text-primary transition-colors">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <span>Security Office, Ground Floor, Admin Block, VTU College Campus</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <span>+91 80 2345 6789</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <span>lostandfound@vtucollege.edu.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} VTU College. All rights reserved.</p>
          <p>Lost & Found items are stored at the Security Office for up to 30 days.</p>
        </div>
      </div>
    </footer>
  );
}
