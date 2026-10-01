'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Package2, Search, ArrowRight, ShieldCheck, Zap, BellRing } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

export default function LandingPage() {
  const { user, loading } = useAuth();

  return (
    <div className="flex flex-col flex-1 items-center justify-center relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

      <div className="container px-4 md:px-6 z-10 flex flex-col items-center text-center space-y-8 py-24">
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
          Now live for the Fall Semester
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter max-w-[800px] bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/60">
          The smart way to find what you've lost.
        </h1>

        <p className="max-w-[600px] text-lg text-muted-foreground md:text-xl/relaxed">
          Report lost items, list found ones, and let our smart matching engine connect them instantly. Never rely on messy noticeboards again.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-8">
          {!loading && user ? (
            <>
              <Link href="/reports/lost/new" className="w-full sm:w-auto">
                <Button size="lg" className="w-full rounded-full group">
                  Report a Lost Item
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/reports/found/new" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full rounded-full">
                  I Found Something
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full rounded-full group">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/reports/lost" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full rounded-full">
                  Browse Items
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Feature Grid */}
      <div className="container px-4 md:px-6 py-20 mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 z-10 border-t border-border/50 bg-background/50 backdrop-blur-sm">
        <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-card border shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <Zap className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold">Smart Matching</h3>
          <p className="text-muted-foreground text-sm">
            Our algorithm automatically detects potential matches between lost and found reports based on category, keywords, and time.
          </p>
        </div>
        <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-card border shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold">Secure Claims</h3>
          <p className="text-muted-foreground text-sm">
            Claim items securely. Our admin review process ensures items are returned to their rightful owners with proof of ownership.
          </p>
        </div>
        <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-card border shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <BellRing className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold">Instant Alerts</h3>
          <p className="text-muted-foreground text-sm">
            Get notified instantly when a potential match is found or when the status of your claim changes.
          </p>
        </div>
      </div>
    </div>
  );
}
