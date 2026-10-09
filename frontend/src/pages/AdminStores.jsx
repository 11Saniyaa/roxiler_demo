import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api';
import { Alert, DataTable, Stars } from '../components/Ui';
import { formatRating } from '../format';

const EMPTY = { name: '', email: '', address: '' };

export default function AdminStores() {
  const location = useLocation();
  const [draft, setDraft] = useState(EMPTY);
  const [filters, setFilters] = useState(EMPTY);
  const [sort, setSort] = useState({ sortBy: 'name', sortOrder: 'asc' });
  const [stores, setStores] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({ ...filters, ...sort });
    let ignore = false;
    setLoading(true);
    api(`/api/admin/stores?${params}`)
      .then((data) => {
        if (!ignore) setStores(data.stores);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [filters, sort]);

  function onSort(key) {
    setSort((current) => ({
      sortBy: key,
      sortOrder: current.sortBy === key && current.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  }

  return (
    <section>
      <div className="page-head">
        <div>
          <p className="eyebrow">Directory</p>
          <h1>Stores</h1>
          <p className="lede">Every registered store, with its contact details and average rating.</p>
        </div>
        <Link className="btn" to="/admin/stores/new">Add store</Link>
      </div>
      <Alert tone="success">{location.state?.notice || ''}</Alert>
      <Alert>{error}</Alert>
      <form
        className="filters"
        onSubmit={(event) => {
          event.preventDefault();
          setFilters(draft);
        }}
      >
        <input aria-label="Filter by name" placeholder="Name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
        <input aria-label="Filter by email" placeholder="Email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} />
        <input aria-label="Filter by address" placeholder="Address" value={draft.address} onChange={(event) => setDraft({ ...draft, address: event.target.value })} />
        <button className="btn btn-small" type="submit">Apply filters</button>
        <button className="btn btn-line btn-small" type="button" onClick={() => { setDraft(EMPTY); setFilters(EMPTY); }}>Clear</button>
      </form>
      <p className="status-line">{loading ? 'Loading stores…' : `${stores.length} ${stores.length === 1 ? 'store' : 'stores'}`}</p>
      <DataTable
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'address', label: 'Address' },
          {
            key: 'rating',
            label: 'Rating',
            render: (row) => {
              const label = formatRating(row.rating);
              if (!label) return 'No ratings';
              return (
                <span className="rating-figure">
                  <Stars value={Number(label)} />
                  <strong>{label}</strong>
                </span>
              );
            },
          },
        ]}
        rows={stores}
        sortBy={sort.sortBy}
        sortOrder={sort.sortOrder}
        onSort={onSort}
        rowKey={(row) => row.id}
        empty={loading ? 'Loading…' : 'No stores match these filters.'}
      />
    </section>
  );
}
