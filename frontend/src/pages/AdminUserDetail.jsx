import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { Alert, RoleBadge, Stars } from '../components/Ui';
import { formatRating, roleLabel } from '../format';

export default function AdminUserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    api(`/api/admin/users/${id}`)
      .then((data) => {
        if (!ignore) setUser(data.user);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [id]);

  const ratingLabel = user ? formatRating(user.rating) : null;

  return (
    <section className="narrow">
      <div className="page-head">
        <div>
          <p className="eyebrow">User record</p>
          <h1>{user ? user.name : 'User details'}</h1>
        </div>
        <Link className="btn btn-line" to="/admin/users">Back to users</Link>
      </div>
      <Alert>{error}</Alert>
      {user ? (
        <dl className="detail">
          <div>
            <dt>Name</dt>
            <dd>{user.name}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Address</dt>
            <dd>{user.address}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd><RoleBadge role={user.role} label={roleLabel(user.role)} /></dd>
          </div>
          {user.role === 'store_owner' ? (
            <>
              <div>
                <dt>Store</dt>
                <dd>{user.storeName || 'No store linked'}</dd>
              </div>
              <div>
                <dt>Rating</dt>
                <dd className="rating-figure">
                  {ratingLabel ? (
                    <>
                      <Stars value={Number(ratingLabel)} />
                      <strong>{ratingLabel}</strong>
                    </>
                  ) : (
                    'No ratings'
                  )}
                </dd>
              </div>
            </>
          ) : null}
        </dl>
      ) : null}
    </section>
  );
}
