'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ITEM_CATEGORIES } from '@/lib/constants';

export function QuickSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    params.set('type', 'FOUND');
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3" role="search" aria-label="Quick search for found items">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          id="quick-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for an item..."
          className="form-input pl-9"
          aria-label="Search found items"
        />
      </div>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="form-input sm:w-48"
        aria-label="Filter by category"
      >
        <option value="">All Categories</option>
        {ITEM_CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      <Button type="submit" className="shrink-0 gap-2">
        <Search className="h-4 w-4" />
        Search
      </Button>
    </form>
  );
}
