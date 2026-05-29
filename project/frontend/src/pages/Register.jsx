import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

// In production (Vercel) the API is on the same domain, so use a relative path.
// In local dev, Vite proxies /api → localhost:5000 (see vite.config.js).
const API = '/api';

export default function Register({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    companyName: '',
    isAgency: 'yes',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          phone: form.phone,
          email: form.email,
          password: form.password,
          companyName: form.companyName,
          isAgency: form.isAgency === 'yes',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Registration failed.');
        return;
      }

      localStorage.setItem('popx_token', data.token);
      localStorage.setItem('popx_user', JSON.stringify(data.user));
      onLogin(data.user);
      navigate('/account');
    } catch {
      setError('Could not connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  const isReady =
    form.fullName.trim() &&
    form.phone.trim() &&
    form.email.trim() &&
    form.password.trim();

  return (
    <div className="auth-container">
      <h1 className="auth-heading">
        Create your<br />PopX account
      </h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className="field-group">
          <label className="field-label" htmlFor="fullName">
            Full Name<span className="required">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            className="field-input"
            placeholder="Marry Doe"
            value={form.fullName}
            onChange={handleChange}
            autoComplete="name"
          />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="phone">
            Phone number<span className="required">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="field-input"
            placeholder="+91 00000 00000"
            value={form.phone}
            onChange={handleChange}
            autoComplete="tel"
          />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="reg-email">
            Email address<span className="required">*</span>
          </label>
          <input
            id="reg-email"
            name="email"
            type="email"
            className="field-input"
            placeholder="marry@example.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="reg-password">
            Password<span className="required"> *</span>
          </label>
          <input
            id="reg-password"
            name="password"
            type="password"
            className="field-input"
            placeholder="Create a password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
          />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="companyName">Company name</label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            className="field-input"
            placeholder="Your company"
            value={form.companyName}
            onChange={handleChange}
          />
        </div>

        <div className="field-group">
          <p className="field-label agency-label">
            Are you an Agency?<span className="required">*</span>
          </p>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="isAgency"
                value="yes"
                checked={form.isAgency === 'yes'}
                onChange={handleChange}
              />
              Yes
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="isAgency"
                value="no"
                checked={form.isAgency === 'no'}
                onChange={handleChange}
              />
              No
            </label>
          </div>
        </div>

        {error && <p className="error-msg">{error}</p>}

        <button
          type="submit"
          className={`btn btn-submit ${isReady ? 'active' : ''}`}
          disabled={!isReady || loading}
        >
          {loading ? 'Creating…' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}
