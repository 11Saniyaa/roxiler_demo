import { useEffect, useState } from 'react';
import { api } from '../api';
import { Alert, DataTable, Stars } from '../components/Ui';
import { formatRating } from '../format';
import { validateRating } from '../validation';

const EMPTY = { name: '', address: '' };

function RateControl({ store, onSaved }) {
  const [value, setValue] = useState(store.userRating || 0);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setValue(store.userRating || 0);
  }, [store.userRating]);

  async function save() {
    const message = validateRating(value);
    setError(message);
    setNote('');
    if (message) return;
    setPending(true);
    try {
      const data = await api(`/api/stores/${store.id}/rating`, {
        method: 'PUT',
        body: { rating: value },
      });
      setNote(data.updated ? 'Rating updated.' : 'Rating submitted.');
      onSaved(store.id, data.rating);
    } catch (err) {
      setError(err.fields?.rating || err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rate-box">
      <Stars value={value} onChange={setValue} label={`Your rating for ${store.name}`} />
      <button className="btn btn-small" type="button" onClick={save} disabled={pending}>
        {pending ? 'Saving…' : store.userRating ? 'Update rating' : 'Submit rating'}
      </button>
      {error ? <span className="field-error">{error}</span> : null}
      {note ? <span className="hint ready">{note}</span> : null}
    </div>
  );
}

export default function UserStores() {
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
    api(`/api/stores?${params}`)
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

  function onSaved(storeId, rating) {
    setStores((current) => current.map((store) => (
      store.id === storeId ? { ...store, userRating: rating } : store
    )));
    const params = new URLSearchParams({ ...filters, ...sort });
    api(`/api/stores?${params}`)
      .then((data) => setStores(data.stores))
      .catch(() => {});
  }

  return (
    <section>
      <div className="page-head">
        <div>
          <p className="eyebrow">Normal user</p>
          <h1>Stores</h1>
          <p className="lede">Search by name or address, then submit or change your rating from 1 to 5.</p>
        </div>
      </div>
      <Alert>{error}</Alert>
      <form
        className="filters"
        onSubmit={(event) => {
          event.preventDefault();
          setFilters(draft);
        }}
      >
        <input aria-label="Search by name" placeholder="Store name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
        <input aria-label="Search by address" placeholder="Address" value={draft.address} onChange={(event) => setDraft({ ...draft, address: event.target.value })} />
        <button className="btn btn-small" type="submit">Search</button>
        <button className="btn btn-line btn-small" type="button" onClick={() => { setDraft(EMPTY); setFilters(EMPTY); }}>Clear</button>
      </form>
      <p className="status-line">{loading ? 'Loading stores…' : `${stores.length} ${stores.length === 1 ? 'store' : 'stores'}`}</p>
      <DataTable
        columns={[
          { key: 'name', label: 'Store name' },
          { key: 'address', label: 'Address' },
          {
            key: 'overallRating',
            label: 'Overall rating',
            render: (row) => {
              const label = formatRating(row.overallRating);
              if (!label) return 'No ratings';
              return (
                <span className="rating-figure">
                  <Stars value={Number(label)} />
                  <strong>{label}</strong>
                </span>
              );
            },
          },
          {
            key: 'userRating',
            label: 'Your rating',
            render: (row) => (row.userRating ? `${row.userRating} / 5` : 'Not rated'),
          },
          {
            key: 'action',
            label: 'Submit or modify',
            sortable: false,
            render: (row) => <RateControl store={row} onSaved={onSaved} />,
          },
        ]}
        rows={stores}
        sortBy={sort.sortBy}
        sortOrder={sort.sortOrder}
        onSort={onSort}
        rowKey={(row) => row.id}
        empty={loading ? 'Loading…' : 'No stores match this search.'}
      />
    </section>
  );
}
