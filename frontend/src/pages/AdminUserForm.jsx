import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Alert, Counter, Field } from '../components/Ui';
import { hasErrors, validateAddress, validateEmail, validateName, validatePassword } from '../validation';

const EMPTY = { name: '', email: '', address: '', password: '', role: 'user' };

export default function AdminUserForm() {
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
      role: form.role === 'admin' || form.role === 'user' ? '' : 'Select a valid role.',
    };
    setErrors(nextErrors);
    setMessage('');
    if (hasErrors(nextErrors)) return;

    setPending(true);
    try {
      await api('/api/admin/users', {
        method: 'POST',
        body: {
          name: form.name.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
          password: form.password,
          role: form.role,
        },
      });
      navigate('/admin/users', { state: { notice: 'User added.' } });
    } catch (error) {
      setErrors(error.fields || {});
      setMessage(error.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="narrow">
      <div className="page-head">
        <div>
          <p className="eyebrow">Directory</p>
          <h1>Add user</h1>
          <p className="lede">Create a normal user or another system administrator. Store owners are created with their store.</p>
        </div>
        <Link className="btn btn-line" to="/admin/users">Back to users</Link>
      </div>
      <form className="form-card" onSubmit={onSubmit} noValidate>
        <Alert>{message}</Alert>
        <Field label="Name" error={errors.name} extra={<Counter value={form.name} min={20} max={60} />}>
          <input maxLength={60} value={form.name} onChange={(event) => update('name', event.target.value)} />
        </Field>
        <Field label="Email" error={errors.email}>
          <input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} />
        </Field>
        <Field label="Address" error={errors.address} extra={<Counter value={form.address} min={1} max={400} />}>
          <textarea maxLength={400} rows={4} value={form.address} onChange={(event) => update('address', event.target.value)} />
        </Field>
        <Field label="Password" error={errors.password}>
          <input
            type="password"
            maxLength={16}
            autoComplete="new-password"
            value={form.password}
            onChange={(event) => update('password', event.target.value)}
          />
          <span className="hint">8–16 characters, with an uppercase letter and a special character.</span>
        </Field>
        <Field label="Role" error={errors.role}>
          <select value={form.role} onChange={(event) => update('role', event.target.value)}>
            <option value="user">Normal User</option>
            <option value="admin">System Administrator</option>
          </select>
        </Field>
        <div className="form-actions">
          <button className="btn" type="submit" disabled={pending}>{pending ? 'Saving…' : 'Add user'}</button>
        </div>
      </form>
    </section>
  );
}
