import { describe, expect, it } from 'vitest';
import { REQUEST_MESSAGE_MAX_LENGTH, validateRequestForm } from '../src/requestFormValidation.js';

describe('validateRequestForm', () => {
  it('sends null for an empty, whitespace, or missing note', () => {
    expect(validateRequestForm({ message: '' }).payload.message).toBeNull();
    expect(validateRequestForm({ message: '   ' }).payload.message).toBeNull();
    expect(validateRequestForm({}).payload.message).toBeNull();
    expect(validateRequestForm().errors).toEqual({});
  });

  it('trims the note', () => {
    const { errors, payload } = validateRequestForm({ message: '  I have 3 machines.  ' });
    expect(errors).toEqual({});
    expect(payload.message).toBe('I have 3 machines.');
  });

  it('allows a note at the limit and rejects one over it', () => {
    const atLimit = 'x'.repeat(REQUEST_MESSAGE_MAX_LENGTH);
    expect(validateRequestForm({ message: atLimit }).errors).toEqual({});
    expect(validateRequestForm({ message: `${atLimit}y` }).errors.message).toBeTruthy();
  });

  it('rejects a non-string note', () => {
    expect(validateRequestForm({ message: 12 }).errors.message).toBeTruthy();
  });
});
