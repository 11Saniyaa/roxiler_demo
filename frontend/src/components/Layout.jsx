import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { homeFor, useAuth } from '../auth';
import { roleLabel } from '../format';

const LINKS = {
  admin: [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/stores', label: 'Stores' },
    { to: '/password', label: 'Password' },
  ],
  user: [
    { to: '/stores', label: 'Stores', end: true },
    { to: '/password', label: 'Password' },
  ],
  store_owner: [
    { to: '/owner', label: 'Dashboard', end: true },
    { to: '/password', label: 'Password' },
  ],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = LINKS[user.role] || [];

  function onLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="shell">
      <header className="topbar">
        <NavLink to={homeFor(user.role)} className="brand">
          Roxiler <em>Stores</em>
        </NavLink>
        <nav className="nav" aria-label="Primary">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="who">
          <span className="role-pill">{roleLabel(user.role)}</span>
          <span className="who-name" title={user.name}>{user.name}</span>
          <button type="button" className="btn btn-ghost" onClick={onLogout}>Log out</button>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
