'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  Home,
  Search,
  Compass,
  HelpCircle,
  PlusCircle,
  AlertCircle,
  Shield,
  Menu,
  X,
  Phone,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu whenever route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/search', label: 'Browse & Search', icon: Search },
    { href: '/track', label: 'Track Report', icon: Compass },
    { href: '/how-it-works', label: 'How It Works', icon: HelpCircle },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-border shadow-xs transition-all">
      {/* 1. Official College Header Bar */}
      <div className="border-b border-neutral-100 bg-neutral-50/70">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between gap-3">
            {/* College Logo & Names */}
            <Link
              href="/"
              className="flex items-center gap-3 sm:gap-4 group hover:opacity-95 transition-opacity"
              aria-label="Vidyavardhaka College of Engineering - Campus Lost & Found"
            >
              <div className="relative h-12 w-10 sm:h-14 sm:w-12 shrink-0">
                <Image
                  src="/vvce-logo.png"
                  alt="VVCE Emblem"
                  fill
                  sizes="48px"
                  className="object-contain"
                  priority
                />
              </div>

              <div className="flex flex-col justify-center leading-tight">
                <span className="text-[10px] sm:text-[11px] text-neutral-500 font-medium tracking-tight">
                  Vidyavardhaka Sangha ®, Mysuru
                </span>
                <span className="text-xs sm:text-sm md:text-base font-bold text-neutral-900 tracking-tight leading-tight">
                  Vidyavardhaka College of Engineering
                </span>
                <span className="hidden sm:inline text-[11px] sm:text-xs font-semibold text-neutral-800 leading-tight">
                  ವಿದ್ಯಾವರ್ಧಕ ತಾಂತ್ರಿಕ ಮಹಾವಿದ್ಯಾಲಯ
                </span>
                <span className="text-[9px] sm:text-[10px] text-neutral-500 font-normal leading-tight">
                  Autonomous institute affiliated to VTU, Belagavi
                </span>
              </div>
            </Link>

            {/* Portal Badge on Desktop */}
            <div className="hidden md:flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-200/60">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                <span>Campus Lost &amp; Found Portal</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Desktop Primary Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            {navLinks.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? 'text-primary' : 'text-neutral-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Portal Badge (visible when desktop nav is hidden) */}
          <div className="flex md:hidden items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200/60">
              Lost &amp; Found
            </span>
          </div>

          {/* Desktop Action Buttons (Report Lost & Report Found) */}
          <div className="hidden md:flex items-center gap-2.5">
            <Link
              href="/report/lost"
              id="nav-report-lost-btn"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-rose-50 text-rose-700 border border-rose-200/70 hover:bg-rose-100/80 hover:border-rose-300 transition-all shadow-2xs"
            >
              <AlertCircle className="h-4 w-4 text-rose-600" />
              <span>Report Lost</span>
            </Link>

            <Link
              href="/report/found"
              id="nav-report-found-btn"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-600 hover:border-emerald-700 transition-all shadow-2xs"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Report Found</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/report/lost"
              className="px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-md"
            >
              Lost?
            </Link>
            <Link
              href="/report/found"
              className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-md"
            >
              Found?
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Mobile Slide-down Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-white shadow-xl animate-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-4 space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto">
            {/* Section 1: Explore & Browse */}
            <div>
              <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-3 mb-1.5">
                Navigation
              </div>
              <div className="space-y-1">
                {navLinks.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                        active
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${active ? 'text-primary' : 'text-neutral-500'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Actions */}
            <div>
              <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-3 mb-1.5">
                Report an Item
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/report/lost"
                  className="flex flex-col items-start gap-1 p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-900 hover:bg-rose-100/70 transition-colors"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                    <AlertCircle className="h-4 w-4 text-rose-600" />
                    <span>Report Lost</span>
                  </div>
                  <span className="text-[11px] text-rose-600/80">Lost something on campus</span>
                </Link>

                <Link
                  href="/report/found"
                  className="flex flex-col items-start gap-1 p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-900 hover:bg-emerald-100/70 transition-colors"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Report Found</span>
                  </div>
                  <span className="text-[11px] text-emerald-600/80">Turn in a found item</span>
                </Link>
              </div>
            </div>

            {/* Section 3: Verification */}
            <div className="pt-2 border-t border-neutral-100">
              <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-3 mb-1.5">
                Verification
              </div>
              <div className="space-y-1">
                <Link
                  href="/claim/status"
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-neutral-700 hover:bg-neutral-50"
                >
                  <span className="flex items-center gap-2.5">
                    <Shield className="h-4 w-4 text-neutral-500" />
                    Check Claim Status
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">CLM-...</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
