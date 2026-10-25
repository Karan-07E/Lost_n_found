'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  LayoutGrid,
  Grid,
  List as ListIcon,
  Table as TableIcon,
  SlidersHorizontal,
  ChevronDown,
  Check,
  CheckCircle2,
  MapPin,
  Calendar,
  PlusCircle,
  X,
  Sparkles,
  Info,
  Loader2,
  FileText,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';
import { formatDate } from '@/lib/format';
import { ITEM_CATEGORIES } from '@/lib/constants';

export type ReportItem = {
  id: string;
  reportId: string;
  reportType: 'LOST' | 'FOUND';
  title: string;
  description: string;
  category: string;
  location: string;
  eventDate: string;
  eventTime?: string | null;
  status: string;
  adminNotes?: string | null;
  reporterName?: string;
  reporterContact?: string;
  reporterDept?: string | null;
  reporterUsn?: string | null;
  createdAt: string;
};

type ViewMode = 'large' | 'medium' | 'list' | 'details' | 'tiles';

const CATEGORY_ICONS: Record<string, string> = {
  'Mobile / Electronics': '📱',
  'ID Card': '🪪',
  'Wallet': '👛',
  'Bag / Backpack': '🎒',
  'Books / Notes': '📚',
  'Keys': '🔑',
  'Accessories': '⌚',
  'Documents': '📄',
  'Water Bottle': '💧',
  'Clothing': '👕',
  'Other': '📦',
};

export function HomeItemsView({ initialItems }: { initialItems: ReportItem[] }) {
  const [items, setItems] = useState<ReportItem[]>(initialItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'LOST' | 'FOUND'>('LOST'); // Default to LOST so user immediately sees what people lost!
  const [viewMode, setViewMode] = useState<ViewMode>('medium');
  const [viewMenuOpen, setViewMenuOpen] = useState(false);

  // "I Found This!" Modal state
  const [foundModalItem, setFoundModalItem] = useState<ReportItem | null>(null);
  const [finderName, setFinderName] = useState('');
  const [finderContact, setFinderContact] = useState('');
  const [foundLocation, setFoundLocation] = useState('');
  const [foundNotes, setFoundNotes] = useState('');
  const [submittingFound, setSubmittingFound] = useState(false);
  const [foundSuccessMessage, setFoundSuccessMessage] = useState<string | null>(null);
  const [foundError, setFoundError] = useState<string | null>(null);

  // "Verify & Collect Item" Modal state
  const [verifyModalItem, setVerifyModalItem] = useState<ReportItem | null>(null);
  const [ownerName, setOwnerName] = useState('');
  const [ownerUsn, setOwnerUsn] = useState('');
  const [ownerContact, setOwnerContact] = useState('');
  const [verifyAction, setVerifyAction] = useState<'COLLECTED' | 'CLAIM'>('COLLECTED');
  const [verifyNotes, setVerifyNotes] = useState('');
  const [submittingVerify, setSubmittingVerify] = useState(false);
  const [verifySuccessMessage, setVerifySuccessMessage] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Filter items
  const filteredItems = items.filter((item) => {
    if (typeFilter !== 'ALL' && item.reportType !== typeFilter) return false;
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchLoc = item.location.toLowerCase().includes(q);
      const matchId = item.reportId.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchLoc || matchId;
    }
    return true;
  });

  const handleOpenFoundModal = (item: ReportItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFoundModalItem(item);
    setFinderName('');
    setFinderContact('');
    setFoundLocation('');
    setFoundNotes('');
    setFoundSuccessMessage(null);
    setFoundError(null);
  };

  const handleOpenVerifyModal = (item: ReportItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setVerifyModalItem(item);
    setOwnerName(item.reporterName || '');
    setOwnerUsn(item.reporterUsn || '');
    setOwnerContact(item.reporterContact || '');
    setVerifyAction('COLLECTED');
    setVerifyNotes('');
    setVerifySuccessMessage(null);
    setVerifyError(null);
  };

  const handleSubmitFound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundModalItem) return;
    if (!finderName.trim() || !finderContact.trim() || !foundLocation.trim()) {
      setFoundError('Please fill in your name, contact number, and where the item is kept.');
      return;
    }

    setSubmittingFound(true);
    setFoundError(null);

    try {
      const res = await fetch(`/api/reports/${foundModalItem.id}/found`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finderName,
          finderContact,
          foundLocation,
          additionalNotes: foundNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit confirmation');

      const updatedNotes = data.data?.adminNotes || `Kept at: ${foundLocation}`;

      // Update local item status to VERIFICATION
      setItems((prev) =>
        prev.map((i) =>
          i.id === foundModalItem.id
            ? { ...i, status: 'VERIFICATION', adminNotes: updatedNotes }
            : i
        )
      );

      setFoundSuccessMessage(
        `Thank you! The report status is now "Verification". The owner has been notified and can collect it from: ${foundLocation}.`
      );
    } catch (err: any) {
      setFoundError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmittingFound(false);
    }
  };

  const handleSubmitVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyModalItem) return;
    if (!ownerName.trim() || !ownerUsn.trim() || !ownerContact.trim()) {
      setVerifyError('Please enter your Name, Student USN/ID, and Contact number.');
      return;
    }

    setSubmittingVerify(true);
    setVerifyError(null);

    try {
      const res = await fetch(`/api/reports/${verifyModalItem.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerName,
          ownerUsn,
          ownerContact,
          action: verifyAction,
          verificationNotes: verifyNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit verification');

      const newStatus = verifyAction === 'COLLECTED' ? 'RETURNED' : 'VERIFICATION';

      // Update local item status
      setItems((prev) =>
        prev.map((i) => (i.id === verifyModalItem.id ? { ...i, status: newStatus } : i))
      );

      setVerifySuccessMessage(
        verifyAction === 'COLLECTED'
          ? 'Great! The item is now marked as "Returned to Owner". This case is resolved.'
          : 'Ownership verification submitted! Security / Admin has been notified.'
      );
    } catch (err: any) {
      setVerifyError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmittingVerify(false);
    }
  };

  // Reusable action button renderer
  const renderItemAction = (item: ReportItem, className = '') => {
    if (item.status === 'RETURNED' || item.status === 'CLOSED') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
          <CheckCircle2 className="h-3.5 w-3.5" /> Returned
        </span>
      );
    }

    if (item.status === 'VERIFICATION') {
      return (
        <Button
          size="sm"
          onClick={(e) => handleOpenVerifyModal(item, e)}
          className={`bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs h-7 px-2.5 gap-1 shadow-xs ${className}`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Verify / Collect
        </Button>
      );
    }

    if (item.reportType === 'LOST') {
      return (
        <Button
          size="sm"
          onClick={(e) => handleOpenFoundModal(item, e)}
          className={`bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-7 px-2.5 gap-1 shadow-xs ${className}`}
        >
          <Check className="h-3.5 w-3.5" />
          I Found This!
        </Button>
      );
    }

    return (
      <Button
        size="sm"
        onClick={(e) => handleOpenVerifyModal(item, e)}
        className={`bg-primary hover:bg-primary/90 text-white font-semibold text-xs h-7 px-2.5 gap-1 shadow-xs ${className}`}
      >
        Claim Item
      </Button>
    );
  };

  return (
    <div className="w-full">
      {/* ─── TOP ACTION & STAT BAR ─────────────────────────────────────── */}
      <div className="bg-white border-b border-border shadow-xs">
        <div className="page-container py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                Campus Lost & Found
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Browse reports below. Found an item? Click{' '}
                <span className="font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  I Found This!
                </span>{' '}
                . Return it and {' '}
                <span className="font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  Verify 
                </span>{' '}
                to confirm handover.
              </p>
            </div>

          </div>

          {/* ─── CONTROLS TOOLBAR (SEARCH + TYPE + VIEWS MENU) ──────────── */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/60">
            {/* Filter Tabs: Lost vs Found vs All */}
            <div className="flex items-center bg-muted/80 p-1 rounded-lg border border-border/80">
              <button
                type="button"
                onClick={() => setTypeFilter('LOST')}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  typeFilter === 'LOST'
                    ? 'bg-white text-primary shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                🔴 Lost Items ({items.filter((i) => i.reportType === 'LOST').length})
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('FOUND')}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  typeFilter === 'FOUND'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                🟢 Found Items ({items.filter((i) => i.reportType === 'FOUND').length})
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  typeFilter === 'ALL'
                    ? 'bg-white text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All ({items.length})
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, location, category..."
                className="w-full pl-9 pr-8 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-background border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground font-medium"
            >
              <option value="ALL">All Categories</option>
              {ITEM_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* ─── WINDOWS EXPLORER STYLE VIEW MENU DROPDOWN ──────────────── */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setViewMenuOpen(!viewMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-medium hover:bg-muted transition-colors"
                aria-label="Change view"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="capitalize">View: {viewMode}</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>

              {viewMenuOpen && (
                <div
                  className="absolute right-0 mt-1 w-48 bg-white rounded-lg border border-border shadow-lg py-1.5 z-40 text-xs"
                  onClick={() => setViewMenuOpen(false)}
                >
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Layout
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewMode('large')}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-muted text-left"
                  >
                    <span className="flex items-center gap-2">
                      <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                      Extra large icons
                    </span>
                    {viewMode === 'large' && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('medium')}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-muted text-left"
                  >
                    <span className="flex items-center gap-2">
                      <Grid className="h-4 w-4 text-muted-foreground" />
                      Medium icons
                    </span>
                    {viewMode === 'medium' && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('tiles')}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-muted text-left"
                  >
                    <span className="flex items-center gap-2">
                      <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                      Tiles
                    </span>
                    {viewMode === 'tiles' && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-muted text-left"
                  >
                    <span className="flex items-center gap-2">
                      <ListIcon className="h-4 w-4 text-muted-foreground" />
                      List
                    </span>
                    {viewMode === 'list' && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('details')}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-muted text-left"
                  >
                    <span className="flex items-center gap-2">
                      <TableIcon className="h-4 w-4 text-muted-foreground" />
                      Details
                    </span>
                    {viewMode === 'details' && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── MAIN ITEMS CONTENT AREA ────────────────────────────────────── */}
      <div className="page-container py-8">
        <div className="w-full">
            {filteredItems.length === 0 ? (
              <div className="text-center py-16 bg-white border border-dashed border-border rounded-xl">
                <FileText className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground">No reports match your filter</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Try clearing the search or category filter. If you lost an item, submit a new report.
                </p>
                <Link href="/report/lost" className="inline-block mt-4">
                  <Button size="sm" className="gap-1.5">
                    <PlusCircle className="h-4 w-4" />
                    Report a Lost Item
                  </Button>
                </Link>
              </div>
            ) : viewMode === 'details' ? (
              /* ─── DETAILS TABLE VIEW ────────────────────────── */
              <div className="bg-white border border-border rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/60 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Report ID</th>
                        <th className="px-4 py-3">Item Name</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Location</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredItems.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <td className="px-4 py-3 font-mono font-medium text-muted-foreground">
                            {item.reportId}
                          </td>
                          <td className="px-4 py-3 font-semibold text-foreground">
                            <span className="mr-1.5">{CATEGORY_ICONS[item.category] || '📦'}</span>
                            {item.title}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{item.category}</td>
                          <td className="px-4 py-3 text-muted-foreground">{item.location}</td>
                          <td className="px-4 py-3 text-muted-foreground">{formatDate(item.eventDate)}</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={item.status} />
                          </td>
                          <td className="px-4 py-3 text-right">
                            {renderItemAction(item)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : viewMode === 'list' ? (
              /* ─── LIST VIEW ─────────────────────────────────── */
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-border rounded-lg p-3 hover:border-primary/50 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="text-2xl p-2 bg-muted/60 rounded-md shrink-0">
                        {CATEGORY_ICONS[item.category] || '📦'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground truncate">{item.title}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">{item.reportId}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 shrink-0" /> {item.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 shrink-0" /> {formatDate(item.eventDate)}
                          </span>
                        </p>
                        {item.status === 'VERIFICATION' && item.adminNotes && (
                          <p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded mt-1 font-medium inline-block truncate max-w-md">
                            📍 {item.adminNotes.split('\n')[0]}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge status={item.status} />
                      {renderItemAction(item)}
                    </div>
                  </div>
                ))}
              </div>
            ) : viewMode === 'tiles' ? (
              /* ─── TILES VIEW ────────────────────────────────── */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-border rounded-xl p-3.5 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start gap-3">
                        <div className="text-3xl p-2.5 bg-muted/60 rounded-lg shrink-0">
                          {CATEGORY_ICONS[item.category] || '📦'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[10px] font-mono text-muted-foreground">{item.reportId}</span>
                            <StatusBadge status={item.status} />
                          </div>
                          <h3 className="font-semibold text-sm text-foreground leading-tight truncate">
                            {item.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            📍 {item.location}
                          </p>
                        </div>
                      </div>

                      {item.status === 'VERIFICATION' && item.adminNotes && (
                        <div className="mt-2 text-[11px] bg-amber-50 text-amber-800 border border-amber-200 p-1.5 rounded-lg">
                          {item.adminNotes.split('\n')[0]}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">{formatDate(item.eventDate)}</span>
                      {renderItemAction(item)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* ─── LARGE OR MEDIUM ICONS (CARDS GRID) ────────── */
              <div
                className={`grid gap-4 ${
                  viewMode === 'large'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                }`}
              >
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header / Banner */}
                      <div className="bg-muted/40 p-4 border-b border-border/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{CATEGORY_ICONS[item.category] || '📦'}</span>
                          <div>
                            <span className="font-mono text-[10px] text-muted-foreground block">
                              {item.reportId}
                            </span>
                            <span className="text-xs font-semibold text-muted-foreground">
                              {item.category}
                            </span>
                          </div>
                        </div>
                        <StatusBadge status={item.status} />
                      </div>

                      {/* Card Body */}
                      <div className="p-4">
                        <h3 className="font-bold text-base text-foreground mb-1 leading-snug line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {item.description}
                        </p>

                        <div className="space-y-1 text-xs text-muted-foreground">
                          <p className="flex items-center gap-1.5 truncate">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                            <span>{item.location}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 shrink-0 text-primary" />
                            <span>Lost on {formatDate(item.eventDate)}</span>
                          </p>
                        </div>

                        {/* Location notice if item was located */}
                        {item.status === 'VERIFICATION' && item.adminNotes && (
                          <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-2 text-xs">
                            <span className="font-semibold block text-[11px] text-amber-700">📍 Located!</span>
                            <span className="line-clamp-2">{item.adminNotes.split('\n')[0]}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer / Direct Action */}
                    <div className="p-4 pt-0">
                      {renderItemAction(item, 'w-full')}
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>

      {/* ─── "I FOUND THIS ITEM!" MODAL ─────────────────────────────────── */}
      {foundModalItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-emerald-600 text-white p-5 flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-emerald-700/80 px-2.5 py-0.5 rounded-full text-[11px] font-semibold mb-1.5">
                  <Sparkles className="h-3 w-3" />
                  Inform Owner You Found It
                </div>
                <h3 className="text-lg font-bold leading-tight">
                  {foundModalItem.title}
                </h3>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Report ID: {foundModalItem.reportId} · Lost at {foundModalItem.location}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFoundModalItem(null)}
                className="text-emerald-100 hover:text-white p-1 rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {foundSuccessMessage ? (
                <div className="text-center py-4 space-y-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-foreground">Thank You so Much!</h4>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      {foundSuccessMessage}
                    </p>
                  </div>
                  <Button
                    onClick={() => setFoundModalItem(null)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmitFound} className="space-y-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Please provide where you deposited this item so the student can verify and collect it.
                  </p>

                  {foundError && (
                    <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-lg border border-destructive/20 font-medium">
                      {foundError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Where is the item right now? *
                    </label>
                    <input
                      type="text"
                      required
                      value={foundLocation}
                      onChange={(e) => setFoundLocation(e.target.value)}
                      placeholder="e.g. Security Desk Gate 2, Library Counter, Block B Room 304"
                      className="w-full text-xs p-2.5 border border-border rounded-lg bg-background focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={finderName}
                        onChange={(e) => setFinderName(e.target.value)}
                        placeholder="e.g. Ramesh"
                        className="w-full text-xs p-2.5 border border-border rounded-lg bg-background focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Your Phone Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={finderContact}
                        onChange={(e) => setFinderContact(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full text-xs p-2.5 border border-border rounded-lg bg-background focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={foundNotes}
                      onChange={(e) => setFoundNotes(e.target.value)}
                      placeholder="e.g. Handed over to security guard Suresh, ID checked"
                      className="w-full text-xs p-2.5 border border-border rounded-lg bg-background focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none resize-none"
                    />
                  </div>

                  <div className="pt-2 flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFoundModalItem(null)}
                      className="flex-1 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submittingFound}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1.5"
                    >
                      {submittingFound ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Confirming...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Confirm & Notify
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── "VERIFY & COLLECT ITEM" MODAL ──────────────────────────────── */}
      {verifyModalItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-amber-600 text-white p-5 flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-amber-700/80 px-2.5 py-0.5 rounded-full text-[11px] font-semibold mb-1.5">
                  <ShieldCheck className="h-3 w-3" />
                  Verification & Handover
                </div>
                <h3 className="text-lg font-bold leading-tight">
                  {verifyModalItem.title}
                </h3>
                <p className="text-xs text-amber-100 mt-0.5">
                  Report ID: {verifyModalItem.reportId} · Status: Verification
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVerifyModalItem(null)}
                className="text-amber-100 hover:text-white p-1 rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {verifySuccessMessage ? (
                <div className="text-center py-4 space-y-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-foreground">Status Updated!</h4>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      {verifySuccessMessage}
                    </p>
                  </div>
                  <Button
                    onClick={() => setVerifyModalItem(null)}
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmitVerify} className="space-y-4">
                  {/* Where it is kept banner */}
                  {verifyModalItem.adminNotes && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3 text-xs space-y-1">
                      <span className="font-bold flex items-center gap-1.5 text-amber-800">
                        <Building className="h-4 w-4" /> Item Location / Note:
                      </span>
                      <p className="whitespace-pre-line text-xs font-medium">
                        {verifyModalItem.adminNotes}
                      </p>
                    </div>
                  )}

                  {verifyError && (
                    <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-lg border border-destructive/20 font-medium">
                      {verifyError}
                    </div>
                  )}

                  {/* Action choice: Confirm item collected vs Submit claim proof */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Select Action:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setVerifyAction('COLLECTED')}
                        className={`p-2.5 rounded-lg border text-xs text-left font-medium transition-all ${
                          verifyAction === 'COLLECTED'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-600/20'
                            : 'border-border bg-background text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        <span className="font-bold block text-emerald-700">✓ Item Collected</span>
                        <span className="text-[10px] text-muted-foreground block mt-0.5">Mark report as Returned</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVerifyAction('CLAIM')}
                        className={`p-2.5 rounded-lg border text-xs text-left font-medium transition-all ${
                          verifyAction === 'CLAIM'
                            ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20'
                            : 'border-border bg-background text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        <span className="font-bold block text-primary">Verify Ownership</span>
                        <span className="text-[10px] text-muted-foreground block mt-0.5">Submit proof / not collected yet</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="e.g. Aditya Kumar"
                      className="w-full text-xs p-2.5 border border-border rounded-lg bg-background focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Student USN / ID *
                      </label>
                      <input
                        type="text"
                        required
                        value={ownerUsn}
                        onChange={(e) => setOwnerUsn(e.target.value)}
                        placeholder="e.g. 1VT22CS014"
                        className="w-full text-xs p-2.5 border border-border rounded-lg bg-background focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={ownerContact}
                        onChange={(e) => setOwnerContact(e.target.value)}
                        placeholder="e.g. 9123456789"
                        className="w-full text-xs p-2.5 border border-border rounded-lg bg-background focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      {verifyAction === 'COLLECTED' ? 'Handover Note (Optional)' : 'Ownership Proof / Details *'}
                    </label>
                    <textarea
                      rows={2}
                      required={verifyAction === 'CLAIM'}
                      value={verifyNotes}
                      onChange={(e) => setVerifyNotes(e.target.value)}
                      placeholder={
                        verifyAction === 'COLLECTED'
                          ? 'e.g. Collected from security desk Gate 2, ID verified'
                          : 'e.g. Dell service tag ends in 49B2, blue Spider-man keychain'
                      }
                      className="w-full text-xs p-2.5 border border-border rounded-lg bg-background focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none resize-none"
                    />
                  </div>

                  <div className="pt-2 flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setVerifyModalItem(null)}
                      className="flex-1 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submittingVerify}
                      className={`flex-1 text-white text-xs font-semibold gap-1.5 ${
                        verifyAction === 'COLLECTED'
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'bg-amber-600 hover:bg-amber-700'
                      }`}
                    >
                      {submittingVerify ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Submitting...
                        </>
                      ) : verifyAction === 'COLLECTED' ? (
                        <>
                          <Check className="h-4 w-4" />
                          Confirm Item Collected
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4" />
                          Submit Verification
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
