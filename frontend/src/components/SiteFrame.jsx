import { Link, NavLink } from 'react-router-dom';

export default function SiteFrame({ children }) {
  return (
    <div className="site">
      <header className="site-header">
        <NavLink to="/" className="brand" end>
          Roxiler <em>Stores</em>
        </NavLink>
        <nav className="site-nav" aria-label="Account">
          <NavLink to="/login" className={({ isActive }) => (isActive ? 'site-link active' : 'site-link')}>
            Log in
          </NavLink>
          <NavLink to="/signup" className={({ isActive }) => (isActive ? 'btn btn-small site-cta active' : 'btn btn-small site-cta')}>
            Create account
          </NavLink>
        </nav>
      </header>
      <main className="site-main">{children}</main>
      <footer className="site-footer">
        <span>Roxiler Stores</span>
        <span>
          <Link to="/login">Log in</Link>
          <Link to="/signup">Create account</Link>
        </span>
      </footer>
    </div>
  );
}
