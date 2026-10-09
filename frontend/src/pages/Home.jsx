import { useEffect, useState } from 'react';
import { api } from '../api';
import SiteFrame from '../components/SiteFrame';
import { Alert, Stars } from '../components/Ui';
import { formatRating } from '../format';

const EMPTY = { name: '', address: '' };

export default function Home() {
  const [draft, setDraft] = useState(EMPTY);
  const [filters, setFilters] = useState(EMPTY);
  const [stores, setStores] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(filters);
    let ignore = false;
    setLoading(true);
    api(`/api/catalog/stores?${params}`)
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
  }, [filters]);

  return (
    <SiteFrame>
      <div className="page-head">
        <div>
          <h1>Store directory</h1>
          <p className="lede">Search registered shops by name or address.</p>
        </div>
      </div>
      <Alert>{error}</Alert>
      <form
        className="filters directory-filters"
        onSubmit={(event) => {
          event.preventDefault();
          setFilters(draft);
        }}
      >
        <input
          aria-label="Search by name"
          placeholder="Store name"
          value={draft.name}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
        />
        <input
          aria-label="Search by address"
          placeholder="Address"
          value={draft.address}
          onChange={(event) => setDraft({ ...draft, address: event.target.value })}
        />
        <button className="btn btn-small" type="submit">Search</button>
        <button
          className="btn btn-line btn-small"
          type="button"
          onClick={() => {
            setDraft(EMPTY);
            setFilters(EMPTY);
          }}
        >
          Clear
        </button>
      </form>
      <p className="status-line">
        {loading ? 'Loading stores…' : `${stores.length} ${stores.length === 1 ? 'store' : 'stores'}`}
      </p>
      {stores.length === 0 && !loading ? (
        <p className="directory-empty">No stores match this search.</p>
      ) : (
        <div className="store-grid">
          {stores.map((store) => {
            const rating = formatRating(store.rating);
            return (
              <article className="store-card" key={store.id}>
                <h2>{store.name}</h2>
                <p>{store.address}</p>
                <div className="rating-figure">
                  {rating ? <Stars value={Number(rating)} /> : null}
                  <strong>{rating || 'No ratings yet'}</strong>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </SiteFrame>
  );
}
