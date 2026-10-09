import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Alert, Counter, Field } from '../components/Ui';
import { hasErrors, validateAddress, validateEmail, validateName, validatePassword } from '../validation';

const EMPTY = {
  name: '',
  email: '',
  address: '',
  ownerName: '',
  ownerEmail: '',
  ownerAddress: '',
  ownerPassword: '',
};

export default function AdminStoreForm() {
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
      ownerName: validateName(form.ownerName),
      ownerEmail: validateEmail(form.ownerEmail),
      ownerAddress: validateAddress(form.ownerAddress),
      ownerPassword: validatePassword(form.ownerPassword),
    };
    if (
      form.email.trim()
      && form.ownerEmail.trim()
      && form.email.trim().toLowerCase() === form.ownerEmail.trim().toLowerCase()
    ) {
      nextErrors.ownerEmail = 'Owner email must be different from the store email.';
    }
    setErrors(nextErrors);
    setMessage('');
    if (hasErrors(nextErrors)) return;

    setPending(true);
    try {
      await api('/api/admin/stores', {
        method: 'POST',
        body: {
          name: form.name.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
          ownerName: form.ownerName.trim(),
          ownerEmail: form.ownerEmail.trim(),
          ownerAddress: form.ownerAddress.trim(),
          ownerPassword: form.ownerPassword,
        },
      });
      navigate('/admin/stores', { state: { notice: 'Store and owner added.' } });
    } catch (error) {
      setErrors(error.fields || {});
      setMessage(error.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="narrow wide-form">
      <div className="page-head">
        <div>
          <p className="eyebrow">Directory</p>
          <h1>Add store</h1>
          <p className="lede">This creates the store and the store owner who will sign in to see its ratings.</p>
        </div>
        <Link className="btn btn-line" to="/admin/stores">Back to stores</Link>
      </div>
      <form className="form-card" onSubmit={onSubmit} noValidate>
        <Alert>{message}</Alert>
        <fieldset>
          <legend>Store</legend>
          <Field label="Name" error={errors.name} extra={<Counter value={form.name} min={20} max={60} />}>
            <input maxLength={60} value={form.name} onChange={(event) => update('name', event.target.value)} />
          </Field>
          <Field label="Email" error={errors.email}>
            <input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} />
          </Field>
          <Field label="Address" error={errors.address} extra={<Counter value={form.address} min={1} max={400} />}>
            <textarea maxLength={400} rows={3} value={form.address} onChange={(event) => update('address', event.target.value)} />
          </Field>
        </fieldset>
        <fieldset>
          <legend>Store owner</legend>
          <Field label="Name" error={errors.ownerName} extra={<Counter value={form.ownerName} min={20} max={60} />}>
            <input maxLength={60} value={form.ownerName} onChange={(event) => update('ownerName', event.target.value)} />
          </Field>
          <Field label="Email" error={errors.ownerEmail}>
            <input type="email" value={form.ownerEmail} onChange={(event) => update('ownerEmail', event.target.value)} />
          </Field>
          <Field label="Address" error={errors.ownerAddress} extra={<Counter value={form.ownerAddress} min={1} max={400} />}>
            <textarea maxLength={400} rows={3} value={form.ownerAddress} onChange={(event) => update('ownerAddress', event.target.value)} />
          </Field>
          <Field label="Password" error={errors.ownerPassword}>
            <input
              type="password"
              maxLength={16}
              autoComplete="new-password"
              value={form.ownerPassword}
              onChange={(event) => update('ownerPassword', event.target.value)}
            />
            <span className="hint">8–16 characters, with an uppercase letter and a special character.</span>
          </Field>
        </fieldset>
        <div className="form-actions">
          <button className="btn" type="submit" disabled={pending}>{pending ? 'Saving…' : 'Add store'}</button>
        </div>
      </form>
    </section>
  );
}
