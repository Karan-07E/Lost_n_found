'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Clock, AlertCircle, ChevronLeft, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function ItemDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/reports/${id}`);
        const data = await res.json();
        if (data.success) {
          setReport(data.data);
        } else {
          router.push('/404');
        }
      } catch (error) {
        console.error('Error fetching report:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id, router]);

  if (loading) {
    return <div className="container mx-auto py-20 text-center animate-pulse">Loading item details...</div>;
  }

  if (!report) return null;

  const isOwner = user?.id === report.userId;
  const canClaim = user && !isOwner && report.reportType === 'FOUND' && report.status === 'ACTIVE';

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6 -ml-4 text-muted-foreground">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="aspect-square relative rounded-xl overflow-hidden bg-muted border flex items-center justify-center">
            {report.imagePath ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/uploads/${report.imagePath}`}
                alt={report.title}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex flex-col items-center text-muted-foreground">
                <AlertCircle className="h-12 w-12 mb-2 opacity-20" />
                <span>No image provided</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Badge variant={report.reportType === 'LOST' ? 'destructive' : 'default'} className="uppercase">
                {report.reportType}
              </Badge>
              <Badge variant="outline" className={
                report.status === 'ACTIVE' ? 'border-green-500/50 text-green-600 dark:text-green-400' : ''
              }>
                {report.status}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{report.title}</h1>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-transparent">
              {report.category}
            </Badge>
          </div>

          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-muted-foreground">{report.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Date</p>
                  <p className="text-muted-foreground">{format(new Date(report.eventDate), 'MMMM d, yyyy')}</p>
                </div>
              </div>
              {report.eventTime && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Approximate Time</p>
                    <p className="text-muted-foreground">{report.eventTime}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div>
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{report.description}</p>
          </div>

          {canClaim && (
            <div className="pt-6 border-t">
              <Link href={`/claims/new/${report.id}`}>
                <Button size="lg" className="w-full text-md h-12 rounded-full group">
                  Claim this Item
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          )}

          {isOwner && (
            <div className="pt-6 border-t p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-sm font-medium text-muted-foreground">You are the owner of this report.</p>
              {report.status === 'ACTIVE' && (
                <div className="flex gap-2 justify-center mt-4">
                  <Button variant="outline" size="sm">Edit Report</Button>
                  <Button variant="destructive" size="sm">Mark Closed</Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
