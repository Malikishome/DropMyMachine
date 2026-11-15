import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ListingCards from '../ListingCards.jsx';
import ListingCardSkeleton from '../ListingCardSkeleton.jsx';
import { countByStatus, requestStatusBadge, requestsByListing } from '../requestStatus.js';
import { formatRelativeDate } from '../listingCardFormat.js';
import { MACHINE_TYPES } from '../listingOptions.js';

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

function machineLabel(value) {
  return MACHINE_TYPES.find((option) => option.value === value)?.label ?? value;
}

function RequestsTable({ requests }) {
  return (
    <div className="rounded-card border border-border bg-surface overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            <th className="px-4 py-3">Listing</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Sent</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => {
            const badge = requestStatusBadge(request.status);
            return (
              <tr key={request.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="text-sm font-semibold text-text">
                    {machineLabel(request.listing?.machine_type)} · {request.listing?.city}
                  </div>
                  {request.message && (
                    <div className="text-xs text-muted line-clamp-1">{request.message}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${badge.className}`}>
                    {badge.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-muted">
                  {formatRelativeDate(request.created_at)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function OperatorDashboard({
  profile,
  myRequests,
  myRequestsLoading,
  myRequestsError,
  onMyRequestsRetry,
  onSendRequest,
}) {
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
  const requested = useMemo(() => requestsByListing(myRequests ?? []), [myRequests]);
  const counts = countByStatus(myRequests ?? []);
  const requestsReady = !myRequestsLoading && !myRequestsError;
  const countValue = (count) => (requestsReady ? String(count) : '—');

  return (
    <div>
      <h1 className="text-xl font-bold text-text">Good morning, {firstName}</h1>
      <p className="text-sm text-muted mt-1">{citySubtitle}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <StatCard label="Waiting" value={countValue(counts.pending)} caption="Hosts yet to respond" />
        <StatCard label="Accepted" value={countValue(counts.accepted)} caption="Ready to talk" />
        <StatCard label="New matches" value={newMatchesValue} caption="Since you last visited" />
        <StatCard
          label="Trust level"
          value={`${profile?.trust_level ?? 1} of 4`}
          caption="Verification coming soon"
        />
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-bold text-text mb-3">Your requests</h2>

        {myRequestsLoading && (
          <div className="rounded-card border border-border bg-surface p-6">
            <p className="text-sm text-muted">Loading your requests...</p>
          </div>
        )}

        {!myRequestsLoading && myRequestsError && (
          <div className="rounded-card border border-border bg-surface p-6">
            <p className="text-sm text-muted mb-3">{myRequestsError}</p>
            <button
              type="button"
              onClick={onMyRequestsRetry}
              className="bg-accent text-accent-ink rounded-control px-4 py-2 text-sm hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent"
            >
              Retry
            </button>
          </div>
        )}

        {requestsReady && myRequests.length === 0 && (
          <div className="rounded-card border border-border bg-surface p-6">
            <p className="text-sm text-muted">
              No requests yet. Once you send a placement request, you&apos;ll track it here.
            </p>
          </div>
        )}

        {requestsReady && myRequests.length > 0 && <RequestsTable requests={myRequests} />}
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-text">New matches for you</h2>
          {listings && listings.length > PREVIEW_COUNT && (
            <Link
              to="/dashboard/browse"
              className="text-xs font-semibold text-accent hover:text-accent-hover focus:outline-none focus:ring-2 focus:ring-accent rounded-control"
            >
              See all {listings.length}
            </Link>
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
              <ListingCards
                key={listing.id}
                {...listing}
                requested={requested.has(listing.id)}
                onSendRequest={() => onSendRequest(listing)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OperatorDashboard;
