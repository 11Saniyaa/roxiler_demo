import { useId } from 'react';

export function Alert({ tone = 'error', children }) {
  if (!children) return null;
  return (
    <div className={`alert alert-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}

export function Field({ label, error, extra, children }) {
  return (
    <label className="field">
      <span className="field-top">
        <span className="field-label">{label}</span>
        {extra}
      </span>
      {children}
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}

export function Counter({ value, min = 0, max }) {
  const length = String(value ?? '').trim().length;
  const ready = length >= min && length <= max;
  return <span className={ready ? 'counter ready' : 'counter'}>{length}/{max}</span>;
}

export function RoleBadge({ role, label }) {
  return <span className={`badge badge-${role}`}>{label}</span>;
}

function StarIcon({ amount }) {
  const id = useId().replace(/:/g, '');
  const pct = `${Math.round(Math.min(1, Math.max(0, amount)) * 100)}%`;
  return (
    <svg viewBox="0 0 20 20" className="star-icon" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
          <stop offset={pct} stopColor="currentColor" />
          <stop offset={pct} stopColor="#ddd4c4" />
        </linearGradient>
      </defs>
      <path fill={`url(#${id})`} d="M10 1.7 12.5 7l5.8.5-4.4 3.7 1.4 5.5L10 13.8 4.7 16.7 6.1 11.2 1.7 7.5 7.5 7 10 1.7z" />
    </svg>
  );
}

export function Stars({ value = 0, onChange, label = 'Rating' }) {
  const numeric = Number(value) || 0;
  if (!onChange) {
    const shown = formatStarLabel(numeric);
    return (
      <span className="stars" aria-label={`${label}: ${shown} out of 5`}>
        {[1, 2, 3, 4, 5].map((score) => (
          <StarIcon key={score} amount={Math.min(1, Math.max(0, numeric - (score - 1)))} />
        ))}
      </span>
    );
  }

  return (
    <span className="stars" role="group" aria-label={label}>
      {[1, 2, 3, 4, 5].map((score) => (
        <button
          key={score}
          type="button"
          className="star-btn"
          aria-pressed={numeric === score}
          aria-label={`${score} out of 5`}
          onClick={() => onChange(score)}
        >
          <StarIcon amount={score <= numeric ? 1 : 0} />
        </button>
      ))}
    </span>
  );
}

function formatStarLabel(value) {
  if (!value) return '0';
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function DataTable({ columns, rows, sortBy, sortOrder, onSort, rowKey, empty }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => {
              const active = sortBy === column.key;
              const ariaSort = active ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none';
              return (
                <th key={column.key} aria-sort={ariaSort}>
                  {column.sortable === false ? (
                    column.label
                  ) : (
                    <button type="button" className="sort-btn" onClick={() => onSort(column.key)}>
                      {column.label}
                      <span aria-hidden="true">{active ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}</span>
                    </button>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="empty" colSpan={columns.length}>{empty}</td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((column) => (
                  <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
