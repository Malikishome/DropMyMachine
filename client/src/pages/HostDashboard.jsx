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

function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function HostDashboard({
  profile,
  myListings,
  myListingsLoading,
  myListingsError,
  onMyListingsRetry,
}) {
  const firstName = profile?.full_name?.split(' ')[0] || 'there';
  const activeCount = myListings
    ? myListings.filter((listing) => listing.status === 'active').length
    : 0;
  const subtitle = myListingsLoading
    ? 'Loading your listings...'
    : myListingsError
    ? 'Manage your listings'
    : `${activeCount} active listing${activeCount === 1 ? '' : 's'}`;

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-text">Good morning, {firstName}</h1>
          <p className="text-sm text-muted mt-1">{subtitle}</p>
        </div>
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="bg-accent text-accent-ink rounded-control px-4 py-2 text-sm font-semibold opacity-55 cursor-default select-none"
        >
          + New listing
        </button>
      </div>

      <div className="rounded-card border border-border bg-surface p-6 mt-6">
        <h2 className="text-sm font-bold text-text mb-1">Pending requests</h2>
        <p className="text-sm text-muted">
          No operators are waiting for a response yet. When someone sends a
          placement request, you&apos;ll see it here.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <StatCard label="Views" value="—" caption="Last 30 days" />
        <StatCard label="Requests" value="—" caption="Coming soon" />
        <StatCard label="Accepted" value="—" caption="Coming soon" />
        <StatCard
          label="Trust level"
          value={`${profile?.trust_level ?? 1} of 4`}
          caption="Verification coming soon"
        />
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-bold text-text mb-3">Your listings</h2>

        {myListingsLoading && (
          <div className="rounded-card border border-border bg-surface p-6">
            <p className="text-sm text-muted">Loading your listings...</p>
          </div>
        )}

        {!myListingsLoading && myListingsError && (
          <div className="rounded-card border border-border bg-surface p-6">
            <p className="text-sm text-muted mb-3">{myListingsError}</p>
            <button
              type="button"
              onClick={onMyListingsRetry}
              className="bg-accent text-accent-ink rounded-control px-4 py-2 text-sm hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent"
            >
              Retry
            </button>
          </div>
        )}

        {!myListingsLoading && !myListingsError && myListings.length === 0 && (
          <div className="rounded-card border border-border bg-surface p-6">
            <p className="text-sm text-muted">You don&apos;t have any listings yet.</p>
          </div>
        )}

        {!myListingsLoading && !myListingsError && myListings.length > 0 && (
          <div className="rounded-card border border-border bg-surface overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">Listing</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Views</th>
                  <th className="px-4 py-3">Requests</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {myListings.map((listing) => {
                  const isActive = listing.status === 'active';
                  return (
                    <tr key={listing.id} className="border-t border-border">
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-text">
                          {capitalize(listing.machine_type)} · {listing.city}
                        </div>
                        <div className="text-xs text-muted">
                          {listing.foot_traffic
                            ? `${capitalize(listing.foot_traffic)} traffic`
                            : ''}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-success/10 text-success'
                              : 'bg-surface-raised text-faint'
                          }`}
                        >
                          {isActive ? 'Active' : 'Filled'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">—</td>
                      <td className="px-4 py-3 text-sm text-muted">—</td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs text-faint select-none cursor-default mr-3"
                          aria-disabled="true"
                        >
                          Edit
                        </span>
                        <span
                          className="text-xs text-faint select-none cursor-default"
                          aria-disabled="true"
                        >
                          Pause
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default HostDashboard;
