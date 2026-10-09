import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { homeFor, useAuth } from './auth';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Password from './pages/Password';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminUserForm from './pages/AdminUserForm';
import AdminUserDetail from './pages/AdminUserDetail';
import AdminStores from './pages/AdminStores';
import AdminStoreForm from './pages/AdminStoreForm';
import UserStores from './pages/UserStores';
import OwnerDashboard from './pages/OwnerDashboard';

function Boot() {
  return <div className="boot">Loading your account…</div>;
}

function GuestOnly({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to={homeFor(user.role)} replace />;
  return children;
}

function RequireAuth() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function RequireRole({ role }) {
  const { user } = useAuth();
  if (user.role !== role) return <Navigate to={homeFor(user.role)} replace />;
  return <Outlet />;
}

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? homeFor(user.role) : '/'} replace />;
}

export default function App() {
  const { loading } = useAuth();
  if (loading) return <Boot />;

  return (
    <Routes>
      <Route path="/" element={<GuestOnly><Home /></GuestOnly>} />
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/signup" element={<GuestOnly><Signup /></GuestOnly>} />
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route path="/password" element={<Password />} />
          <Route element={<RequireRole role="admin" />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/users/new" element={<AdminUserForm />} />
            <Route path="/admin/users/:id" element={<AdminUserDetail />} />
            <Route path="/admin/stores" element={<AdminStores />} />
            <Route path="/admin/stores/new" element={<AdminStoreForm />} />
          </Route>
          <Route element={<RequireRole role="user" />}>
            <Route path="/stores" element={<UserStores />} />
          </Route>
          <Route element={<RequireRole role="store_owner" />}>
            <Route path="/owner" element={<OwnerDashboard />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
