import { useCallback, useEffect, useState } from 'react';
import ListingCards from '../ListingCards.jsx';
import ListingCardSkeleton from '../ListingCardSkeleton.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const PREVIEW_COUNT = 3;

function StatCard({ label, value, caption }) {
  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted mb-2">
        {label}
      </div>
      <div className="text-2xl font-bold text-text">{value}</div>
      <div className="text-xs text-faint mt-1">{caption}</div>
    </div>
  );
}

function OperatorDashboard({ profile }) {
  const firstName = profile?.full_name?.split(' ')[0] || 'there';
  const citySubtitle = profile?.city
    ? `Searching within 25 miles of ${profile.city}`
    : 'Searching within 25 miles of your area';

  const [listings, setListings] = useState(null);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingsError, setListingsError] = useState(null);

  const fetchListings = useCallback(async (signal) => {
    try {
      const res = await fetch(`${API_URL}/api/listings`, { signal });
      const data = await res.json();
      if (signal?.aborted) return;
      if (!res.ok) {
        setListingsError(data.message || "Couldn't load listings");
        return;
      }
      setListings(data.listings || []);
    } catch (err) {
      if (signal?.aborted) return;
      console.error(err);
      setListingsError("Couldn't reach the server. Please try again.");
    } finally {
      if (!signal?.aborted) setListingsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    // fetchListings only sets state after an await, but the lint rule can't see that.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchListings(controller.signal);
    return () => controller.abort();
  }, [fetchListings]);

  const handleListingsRetry = () => {
    setListingsLoading(true);
    setListingsError(null);
    fetchListings();
  };

  const newMatchesValue = listings ? String(listings.length) : '—';
  const preview = listings ? listings.slice(0, PREVIEW_COUNT) : [];

  return (
    <div>
      <h1 className="text-xl font-bold text-text">Good morning, {firstName}</h1>
      <p className="text-sm text-muted mt-1">{citySubtitle}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <StatCard label="Waiting" value="—" caption="Hosts yet to respond" />
        <StatCard label="Accepted" value="—" caption="Ready to talk" />
        <StatCard label="New matches" value={newMatchesValue} caption="Since you last visited" />
        <StatCard
          label="Trust level"
          value={`${profile?.trust_level ?? 1} of 4`}
          caption="Verification coming soon"
        />
      </div>

      <div className="rounded-card border border-border bg-surface p-6 mt-6">
        <h2 className="text-sm font-bold text-text mb-1">Your requests</h2>
        <p className="text-sm text-muted">
          No requests yet. Once you send a placement request, you&apos;ll track it here.
        </p>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-text">New matches for you</h2>
          {listings && listings.length > PREVIEW_COUNT && (
            <span className="text-xs text-faint select-none cursor-default">
              See all {listings.length}
            </span>
          )}
        </div>

        {listingsLoading && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-4">
            <ListingCardSkeleton />
            <ListingCardSkeleton />
            <ListingCardSkeleton />
          </div>
        )}

        {!listingsLoading && listingsError && (
          <div className="rounded-card border border-border bg-surface p-6">
            <p className="text-sm text-muted mb-3">{listingsError}</p>
            <button
              type="button"
              onClick={handleListingsRetry}
              className="bg-accent text-accent-ink rounded-control px-4 py-2 text-sm hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent"
            >
              Retry
            </button>
          </div>
        )}

        {!listingsLoading && !listingsError && preview.length === 0 && (
          <div className="rounded-card border border-border bg-surface p-6">
            <p className="text-sm text-muted">No listings match yet.</p>
          </div>
        )}

        {!listingsLoading && !listingsError && preview.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-4">
            {preview.map((listing) => (
              <ListingCards key={listing.id} {...listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OperatorDashboard;
