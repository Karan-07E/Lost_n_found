import { Suspense } from 'react';
import { SearchResults } from './search-results';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Found Items — Campus Lost & Found',
  description: 'Search and browse items reported found on campus. Find your lost belongings quickly.',
};

type Props = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    location?: string;
    type?: string;
    date?: string;
  }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div className="section">
      <div className="page-container">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Search Lost & Found Items</h1>
          <p className="text-muted-foreground mt-1">Browse all reported items or use filters to narrow your search.</p>
        </div>
        <Suspense fallback={<SearchSkeleton />}>
          <SearchResults initialParams={params} />
        </Suspense>
      </div>
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-12 bg-muted animate-pulse rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-56 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    </div>
  );
}
