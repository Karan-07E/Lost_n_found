import Link from 'next/link';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { StatusBadge } from './status-badge';

type Item = {
  id: string;
  reportId: string;
  title: string;
  category: string;
  location: string;
  eventDate: string;
  imagePath: string | null;
  status: string;
  createdAt: Date;
};

export function RecentItemCard({ item }: { item: Item }) {
  const categoryEmoji: Record<string, string> = {
    'Mobile / Electronics': '📱',
    'ID Card': '🪪',
    'Wallet': '👛',
    'Bag / Backpack': '🎒',
    'Keys': '🔑',
    'Books / Notes': '📚',
    'Accessories': '⌚',
    'Documents': '📄',
    'Water Bottle': '💧',
    'Clothing': '👕',
  };

  const emoji = categoryEmoji[item.category] || '📦';

  return (
    <Link
      href={`/items/${item.id}`}
      className="group block bg-white border border-border rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-sm transition-all focus-ring"
      aria-label={`View found item: ${item.title} near ${item.location}`}
    >
      {/* Image placeholder or category icon */}
      <div className="h-36 bg-muted flex items-center justify-center text-4xl border-b border-border">
        {item.imagePath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imagePath}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span role="img" aria-label={item.category}>{emoji}</span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {item.title}
          </h3>
          <StatusBadge status={item.status} />
        </div>

        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
          <span className="text-xs">{emoji}</span> {item.category}
        </p>

        <div className="flex flex-col gap-1 text-xs text-muted-foreground mt-2">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 shrink-0" />
            {item.location}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3 shrink-0" />
            {formatDate(item.eventDate)}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-mono">{item.reportId}</span>
          <span className="text-xs text-primary font-medium flex items-center gap-1 group-hover:gap-1.5 transition-all">
            View <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
