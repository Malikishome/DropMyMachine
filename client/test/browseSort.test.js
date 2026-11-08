import { describe, expect, it } from 'vitest';
import { SORT_OPTIONS, sortListings } from '../src/browseSort.js';

const listing = (id, foot_traffic, created_at) => ({ id, foot_traffic, created_at });

describe('sortListings', () => {
  it('returns an empty array for no listings', () => {
    expect(sortListings([], 'newest')).toEqual([]);
    expect(sortListings([], 'traffic')).toEqual([]);
  });

  it('sorts newest first', () => {
    const result = sortListings(
      [listing('a', 'low', '2026-11-01'), listing('b', 'low', '2026-11-05'), listing('c', 'low', '2026-11-03')],
      'newest'
    );
    expect(result.map((l) => l.id)).toEqual(['b', 'c', 'a']);
  });

  it('sorts by traffic high to low, ties broken by newest', () => {
    const result = sortListings(
      [
        listing('a', 'low', '2026-11-05'),
        listing('b', 'high', '2026-11-01'),
        listing('c', 'high', '2026-11-04'),
        listing('d', 'medium', '2026-11-02'),
      ],
      'traffic'
    );
    expect(result.map((l) => l.id)).toEqual(['c', 'b', 'd', 'a']);
  });

  it('puts missing foot_traffic last when sorting by traffic', () => {
    const result = sortListings(
      [listing('a', null, '2026-11-05'), listing('b', 'low', '2026-11-01')],
      'traffic'
    );
    expect(result.map((l) => l.id)).toEqual(['b', 'a']);
  });

  it('puts missing or invalid created_at last when sorting newest', () => {
    const result = sortListings(
      [listing('a', 'low', undefined), listing('b', 'low', '2026-11-01'), listing('c', 'low', 'nope')],
      'newest'
    );
    expect(result[0].id).toBe('b');
  });

  it('falls back to newest for an unknown sort key', () => {
    const result = sortListings(
      [listing('a', 'high', '2026-11-01'), listing('b', 'low', '2026-11-05')],
      'bogus'
    );
    expect(result.map((l) => l.id)).toEqual(['b', 'a']);
  });

  it('does not mutate its input', () => {
    const input = [listing('a', 'low', '2026-11-01'), listing('b', 'high', '2026-11-05')];
    const snapshot = [...input];
    sortListings(input, 'traffic');
    expect(input).toEqual(snapshot);
  });
});

describe('SORT_OPTIONS', () => {
  it('lists newest first as the default', () => {
    expect(SORT_OPTIONS[0].value).toBe('newest');
  });
});
