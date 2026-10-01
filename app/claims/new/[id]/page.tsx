'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';

export default function NewClaimPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const [report, setReport] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/reports/${id}`);
        const data = await res.json();
        if (data.success && data.data.reportType === 'FOUND' && data.data.status === 'ACTIVE') {
          if (data.data.userId === user?.id) {
            toast.error("You cannot claim your own report.");
            router.push('/dashboard');
          } else {
            setReport(data.data);
          }
        } else {
          toast.error("This item cannot be claimed.");
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching report:', error);
      } finally {
        setLoadingReport(false);
      }
    };
    
    if (user) {
      fetchReport();
    }
  }, [id, router, user, loading]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingSubmit(true);
    
    const formData = new FormData(e.currentTarget);
    formData.append('foundReportId', id);
    
    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Claim submitted successfully. An admin will review it.');
        router.push('/dashboard');
      } else {
        toast.error(data.error?.message || 'Failed to submit claim');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loadingReport) return <div className="text-center py-20 animate-pulse">Loading...</div>;
  if (!report) return null;

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <Card className="border-border/50 shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Claim Item</CardTitle>
          <CardDescription>
            You are claiming: <span className="font-semibold text-foreground">{report.title}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="justification">Justification & Details <span className="text-destructive">*</span></Label>
              <Textarea 
                id="justification" 
                name="justification" 
                placeholder="Explain why this is yours. Provide specific details not visible in the public description or image." 
                rows={5} 
                required 
                minLength={10} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="proofImage">Proof of Ownership (Optional but recommended)</Label>
              <Input id="proofImage" name="proofImage" type="file" accept="image/jpeg, image/png, image/webp" />
              <p className="text-xs text-muted-foreground">Upload a past photo of you with the item, a receipt, or serial number.</p>
            </div>
            
            <Button type="submit" className="w-full" size="lg" disabled={loadingSubmit}>
              {loadingSubmit ? 'Submitting Claim...' : 'Submit Claim'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
