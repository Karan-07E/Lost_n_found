'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function NewReportPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = use(params);
  const isLost = type === 'lost';
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  
  if (!loading && !user) {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingSubmit(true);
    
    const formData = new FormData(e.currentTarget);
    formData.append('reportType', isLost ? 'LOST' : 'FOUND');
    
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success(`Successfully reported ${isLost ? 'lost' : 'found'} item!`);
        router.push('/dashboard');
      } else {
        toast.error(data.error?.message || 'Failed to submit report');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <Card className="border-border/50 shadow-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Report a {isLost ? 'Lost' : 'Found'} Item</CardTitle>
          <CardDescription>
            Provide as much detail as possible to help us match it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
              <Input id="title" name="title" placeholder={isLost ? "e.g. Lost Black Leather Wallet" : "e.g. Found Black Wallet near Library"} required minLength={3} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Documents">Documents</SelectItem>
                    <SelectItem value="ID Cards">ID Cards</SelectItem>
                    <SelectItem value="Wallet/Purse">Wallet/Purse</SelectItem>
                    <SelectItem value="Keys">Keys</SelectItem>
                    <SelectItem value="Clothing">Clothing</SelectItem>
                    <SelectItem value="Books">Books</SelectItem>
                    <SelectItem value="Accessories">Accessories</SelectItem>
                    <SelectItem value="Bags">Bags</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location <span className="text-destructive">*</span></Label>
                <Input id="location" name="location" placeholder={isLost ? "Where did you lose it?" : "Where did you find it?"} required />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="eventDate">Date <span className="text-destructive">*</span></Label>
                <Input id="eventDate" name="eventDate" type="date" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="eventTime">Time (Approximate)</Label>
                <Input id="eventTime" name="eventTime" type="time" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
              <Textarea id="description" name="description" placeholder="Describe the item's appearance, brand, color, distinguishing marks, etc." rows={4} required minLength={10} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">Upload Image (Optional)</Label>
              <Input id="image" name="image" type="file" accept="image/jpeg, image/png, image/webp" />
              <p className="text-xs text-muted-foreground">Max 5MB. JPEG, PNG or WebP.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactInfo">Contact Info (Optional)</Label>
              <Input id="contactInfo" name="contactInfo" placeholder="Phone number or preferred contact method" />
            </div>
            
            <Button type="submit" className="w-full" size="lg" disabled={loadingSubmit}>
              {loadingSubmit ? 'Submitting...' : 'Submit Report'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
