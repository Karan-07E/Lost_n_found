'use client';

import Link from 'next/link';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white shadow-xs">
      <div className="w-full px-3 sm:px-6 lg:px-8">
        <div className="flex min-h-[76px] sm:min-h-[84px] py-2 items-center justify-start">
          {/* VVCE Official College Branding */}
          <Link
            href="/"
            className="flex items-center gap-3 sm:gap-4 group hover:opacity-95 transition-opacity"
            aria-label="Vidyavardhaka College of Engineering - Campus Lost & Found"
          >
            {/* VVCE Emblem */}
            <img
              src="/vvce-logo.png"
              alt="VVCE Logo"
              className="h-14 sm:h-16 md:h-[68px] w-auto object-contain shrink-0"
            />

            {/* Header Titles matching official format */}
            <div className="flex flex-col justify-center leading-tight">
              <span className="text-[11px] sm:text-xs text-neutral-500 font-medium tracking-tight">
                Vidyavardhaka Sangha ®, Mysore
              </span>
              <span className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-neutral-900 tracking-tight leading-tight pt-0.5">
                Vidyavardhaka College of Engineering
              </span>
              <span className="text-xs sm:text-sm md:text-base font-bold text-neutral-900 leading-tight pt-0.5">
                ವಿದ್ಯಾವರ್ಧಕ ತಾಂತ್ರಿಕ ಮಹಾವಿದ್ಯಾಲಯ
              </span>
              <span className="text-[11px] sm:text-xs md:text-sm text-neutral-500 font-normal leading-tight pt-0.5">
                Autonomous institute affiliated to VTU, Belagavi
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}

