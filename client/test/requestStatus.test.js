import { describe, expect, it } from 'vitest';
import { countByStatus, requestStatusBadge, requestsByListing } from '../src/requestStatus.js';

describe('requestStatusBadge', () => {
  it('maps each known status to a label and class', () => {
    expect(requestStatusBadge('pending').label).toBe('Pending');
    expect(requestStatusBadge('accepted').label).toBe('Accepted');
    expect(requestStatusBadge('declined').label).toBe('Declined');
    expect(requestStatusBadge('accepted').className).toContain('text-success');
  });

  it('falls back to Unknown for anything else', () => {
    expect(requestStatusBadge('withdrawn').label).toBe('Unknown');
    expect(requestStatusBadge(undefined).label).toBe('Unknown');
  });
});

describe('countByStatus', () => {
  it('returns zeros for an empty or missing list', () => {
    expect(countByStatus([])).toEqual({ pending: 0, accepted: 0, declined: 0 });
    expect(countByStatus()).toEqual({ pending: 0, accepted: 0, declined: 0 });
  });

  it('counts each status and ignores unknown ones', () => {
    const requests = [
      { status: 'pending' },
      { status: 'pending' },
      { status: 'accepted' },
      { status: 'bogus' },
      null,
    ];
    expect(countByStatus(requests)).toEqual({ pending: 2, accepted: 1, declined: 0 });
  });
});

describe('requestsByListing', () => {
  it('keys requests by listing_id', () => {
    const a = { id: 'r1', listing_id: 'l1' };
    const b = { id: 'r2', listing_id: 'l2' };
    const map = requestsByListing([a, b]);
    expect(map.get('l1')).toBe(a);
    expect(map.get('l2')).toBe(b);
    expect(map.has('l3')).toBe(false);
  });

  it('skips entries without a listing_id', () => {
    expect(requestsByListing([{ id: 'r1' }, null]).size).toBe(0);
  });
});
