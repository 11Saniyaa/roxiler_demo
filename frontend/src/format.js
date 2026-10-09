const ROLE_LABELS = {
  admin: 'System Administrator',
  user: 'Normal User',
  store_owner: 'Store Owner',
};

export function roleLabel(role) {
  return ROLE_LABELS[role] || role;
}

export function formatRating(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return number.toFixed(1);
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
