import { useEffect, useState } from 'react';
import { MACHINE_TYPES } from '../listingOptions.js';
import { REQUEST_MESSAGE_MAX_LENGTH, validateRequestForm } from '../requestFormValidation.js';

// onSubmit(payload) should throw on failure; the error message is shown inline
// and the note is kept so the operator can retry without retyping.
function SendRequestModal({ listing, onSubmit, onClose }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (sending) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sending, onClose]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { errors, payload } = validateRequestForm({ message });
    setError(errors.message || null);
    if (errors.message) return;

    setSending(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err.fieldErrors?.message || err.message || "Couldn't send your request. Please try again.");
      setSending(false);
    }
  };

  const machineLabel =
    MACHINE_TYPES.find((option) => option.value === listing.machine_type)?.label ??
    listing.machine_type;
  const remaining = REQUEST_MESSAGE_MAX_LENGTH - message.trim().length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !sending) onClose();
      }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="send-request-title"
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-md rounded-card border border-border bg-surface shadow-card p-6"
      >
        <h2 id="send-request-title" className="text-lg font-bold text-text">
          Send placement request
        </h2>
        <p className="text-sm text-muted mt-1 mb-5">
          {machineLabel} · {listing.city}. The host sees your profile and this note.
        </p>

        <label
          htmlFor="request-message"
          className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5"
        >
          Note to the host
          <span className="ml-1 normal-case font-normal text-faint">(optional)</span>
        </label>
        <textarea
          id="request-message"
          rows={4}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          autoFocus
          placeholder="e.g. I run 12 vending machines around Tampa and can install within two weeks."
          className="w-full bg-input-bg border border-border rounded-control px-3 py-2 text-sm text-text placeholder:text-faint focus:outline-none focus:border-input-border-focus focus:ring-2 focus:ring-accent/20"
        />
        <div className="flex justify-between mt-1 text-xs">
          <span className="text-danger">{error}</span>
          <span className={remaining < 0 ? 'text-danger' : 'text-faint'}>{remaining}</span>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            className="rounded-control border border-border px-4 py-2 text-sm text-muted hover:text-text focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-55"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={sending}
            className="rounded-control bg-accent px-4 py-2 text-sm font-semibold text-accent-ink hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-55"
          >
            {sending ? 'Sending...' : 'Send request'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SendRequestModal;
