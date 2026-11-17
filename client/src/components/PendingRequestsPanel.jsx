import { useState } from 'react';
import { operatorInitials, pendingRequests } from '../requestStatus.js';
import { formatRelativeDate } from '../listingCardFormat.js';

function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function PanelShell({ children }) {
  return <div className="rounded-card border border-border bg-surface p-6 mt-6">{children}</div>;
}

function RequestRow({ request, busy, error, onRespond }) {
  const { operator, listing } = request;
  const sent = formatRelativeDate(request.created_at)?.toLowerCase();
  const buttonClass =
    'rounded-control px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-55';

  return (
    <li className="border-t border-pending/20 first:border-t-0 px-5 py-4">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-raised text-xs font-bold text-accent">
          {operatorInitials(operator?.full_name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-text">{operator?.full_name || 'Operator'}</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-success/10 text-success">
              Trust level {operator?.trust_level ?? 1}
            </span>
            {sent && <span className="text-xs text-faint">Sent {sent}</span>}
          </div>
          <p className="text-xs text-muted mt-0.5">
            For {capitalize(listing?.machine_type)} · {listing?.city}
          </p>
          {request.message && <p className="text-sm text-text mt-1">&ldquo;{request.message}&rdquo;</p>}
          {error && (
            <p role="alert" className="mt-2 text-sm text-danger">
              {error}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => onRespond(request.id, 'declined')}
            className={`${buttonClass} border border-border text-text hover:bg-surface-raised`}
          >
            Decline
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onRespond(request.id, 'accepted')}
            className={`${buttonClass} bg-accent text-accent-ink hover:bg-accent-hover`}
          >
            Accept
          </button>
        </div>
      </div>
    </li>
  );
}

function PendingRequestsPanel({ requests, loading, error, onRetry, onRespond }) {
  const [busyId, setBusyId] = useState(null);
  const [rowErrors, setRowErrors] = useState({});

  const respond = async (id, status) => {
    setBusyId(id);
    setRowErrors((current) => ({ ...current, [id]: null }));
    try {
      await onRespond(id, status);
    } catch (err) {
      setRowErrors((current) => ({ ...current, [id]: err.message }));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <PanelShell>
        <p className="text-sm text-muted">Loading requests...</p>
      </PanelShell>
    );
  }

  if (error) {
    return (
      <PanelShell>
        <p className="text-sm text-muted mb-3">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="bg-accent text-accent-ink rounded-control px-4 py-2 text-sm hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent"
        >
          Retry
        </button>
      </PanelShell>
    );
  }

  const pending = pendingRequests(requests ?? []);

  if (pending.length === 0) {
    return (
      <PanelShell>
        <h2 className="text-sm font-bold text-text mb-1">Pending requests</h2>
        <p className="text-sm text-muted">
          No operators are waiting for a response yet. When someone sends a
          placement request, you&apos;ll see it here.
        </p>
      </PanelShell>
    );
  }

  return (
    <section className="rounded-card border border-pending/30 bg-pending-surface mt-6 overflow-hidden">
      <h2 className="px-5 py-4 text-sm font-bold text-pending">
        {pending.length} operator{pending.length === 1 ? ' is' : 's are'} waiting for your answer
      </h2>
      <ul className="border-t border-pending/20">
        {pending.map((request) => (
          <RequestRow
            key={request.id}
            request={request}
            busy={busyId === request.id}
            error={rowErrors[request.id]}
            onRespond={respond}
          />
        ))}
      </ul>
    </section>
  );
}

export default PendingRequestsPanel;
