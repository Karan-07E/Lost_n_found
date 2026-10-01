'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.data);
        }
      } catch (error) {
        console.error('Error fetching notifications');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchNotifications();
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-10 px-4">
      <div className="flex items-center gap-3 mb-8">
        <Bell className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Notifications</h1>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <Card className="h-24" /><Card className="h-24" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border rounded-lg border-dashed">
          No notifications yet.
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <Card key={notif.id} className={notif.read ? 'bg-muted/30 border-border/50' : 'border-primary/30 shadow-sm bg-card/80'}>
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className={`text-sm md:text-base ${notif.read ? 'text-muted-foreground' : 'font-medium'}`}>
                    {notif.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </p>

                  {notif.relatedReportId && (
                    <Link href={`/reports/item/${notif.relatedReportId}`}>
                      <Button variant="link" className="px-0 h-auto text-xs mt-2">View Report</Button>
                    </Link>
                  )}
                </div>
                {!notif.read && (
                  <Button variant="ghost" size="icon" onClick={() => markAsRead(notif.id)} title="Mark as read">
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
