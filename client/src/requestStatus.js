const STATUS_BADGES = {
  pending: { label: 'Pending', className: 'bg-pending/10 text-pending' },
  accepted: { label: 'Accepted', className: 'bg-success/10 text-success' },
  declined: { label: 'Declined', className: 'bg-surface-raised text-faint' },
};

const UNKNOWN_BADGE = { label: 'Unknown', className: 'bg-surface-raised text-faint' };

export function requestStatusBadge(status) {
  return STATUS_BADGES[status] ?? UNKNOWN_BADGE;
}

export function countByStatus(requests = []) {
  const counts = { pending: 0, accepted: 0, declined: 0 };
  for (const request of requests) {
    if (request?.status in counts) counts[request.status] += 1;
  }
  return counts;
}

// Keyed by listing id so a card can look up its own request in O(1).
export function requestsByListing(requests = []) {
  const map = new Map();
  for (const request of requests) {
    if (request?.listing_id) map.set(request.listing_id, request);
  }
  return map;
}
