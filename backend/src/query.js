function orderBy(allowed, sortBy, sortOrder, fallback) {
  const column = allowed[sortBy] || allowed[fallback];
  const direction = String(sortOrder || '').toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return `${column} ${direction}`;
}

function likePattern(value) {
  const escaped = String(value || '')
    .trim()
    .replace(/[\\%_]/g, (char) => `\\${char}`);
  return `%${escaped}%`;
}

function toRating(value) {
  if (value === null || value === undefined) return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.round(number * 10) / 10;
}

function toCount(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

module.exports = { orderBy, likePattern, toRating, toCount };
