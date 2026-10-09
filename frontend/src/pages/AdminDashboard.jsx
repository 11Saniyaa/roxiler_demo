import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { Alert } from '../components/Ui';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    api('/api/admin/stats')
      .then((data) => {
        if (!ignore) setStats(data);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section>
      <div className="page-head">
        <div>
          <p className="eyebrow">System administrator</p>
          <h1>Directory overview</h1>
          <p className="lede">Users, stores, and the ratings submitted across the platform.</p>
        </div>
        <div className="head-actions">
          <Link className="btn btn-line" to="/admin/users/new">Add user</Link>
          <Link className="btn" to="/admin/stores/new">Add store</Link>
        </div>
      </div>
      <Alert>{error}</Alert>
      <div className="stats">
        <Link className="stat" to="/admin/users">
          <span>Total users</span>
          <strong>{stats ? stats.users : '—'}</strong>
        </Link>
        <Link className="stat" to="/admin/stores">
          <span>Total stores</span>
          <strong>{stats ? stats.stores : '—'}</strong>
        </Link>
        <article className="stat stat-static">
          <span>Total ratings</span>
          <strong>{stats ? stats.ratings : '—'}</strong>
        </article>
      </div>
    </section>
  );
}
