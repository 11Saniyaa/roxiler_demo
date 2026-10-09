import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { homeFor, useAuth } from '../auth';
import SiteFrame from '../components/SiteFrame';
import { Alert, Field } from '../components/Ui';
import { validateEmail } from '../validation';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    const nextErrors = {
      email: validateEmail(email),
      password: password ? '' : 'Password is required.',
    };
    setErrors(nextErrors);
    setMessage('');
    if (nextErrors.email || nextErrors.password) return;

    setPending(true);
    try {
      const user = await login(email, password);
      navigate(homeFor(user.role), { replace: true });
    } catch (error) {
      setErrors(error.fields || {});
      setMessage(error.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <SiteFrame>
      <div className="account-page">
        <form className="form-card" onSubmit={onSubmit} noValidate>
          <h1 className="account-title">Log in</h1>
          <Alert>{message}</Alert>
          <Field label="Email" error={errors.email}>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>
          <Field label="Password" error={errors.password}>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>
          <button className="btn" type="submit" disabled={pending}>
            {pending ? 'Signing in…' : 'Log in'}
          </button>
          <p className="form-note">
            Don&apos;t have an account? <Link to="/signup">Create one</Link>
          </p>
        </form>
      </div>
    </SiteFrame>
  );
}
