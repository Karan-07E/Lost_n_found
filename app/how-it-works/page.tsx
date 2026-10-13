import Link from 'next/link';
import { ClipboardList, FileSearch, CheckCircle, RotateCcw, Shield, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How It Works — Campus Lost & Found',
  description: 'Learn how the Campus Lost & Found system works — from reporting to recovery.',
};

const STEPS = [
  {
    step: '01',
    icon: ClipboardList,
    title: 'Report',
    color: 'text-blue-600 bg-blue-50',
    description: 'Submit a report for an item you\'ve lost or found on campus.',
    details: [
      'No account or login required',
      'Provide item details, location, and your contact',
      'Upload a photo if available',
      'Receive a unique Report ID for tracking',
    ],
    cta: { href: '/report', label: 'Submit a Report' },
  },
  {
    step: '02',
    icon: FileSearch,
    title: 'Search & Match',
    color: 'text-purple-600 bg-purple-50',
    description: 'Search found items and look for a potential match.',
    details: [
      'Browse all found items by category and location',
      'Search by item name, description, or location',
      'Our system identifies potential matches automatically',
      'View item details safely — sensitive info is kept private',
    ],
    cta: { href: '/search', label: 'Search Found Items' },
  },
  {
    step: '03',
    icon: CheckCircle,
    title: 'Verify',
    color: 'text-orange-600 bg-orange-50',
    description: 'Submit an ownership claim with evidence that proves the item is yours.',
    details: [
      'Describe unique identifying features known only to the owner',
      'Optionally link your Lost Item Report ID',
      'Admin team reviews and verifies the claim',
      'Fraudulent claims are rejected to protect all users',
    ],
  },
  {
    step: '04',
    icon: RotateCcw,
    title: 'Recover',
    color: 'text-green-600 bg-green-50',
    description: 'Collect your verified item from the Security Office.',
    details: [
      'You\'ll be contacted via your provided contact number',
      'Bring your college ID for identity verification',
      'Collect from Security Office, Admin Block (Mon–Sat, 9–5)',
      'Items are stored safely for up to 30 days',
    ],
  },
];

const FAQS = [
  {
    q: 'Do I need to create an account or log in?',
    a: 'No. You can report lost/found items, search, and submit claims without any account. You only need a Report ID (provided after submission) to track your report.',
  },
  {
    q: 'How long are items kept at the Security Office?',
    a: 'Found items are stored at the Security Office for up to 30 days. After that, unclaimed items are donated or disposed of according to college policy.',
  },
  {
    q: 'Is my personal information safe?',
    a: 'Yes. Contact details are only visible to the admin team. Item listings do not expose sensitive or personal information publicly.',
  },
  {
    q: 'What if I found an item outside campus?',
    a: 'If you believe the item belongs to a student or staff member, you can still report it. Mention the location in the found item form.',
  },
  {
    q: 'Can anyone claim any item?',
    a: 'No. Each claim requires ownership evidence — specific details about the item that only the real owner would know. Our admin team reviews every claim before approval.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-white border-b border-border">
        <div className="page-container py-12 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-3">How It Works</h1>
          <p className="text-muted-foreground">
            A simple four-step process to report, search, verify, and recover lost belongings on campus.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="section bg-background">
        <div className="page-container max-w-4xl">
          <div className="space-y-10">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isEven = i % 2 === 1;
              return (
                <div key={step.step} className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center ${isEven ? 'md:[&>*:first-child]:order-last' : ''}`}>
                  {/* Content */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-4xl font-bold text-primary/20">{step.step}</span>
                      <div className={`p-2.5 rounded-full ${step.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground">{step.title}</h2>
                    </div>
                    <p className="text-muted-foreground mb-4">{step.description}</p>
                    <ul className="space-y-2">
                      {step.details.map((detail) => (
                        <li key={detail} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                    {step.cta && (
                      <Link href={step.cta.href} className="inline-block mt-4">
                        <Button variant="outline" size="sm">{step.cta.label}</Button>
                      </Link>
                    )}
                  </div>

                  {/* Illustration placeholder */}
                  <div className={`h-48 rounded-xl border border-border flex items-center justify-center text-5xl ${step.color.split(' ')[1]}`}>
                    <Icon className={`h-16 w-16 ${step.color.split(' ')[0]} opacity-30`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="section bg-muted/30 border-t border-border">
        <div className="page-container max-w-3xl">
          <h2 className="text-xl font-bold text-foreground text-center mb-8">Why Trust This System?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Privacy Protected', desc: 'Personal details are never shown publicly. Only admins can access reporter info.' },
              { icon: Clock, title: 'Secure Verification', desc: 'Every claim is reviewed by our admin team before any item is released.' },
              { icon: Users, title: 'Official Service', desc: 'Run by the college Security Department. All reports are managed officially.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center bg-white rounded-xl border border-border p-6">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/8">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-white border-t border-border">
        <div className="page-container max-w-2xl">
          <h2 className="text-xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="border border-border rounded-xl p-5">
                <h3 className="font-semibold text-foreground text-sm mb-2">{q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground">
        <div className="page-container py-10 text-center">
          <h2 className="text-xl font-bold mb-2">Ready to get started?</h2>
          <p className="text-primary-foreground/80 text-sm mb-5">Report a lost item or search for found ones right now.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/report/lost">
              <Button variant="secondary" size="lg">I Lost Something</Button>
            </Link>
            <Link href="/search">
              <Button variant="outline" size="lg" className="text-primary-foreground border-primary-foreground/40 hover:bg-primary-foreground/10">
                Search Found Items
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
