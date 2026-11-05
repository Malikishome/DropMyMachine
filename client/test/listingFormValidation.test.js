import { describe, expect, it } from 'vitest';
import {
  EMPTY_LISTING_FORM,
  listingToForm,
  validateListingForm,
} from '../src/listingFormValidation.js';

const validForm = {
  ...EMPTY_LISTING_FORM,
  machine_type: 'vending',
  city: 'Orlando',
  description: 'Hotel lobby, 200 rooms',
};

describe('validateListingForm', () => {
  it('accepts the minimum required fields', () => {
    expect(validateListingForm(validForm).errors).toEqual({});
  });

  it('reports every missing required field on an empty form', () => {
    const { errors } = validateListingForm(EMPTY_LISTING_FORM);
    expect(Object.keys(errors).sort()).toEqual(['city', 'description', 'machine_type']);
  });

  it('treats whitespace-only text as missing and trims the payload', () => {
    const { errors, payload } = validateListingForm({
      ...validForm,
      city: '   ',
      description: '  Lobby  ',
      address: '  1 Main St ',
    });
    expect(errors.city).toBeDefined();
    expect(payload.description).toBe('Lobby');
    expect(payload.address).toBe('1 Main St');
  });

  it('rejects a machine type outside the options', () => {
    expect(validateListingForm({ ...validForm, machine_type: 'toaster' }).errors.machine_type).toBeDefined();
  });

  it('allows blank optional selects but rejects unknown values', () => {
    expect(validateListingForm(validForm).errors.location_type).toBeUndefined();
    expect(validateListingForm({ ...validForm, location_type: 'castle' }).errors.location_type).toBeDefined();
    expect(validateListingForm({ ...validForm, foot_traffic: 'extreme' }).errors.foot_traffic).toBeDefined();
  });
});

describe('listingToForm', () => {
  it('turns null fields from the API into empty strings', () => {
    const form = listingToForm({ machine_type: 'atm', city: 'Tampa', address: null, location_type: null });
    expect(form).toEqual({
      machine_type: 'atm',
      location_type: '',
      city: 'Tampa',
      address: '',
      description: '',
      foot_traffic: '',
    });
  });
});
