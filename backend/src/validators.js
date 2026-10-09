const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function validateName(name) {
  const value = String(name ?? '').trim();
  if (value.length < 20 || value.length > 60) {
    return 'Name must be between 20 and 60 characters.';
  }
  return null;
}

function validateAddress(address) {
  const value = String(address ?? '').trim();
  if (!value) return 'Address is required.';
  if (value.length > 400) return 'Address must be at most 400 characters.';
  return null;
}

function validatePassword(password) {
  const value = String(password ?? '');
  if (value.length < 8 || value.length > 16) {
    return 'Password must be 8–16 characters.';
  }
  if (!/[A-Z]/.test(value)) {
    return 'Password must include at least one uppercase letter.';
  }
  if (!/[^A-Za-z0-9]/.test(value)) {
    return 'Password must include at least one special character.';
  }
  return null;
}

function validateEmail(email) {
  const value = String(email ?? '').trim();
  if (!value || value.length > 255 || !EMAIL_RE.test(value)) {
    return 'Enter a valid email address.';
  }
  return null;
}

function validateRole(role, allowed) {
  if (!allowed.includes(role)) return 'Select a valid role.';
  return null;
}

function validateRating(rating) {
  const value = Number(rating);
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    return 'Rating must be a whole number from 1 to 5.';
  }
  return null;
}

function collectErrors(pairs) {
  const fields = {};
  for (const [key, message] of Object.entries(pairs)) {
    if (message) fields[key] = message;
  }
  return fields;
}

function cleanText(value) {
  return String(value ?? '').trim();
}

function cleanEmail(value) {
  return String(value ?? '').trim().toLowerCase();
}

module.exports = {
  validateName,
  validateAddress,
  validatePassword,
  validateEmail,
  validateRole,
  validateRating,
  collectErrors,
  cleanText,
  cleanEmail,
};
