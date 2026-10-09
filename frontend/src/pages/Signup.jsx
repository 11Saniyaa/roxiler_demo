import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import SiteFrame from '../components/SiteFrame';
import { Alert, Counter, Field } from '../components/Ui';
import { hasErrors, validateAddress, validateEmail, validateName, validatePassword } from '../validation';

const EMPTY = { name: '', email: '', address: '', password: '' };

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    const nextErrors = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      address: validateAddress(form.address),
      password: validatePassword(form.password),
    };
    setErrors(nextErrors);
    setMessage('');
    if (hasErrors(nextErrors)) return;

    setPending(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        password: form.password,
      });
      navigate('/stores', { replace: true });
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
          <h1 className="account-title">Create account</h1>
          <Alert>{message}</Alert>
          <Field
            label="Name"
            error={errors.name}
            extra={<Counter value={form.name} min={20} max={60} />}
          >
            <input
              value={form.name}
              maxLength={60}
              onChange={(event) => update('name', event.target.value)}
            />
          </Field>
          <Field label="Email" error={errors.email}>
            <input
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => update('email', event.target.value)}
            />
          </Field>
          <Field
            label="Address"
            error={errors.address}
            extra={<Counter value={form.address} min={1} max={400} />}
          >
            <textarea
              value={form.address}
              maxLength={400}
              rows={4}
              onChange={(event) => update('address', event.target.value)}
            />
          </Field>
          <Field label="Password" error={errors.password}>
            <input
              type="password"
              autoComplete="new-password"
              maxLength={16}
              value={form.password}
              onChange={(event) => update('password', event.target.value)}
            />
            <span className="hint">8–16 characters, with an uppercase letter and a special character.</span>
          </Field>
          <button className="btn" type="submit" disabled={pending}>
            {pending ? 'Creating account…' : 'Sign up'}
          </button>
          <p className="form-note">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </div>
    </SiteFrame>
  );
}
