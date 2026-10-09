import { useEffect, useState } from 'react';
import { api } from '../api';
import { Alert, DataTable, Stars } from '../components/Ui';
import { formatDate, formatRating } from '../format';

export default function OwnerDashboard() {
  const [sort, setSort] = useState({ sortBy: 'name', sortOrder: 'asc' });
  const [store, setStore] = useState(null);
  const [raters, setRaters] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(sort);
    let ignore = false;
    setLoading(true);
    api(`/api/owner/dashboard?${params}`)
      .then((data) => {
        if (ignore) return;
        setStore(data.store);
        setRaters(data.raters);
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
  }, [sort]);

  function onSort(key) {
    setSort((current) => ({
      sortBy: key,
      sortOrder: current.sortBy === key && current.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  }

  const average = formatRating(store?.averageRating);

  return (
    <section>
      <div className="page-head">
        <div>
          <p className="eyebrow">Store owner</p>
          <h1>{store ? store.name : 'Your store'}</h1>
          <p className="lede">{store ? store.address : 'Ratings submitted for your store.'}</p>
        </div>
      </div>
      <Alert>{error}</Alert>
      {store ? (
        <article className="hero-rating">
          <div>
            <span>Average rating</span>
            <strong>{average || '—'}</strong>
            <p>{store.ratingCount} submitted {store.ratingCount === 1 ? 'rating' : 'ratings'}</p>
          </div>
          {average ? <Stars value={Number(average)} label="Average rating" /> : null}
        </article>
      ) : null}
      <h2 className="section-title">People who rated your store</h2>
      <DataTable
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'address', label: 'Address' },
          {
            key: 'rating',
            label: 'Rating',
            render: (row) => (
              <span className="rating-figure">
                <Stars value={row.rating} />
                <strong>{row.rating}</strong>
              </span>
            ),
          },
          {
            key: 'submittedAt',
            label: 'Submitted',
            render: (row) => formatDate(row.submittedAt),
          },
        ]}
        rows={raters}
        sortBy={sort.sortBy}
        sortOrder={sort.sortOrder}
        onSort={onSort}
        rowKey={(row) => row.id}
        empty={loading ? 'Loading…' : 'No ratings have been submitted yet.'}
      />
    </section>
  );
}
