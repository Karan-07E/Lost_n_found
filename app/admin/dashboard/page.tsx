'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [claims, setClaims] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const claimsRes = await fetch('/api/admin/claims/pending');
        if (claimsRes.ok) {
          const claimsData = await claimsRes.json();
          setClaims(claimsData.data);
        }
      } catch (error) {
        console.error('Error fetching admin data');
      }
    };
    if (user?.role === 'ADMIN') {
      fetchAdminData();
    }
  }, [user]);

  const handleClaimReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/admin/claims/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Claim ${status.toLowerCase()} successfully`);
        setClaims(claims.filter(c => c.id !== id));
      } else {
        const data = await res.json();
        toast.error(data.error?.message || 'Action failed');
      }
    } catch (e) {
      toast.error('An error occurred');
    }
  };

  if (loading || user?.role !== 'ADMIN') return null;

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-destructive">Admin Dashboard</h1>

      <Tabs defaultValue="claims" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="claims">Pending Claims</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="claims">
          <Card>
            <CardHeader>
              <CardTitle>Review Claims</CardTitle>
              <CardDescription>Approve or reject ownership claims for found items.</CardDescription>
            </CardHeader>
            <CardContent>
              {claims.length === 0 ? (
                <p className="text-muted-foreground text-sm">No pending claims.</p>
              ) : (
                <div className="space-y-6">
                  {claims.map((claim) => (
                    <div key={claim.id} className="p-4 border rounded-lg bg-card/50">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">Report: {claim.report.title}</h4>
                          <p className="text-sm text-muted-foreground">Claimant: {claim.claimant.name} ({claim.claimant.email})</p>
                        </div>
                        <Badge variant="outline" className="border-orange-500 text-orange-500">PENDING</Badge>
                      </div>
                      <div className="mb-4 p-3 bg-muted rounded-md text-sm">
                        <p className="font-semibold mb-1">Justification:</p>
                        <p>{claim.justification}</p>
                      </div>
                      <div className="flex gap-3">
                        <Button onClick={() => handleClaimReview(claim.id, 'APPROVED')} className="bg-green-600 hover:bg-green-700">Approve & Mark Recovered</Button>
                        <Button variant="destructive" onClick={() => handleClaimReview(claim.id, 'REJECTED')}>Reject Claim</Button>
                      </div>
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
