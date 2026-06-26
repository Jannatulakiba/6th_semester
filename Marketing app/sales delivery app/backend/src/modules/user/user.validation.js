import { PASSWORD } from '../../shared/constants/index.js';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validatePassword = (password) => {
  if (!password || password.length < PASSWORD.MIN_LENGTH) {
    return { valid: false, message: `Password must be at least ${PASSWORD.MIN_LENGTH} characters` };
  }
  if (!PASSWORD.UPPERCASE_REGEX.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!PASSWORD.NUMBER_REGEX.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  if (!PASSWORD.SPECIAL_REGEX.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }
  return { valid: true, message: '' };
};

export const passwordSchemaValidator = {
  validator: (value) => {
    const { valid } = validatePassword(value);
    return valid;
  },
  message: `Password must be at least ${PASSWORD.MIN_LENGTH} characters with 1 uppercase, 1 number, and 1 special character`,
};
