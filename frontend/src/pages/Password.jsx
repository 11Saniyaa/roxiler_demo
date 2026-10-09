import { useState } from 'react';
import { api } from '../api';
import { Alert, Field } from '../components/Ui';
import { hasErrors, validatePassword } from '../validation';

export default function Password() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [tone, setTone] = useState('error');
  const [pending, setPending] = useState(false);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    const nextErrors = {
      currentPassword: form.currentPassword ? '' : 'Current password is required.',
      newPassword: validatePassword(form.newPassword),
      confirmPassword: form.newPassword === form.confirmPassword ? '' : 'Passwords do not match.',
    };
    if (form.currentPassword && form.currentPassword === form.newPassword) {
      nextErrors.newPassword = 'New password must be different from the current password.';
    }
    setErrors(nextErrors);
    setMessage('');
    if (hasErrors(nextErrors)) return;

    setPending(true);
    try {
      const data = await api('/api/auth/password', {
        method: 'PUT',
        body: { currentPassword: form.currentPassword, newPassword: form.newPassword },
      });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTone('success');
      setMessage(data.message);
    } catch (error) {
      setErrors(error.fields || {});
      setTone('error');
      setMessage(error.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="narrow">
      <div className="page-head">
        <div>
          <p className="eyebrow">Account</p>
          <h1>Update password</h1>
          <p className="lede">Use 8–16 characters, including an uppercase letter and a special character.</p>
        </div>
      </div>
      <form className="form-card" onSubmit={onSubmit} noValidate>
        <Alert tone={tone}>{message}</Alert>
        <Field label="Current password" error={errors.currentPassword}>
          <input
            type="password"
            autoComplete="current-password"
            value={form.currentPassword}
            onChange={(event) => update('currentPassword', event.target.value)}
          />
        </Field>
        <Field label="New password" error={errors.newPassword}>
          <input
            type="password"
            autoComplete="new-password"
            maxLength={16}
            value={form.newPassword}
            onChange={(event) => update('newPassword', event.target.value)}
          />
        </Field>
        <Field label="Confirm new password" error={errors.confirmPassword}>
          <input
            type="password"
            autoComplete="new-password"
            maxLength={16}
            value={form.confirmPassword}
            onChange={(event) => update('confirmPassword', event.target.value)}
          />
        </Field>
        <button className="btn" type="submit" disabled={pending}>
          {pending ? 'Saving…' : 'Update password'}
        </button>
      </form>
    </section>
  );
}
