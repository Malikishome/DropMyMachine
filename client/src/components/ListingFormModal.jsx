import { useEffect, useState } from 'react';
import { FOOT_TRAFFIC_OPTIONS, LOCATION_TYPES, MACHINE_TYPES } from '../listingOptions.js';
import {
  EMPTY_LISTING_FORM,
  listingToForm,
  validateListingForm,
} from '../listingFormValidation.js';

const inputClass =
  'w-full bg-input-bg border border-border rounded-control px-3 py-2 text-sm text-text placeholder:text-faint focus:outline-none focus:border-input-border-focus focus:ring-2 focus:ring-accent/20';

function Field({ label, htmlFor, error, optional, children }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5"
      >
        {label}
        {optional && <span className="ml-1 normal-case font-normal text-faint">(optional)</span>}
      </label>
      {children}
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}

function SelectField({ id, value, onChange, options, placeholder, autoFocus }) {
  return (
    <select
      id={id}
      value={value}
      onChange={onChange}
      autoFocus={autoFocus}
      className={inputClass}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

// onSubmit(payload) should throw on failure; an error with `fieldErrors`
// (the API's 400 `errors` object) is shown next to the matching inputs.
function ListingFormModal({ listing, onSubmit, onClose }) {
  const isEdit = Boolean(listing);
  const [form, setForm] = useState(listing ? listingToForm(listing) : EMPTY_LISTING_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (saving) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saving, onClose]);

  const setField = (name) => (event) => {
    setForm((prev) => ({ ...prev, [name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { errors: formErrors, payload } = validateListingForm(form);
    setErrors(formErrors);
    setServerError(null);
    if (Object.keys(formErrors).length > 0) return;

    setSaving(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      setErrors(err.fieldErrors || {});
      setServerError(err.message || "Couldn't save the listing. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="listing-form-title"
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-lg max-h-full overflow-y-auto rounded-card border border-border bg-surface shadow-card p-6"
      >
        <h2 id="listing-form-title" className="text-lg font-bold text-text mb-5">
          {isEdit ? 'Edit listing' : 'New listing'}
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Machine type" htmlFor="machine_type" error={errors.machine_type}>
              <SelectField
                id="machine_type"
                value={form.machine_type}
                onChange={setField('machine_type')}
                options={MACHINE_TYPES}
                placeholder="Choose..."
                autoFocus
              />
            </Field>
            <Field
              label="Location type"
              htmlFor="location_type"
              error={errors.location_type}
              optional
            >
              <SelectField
                id="location_type"
                value={form.location_type}
                onChange={setField('location_type')}
                options={LOCATION_TYPES}
                placeholder="Choose..."
              />
            </Field>
          </div>

          <Field label="City" htmlFor="city" error={errors.city}>
            <input
              id="city"
              type="text"
              value={form.city}
              onChange={setField('city')}
              className={inputClass}
            />
          </Field>

          <Field label="Address" htmlFor="address" error={errors.address} optional>
            <input
              id="address"
              type="text"
              value={form.address}
              onChange={setField('address')}
              placeholder="Shown only to operators you accept"
              className={inputClass}
            />
          </Field>

          <Field label="Description" htmlFor="description" error={errors.description}>
            <textarea
              id="description"
              rows={3}
              value={form.description}
              onChange={setField('description')}
              placeholder="e.g. Hotel lobby, 200 rooms"
              className={inputClass}
            />
          </Field>

          <Field label="Foot traffic" htmlFor="foot_traffic" error={errors.foot_traffic} optional>
            <SelectField
              id="foot_traffic"
              value={form.foot_traffic}
              onChange={setField('foot_traffic')}
              options={FOOT_TRAFFIC_OPTIONS}
              placeholder="Choose..."
            />
          </Field>
        </div>

        {serverError && (
          <p
            role="alert"
            className="mt-4 rounded-control border border-danger/30 bg-danger-surface px-3 py-2 text-sm text-danger"
          >
            {serverError}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-control border border-border px-4 py-2 text-sm text-muted hover:text-text focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-55"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-control bg-accent px-4 py-2 text-sm font-semibold text-accent-ink hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-55"
          >
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create listing'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ListingFormModal;
