import { FOOT_TRAFFIC_OPTIONS, LOCATION_TYPES, MACHINE_TYPES } from './listingOptions.js';

export const EMPTY_LISTING_FORM = {
  machine_type: '',
  location_type: '',
  city: '',
  address: '',
  description: '',
  foot_traffic: '',
};

const isAllowed = (options, value) => options.some((option) => option.value === value);

// Mirrors backend/utils/listingValidation.js so most mistakes show up before a
// request is sent; the server stays the source of truth.
export function validateListingForm(form) {
  const errors = {};
  const payload = {
    machine_type: form.machine_type,
    location_type: form.location_type,
    city: form.city.trim(),
    address: form.address.trim(),
    description: form.description.trim(),
    foot_traffic: form.foot_traffic,
  };

  if (!isAllowed(MACHINE_TYPES, payload.machine_type)) {
    errors.machine_type = 'Choose a machine type';
  }
  if (!payload.city) errors.city = 'Enter a city';
  if (!payload.description) errors.description = 'Add a short description';
  if (payload.location_type && !isAllowed(LOCATION_TYPES, payload.location_type)) {
    errors.location_type = 'Choose a location type';
  }
  if (payload.foot_traffic && !isAllowed(FOOT_TRAFFIC_OPTIONS, payload.foot_traffic)) {
    errors.foot_traffic = 'Choose a foot traffic level';
  }

  return { errors, payload };
}

export function listingToForm(listing) {
  return {
    machine_type: listing.machine_type ?? '',
    location_type: listing.location_type ?? '',
    city: listing.city ?? '',
    address: listing.address ?? '',
    description: listing.description ?? '',
    foot_traffic: listing.foot_traffic ?? '',
  };
}
