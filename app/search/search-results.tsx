'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, X, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecentItemCard } from '@/components/recent-item-card';
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS } from '@/lib/constants';

type ReportRow = {
  id: string;
  reportId: string;
  title: string;
  category: string;
  location: string;
  eventDate: string;
  imagePath: string | null;
  status: string;
  createdAt: string;
  reportType: string;
  description: string;
};

type Props = {
  initialParams: {
    q?: string;
    category?: string;
    location?: string;
    type?: string;
  };
};

export function SearchResults({ initialParams }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialParams.q || '');
  const [category, setCategory] = useState(initialParams.category || '');
  const [location, setLocation] = useState(initialParams.location || '');
  const [type, setType] = useState(initialParams.type || '');
  const [results, setResults] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (category) params.set('category', category);
      if (location) params.set('location', location);
      if (type) params.set('type', type);
      params.set('limit', '30');

      const res = await fetch(`/api/reports?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setResults(data.data || []);
    } catch {
      setError('We couldn\'t load results right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [query, category, location, type]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    if (location) params.set('location', location);
    if (type) params.set('type', type);
    router.push(`/search?${params.toString()}`);
    fetchResults();
  };

  const clearFilters = () => {
    setQuery('');
    setCategory('');
    setLocation('');
    setType('');
    router.push('/search');
  };

  const hasFilters = query || category || location || type;

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-border rounded-xl p-4 space-y-3">
        {/* Main search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            id="search-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lost or found items..."
            className="form-input pl-9"
            aria-label="Search items"
          />
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            Filters:
          </div>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="form-input w-auto text-sm py-1.5"
            aria-label="Filter by report type"
          >
            <option value="">Lost & Found</option>
            <option value="LOST">Lost Reports</option>
            <option value="FOUND">Found Reports</option>
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-input w-auto text-sm py-1.5"
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {ITEM_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="form-input w-auto text-sm py-1.5"
            aria-label="Filter by location"
          >
            <option value="">All Locations</option>
            {CAMPUS_LOCATIONS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          <Button type="submit" size="sm" className="gap-1.5">
            <Search className="h-3.5 w-3.5" />
            Search
          </Button>

          {hasFilters && (
            <Button type="button" variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 text-muted-foreground">
              <X className="h-3.5 w-3.5" />
              Clear filters
            </Button>
          )}
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 border border-dashed border-destructive/30 rounded-xl">
          <p className="text-destructive font-medium">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={fetchResults}>Try again</Button>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-1">No matching items found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Try changing the category, location, or search terms.
          </p>
          <Button variant="outline" size="sm" onClick={clearFilters}>Clear Filters</Button>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{results.length}</span> result{results.length !== 1 ? 's' : ''}
            {hasFilters ? ' matching your filters' : ''}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((item) => (
              <RecentItemCard key={item.id} item={item as any} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
