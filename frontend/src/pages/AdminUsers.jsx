import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api';
import { Alert, DataTable, RoleBadge } from '../components/Ui';
import { formatRating, roleLabel } from '../format';

const EMPTY = { name: '', email: '', address: '', role: '' };

export default function AdminUsers() {
  const location = useLocation();
  const [draft, setDraft] = useState(EMPTY);
  const [filters, setFilters] = useState(EMPTY);
  const [sort, setSort] = useState({ sortBy: 'name', sortOrder: 'asc' });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const notice = location.state?.notice || '';

  useEffect(() => {
    const params = new URLSearchParams({ ...filters, ...sort });
    let ignore = false;
    setLoading(true);
    api(`/api/admin/users?${params}`)
      .then((data) => {
        if (!ignore) setUsers(data.users);
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
          <h1>Users</h1>
          <p className="lede">Normal users, administrators, and store owners. Open a name to see the full record.</p>
        </div>
        <Link className="btn" to="/admin/users/new">Add user</Link>
      </div>
      <Alert tone="success">{notice}</Alert>
      <Alert>{error}</Alert>
      <form
        className="filters"
        onSubmit={(event) => {
          event.preventDefault();
          setFilters(draft);
        }}
      >
        <input
          aria-label="Filter by name"
          placeholder="Name"
          value={draft.name}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
        />
        <input
          aria-label="Filter by email"
          placeholder="Email"
          value={draft.email}
          onChange={(event) => setDraft({ ...draft, email: event.target.value })}
        />
        <input
          aria-label="Filter by address"
          placeholder="Address"
          value={draft.address}
          onChange={(event) => setDraft({ ...draft, address: event.target.value })}
        />
        <select
          aria-label="Filter by role"
          value={draft.role}
          onChange={(event) => setDraft({ ...draft, role: event.target.value })}
        >
          <option value="">All roles</option>
          <option value="admin">System Administrator</option>
          <option value="user">Normal User</option>
          <option value="store_owner">Store Owner</option>
        </select>
        <button className="btn btn-small" type="submit">Apply filters</button>
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
      <p className="status-line">{loading ? 'Loading users…' : `${users.length} ${users.length === 1 ? 'user' : 'users'}`}</p>
      <DataTable
        columns={[
          {
            key: 'name',
            label: 'Name',
            render: (row) => <Link to={`/admin/users/${row.id}`}>{row.name}</Link>,
          },
          { key: 'email', label: 'Email' },
          { key: 'address', label: 'Address' },
          {
            key: 'role',
            label: 'Role',
            render: (row) => <RoleBadge role={row.role} label={roleLabel(row.role)} />,
          },
          {
            key: 'rating',
            label: 'Rating',
            render: (row) => (row.role === 'store_owner' ? (formatRating(row.rating) || 'No ratings') : '—'),
          },
        ]}
        rows={users}
        sortBy={sort.sortBy}
        sortOrder={sort.sortOrder}
        onSort={onSort}
        rowKey={(row) => row.id}
        empty={loading ? 'Loading…' : 'No users match these filters.'}
      />
    </section>
  );
}
