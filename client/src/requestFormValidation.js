// Mirrors backend/utils/requestValidation.js; the server stays the source of truth.
export const REQUEST_MESSAGE_MAX_LENGTH = 500;

export function validateRequestForm({ message = '' } = {}) {
  const errors = {};
  const trimmed = typeof message === 'string' ? message.trim() : '';

  if (typeof message !== 'string') {
    errors.message = 'Your note must be text';
  } else if (trimmed.length > REQUEST_MESSAGE_MAX_LENGTH) {
    errors.message = `Keep your note to ${REQUEST_MESSAGE_MAX_LENGTH} characters or fewer`;
  }

  return { errors, payload: { message: trimmed || null } };
}
