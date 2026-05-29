import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

// Uses env variable in production (Render), falls back to /api for Vercel or local dev
const API = import.meta.env.VITE_API_URL || '/api';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed.');
        return;
      }

      // Persist token and user
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

  const isReady = form.email.trim() && form.password.trim();

  return (
    <div className="auth-container">
      <h1 className="auth-heading">
        Signin to your<br />PopX account
      </h1>
      <p className="auth-sub">
        Lorem ipsum dolor sit amet,<br />consectetur adipiscing elit,
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="field-group">
          <label className="field-label" htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            className="field-input"
            placeholder="Enter email address"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            className="field-input"
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
        </div>

        {error && <p className="error-msg">{error}</p>}

        <button
          type="submit"
          className={`btn btn-submit ${isReady ? 'active' : ''}`}
          disabled={!isReady || loading}
        >
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </form>
    </div>
  );
}
