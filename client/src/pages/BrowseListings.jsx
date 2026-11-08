import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useOutletContext } from 'react-router-dom';
import FilterPanel from '../FilterPanel.jsx';
import ListingCards from '../ListingCards.jsx';
import ListingCardSkeleton from '../ListingCardSkeleton.jsx';
import { buildListingsQuery } from '../browseQuery.js';
import { SORT_OPTIONS, sortListings } from '../browseSort.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const GRID_CLASS = 'grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-4';
const SEARCH_DEBOUNCE_MS = 300;

function BrowseListings() {
  const { profile } = useOutletContext();
  const isOperator = profile?.role === 'operator';

  const [filters, setFilters] = useState({ machineTypes: [], footTraffic: null });
  const [searchText, setSearchText] = useState('');
  const [city, setCity] = useState('');
  const [panelKey, setPanelKey] = useState(0);
  const [sortKey, setSortKey] = useState(SORT_OPTIONS[0].value);
  // result is tagged with the query it answers, so a stale response is never shown
  const [result, setResult] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const query = buildListingsQuery({ ...filters, city });
  const loading = !result || result.query !== query;

  const handleFilterChange = useCallback(({ machineTypes, footTraffic }) => {
    setFilters({ machineTypes, footTraffic });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setCity(searchText), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    if (!isOperator) return undefined;
    const controller = new AbortController();
    const url = `${API_URL}/api/listings${query ? `?${query}` : ''}`;

    (async () => {
      try {
        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();
        if (controller.signal.aborted) return;
        if (!res.ok) {
          setResult({ query, listings: null, error: data.message || "Couldn't load listings" });
          return;
        }
        setResult({ query, listings: data.listings || [], error: null });
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error(err);
        setResult({ query, listings: null, error: "Couldn't reach the server. Please try again." });
      }
    })();

    return () => controller.abort();
  }, [isOperator, query, reloadKey]);

  const sorted = useMemo(
    () => sortListings(result?.listings ?? [], sortKey),
    [result, sortKey]
  );

  if (!isOperator) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleRetry = () => {
    setResult(null);
    setReloadKey((key) => key + 1);
  };

  const handleClear = () => {
    setSearchText('');
    setCity('');
    setPanelKey((key) => key + 1);
  };

  const error = !loading ? result.error : null;
  const showResults = !loading && !error;
  const countLabel = showResults
    ? `${sorted.length} listing${sorted.length === 1 ? '' : 's'}`
    : 'Browse listings';

  return (
    <div>
      <div className="flex items-end justify-between gap-4 mb-4">
        <h1 className="text-xl font-bold text-text">{countLabel}</h1>
        <label className="flex items-center gap-2 text-sm text-muted">
          Sort
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="bg-input-bg border border-border rounded-control px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex gap-6 items-start">
        <div className="w-64 shrink-0 flex flex-col gap-4">
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by city"
            aria-label="Search by city"
            className="w-full bg-input-bg border border-border rounded-control px-3 py-2 text-sm text-text placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <FilterPanel key={panelKey} onChange={handleFilterChange} showRadius={false} />
        </div>

        <div className="flex-1 min-w-0">
          {loading && (
            <div className={GRID_CLASS}>
              {Array.from({ length: 6 }, (_, i) => (
                <ListingCardSkeleton key={i} />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="rounded-card border border-border bg-surface p-6">
              <p className="text-sm text-muted mb-3">{error}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="bg-accent text-accent-ink rounded-control px-4 py-2 text-sm hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent"
              >
                Retry
              </button>
            </div>
          )}

          {showResults && sorted.length === 0 && (
            <div className="rounded-card border border-border bg-surface p-6">
              <p className="text-sm text-muted mb-3">
                {query ? 'No listings match your filters.' : 'No listings are available yet.'}
              </p>
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="bg-accent text-accent-ink rounded-control px-4 py-2 text-sm hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {showResults && sorted.length > 0 && (
            <div className={GRID_CLASS}>
              {sorted.map((listing) => (
                <ListingCards key={listing.id} {...listing} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BrowseListings;
