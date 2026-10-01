'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function ReportsPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = use(params);
  const isLost = type === 'lost';
  const typeQuery = isLost ? 'LOST' : 'FOUND';

  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(`/api/reports?type=${typeQuery}`);
        const data = await res.json();
        if (data.success) {
          setReports(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [typeQuery]);

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">{isLost ? 'Lost Items' : 'Found Items'}</h1>
          <p className="text-muted-foreground mt-1">
            Browse items that have been {isLost ? 'reported lost' : 'found'} on campus.
          </p>
        </div>
        <Link href={`/reports/${type}/new`}>
          <Button>Report {isLost ? 'Lost' : 'Found'} Item</Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="h-64 animate-pulse bg-muted/50 border-border/50" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
          <h3 className="text-xl font-semibold mb-2">No {isLost ? 'lost' : 'found'} items</h3>
          <p className="text-muted-foreground">There are currently no items in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <Card key={report.id} className="overflow-hidden flex flex-col transition-all hover:shadow-md border-border/50">
              <div className="aspect-video relative bg-muted flex items-center justify-center overflow-hidden">
                {report.imagePath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/uploads/${report.imagePath}`}
                    alt={report.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-muted-foreground text-sm">No image available</span>
                )}
                <Badge className="absolute top-2 right-2" variant={report.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {report.status}
                </Badge>
              </div>
              <CardContent className="p-5 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1">{report.title}</h3>
                </div>
                <Badge variant="outline" className="mb-4 bg-primary/5 text-primary border-primary/20">{report.category}</Badge>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{report.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(report.eventDate), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-5 pt-0 border-t bg-muted/10">
                <Link href={`/reports/item/${report.id}`} className="w-full">
                  <Button variant="ghost" className="w-full text-primary hover:text-primary hover:bg-primary/10">
                    View Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
