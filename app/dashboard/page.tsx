'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Here we'd ideally hit `/api/user/reports` but for now we can filter client side or add endpoint
        // Let's add `/api/user/reports` later, assuming it's available.
        const claimsRes = await fetch('/api/claims');
        if (claimsRes.ok) {
          const claimsData = await claimsRes.json();
          setClaims(claimsData.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>

      <Tabs defaultValue="claims" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="reports">My Reports</TabsTrigger>
          <TabsTrigger value="claims">My Claims</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>My Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">You haven't reported any items yet.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claims">
          <Card>
            <CardHeader>
              <CardTitle>My Claims</CardTitle>
            </CardHeader>
            <CardContent>
              {claims.length === 0 ? (
                <p className="text-muted-foreground text-sm">You haven't made any claims yet.</p>
              ) : (
                <div className="space-y-4">
                  {claims.map((claim) => (
                    <div key={claim.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{claim.reportTitle}</h4>
                        <p className="text-sm text-muted-foreground">Submitted on {new Date(claim.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={claim.status === 'APPROVED' ? 'default' : claim.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                        {claim.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
