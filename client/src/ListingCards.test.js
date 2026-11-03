import { describe, expect, it } from 'vitest';
import { formatPostedDate } from './ListingCards.jsx';

function daysAgo(days) {
  return new Date(Date.now() - days * 86400000).toISOString();
}

describe('formatPostedDate', () => {
  it('returns null for a missing date', () => {
    expect(formatPostedDate(null)).toBeNull();
    expect(formatPostedDate(undefined)).toBeNull();
  });

  it('returns null for an unparseable date', () => {
    expect(formatPostedDate('not-a-date')).toBeNull();
  });

  it('labels a date from today as "Posted today"', () => {
    expect(formatPostedDate(daysAgo(0))).toBe('Posted today');
  });

  it('labels yesterday as "Posted 1d ago"', () => {
    expect(formatPostedDate(daysAgo(1))).toBe('Posted 1d ago');
  });

  it('labels a date under a week old in days', () => {
    expect(formatPostedDate(daysAgo(5))).toBe('Posted 5d ago');
  });

  it('labels exactly one week old as "Posted 1 week ago"', () => {
    expect(formatPostedDate(daysAgo(7))).toBe('Posted 1 week ago');
  });

  it('labels multiple weeks old in weeks', () => {
    expect(formatPostedDate(daysAgo(20))).toBe('Posted 2 weeks ago');
  });
});
