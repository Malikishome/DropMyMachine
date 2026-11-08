import { describe, expect, it } from 'vitest';
import { buildListingsQuery } from '../src/browseQuery.js';

describe('buildListingsQuery', () => {
  it('returns an empty string when nothing is selected', () => {
    expect(buildListingsQuery()).toBe('');
    expect(buildListingsQuery({ machineTypes: [], footTraffic: null, city: '' })).toBe('');
  });

  it('joins machine types with a comma', () => {
    const params = new URLSearchParams(buildListingsQuery({ machineTypes: ['vending', 'atm'] }));
    expect(params.get('machine_type')).toBe('vending,atm');
  });

  it('includes foot traffic when set', () => {
    const params = new URLSearchParams(buildListingsQuery({ footTraffic: 'high' }));
    expect(params.get('foot_traffic')).toBe('high');
  });

  it('trims the city and skips it when only whitespace', () => {
    expect(new URLSearchParams(buildListingsQuery({ city: '  Tampa ' })).get('city')).toBe('Tampa');
    expect(buildListingsQuery({ city: '   ' })).toBe('');
  });

  it('encodes special characters in the city', () => {
    const query = buildListingsQuery({ city: '100% & more' });
    expect(query).not.toContain(' ');
    expect(new URLSearchParams(query).get('city')).toBe('100% & more');
  });

  it('is stable regardless of what extra fields are passed', () => {
    const query = buildListingsQuery({ machineTypes: ['ice'], radiusMiles: 25 });
    expect(query).toBe('machine_type=ice');
  });
});
