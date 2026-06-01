import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || '/api';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res  = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Login failed.'); return; }

      localStorage.setItem('popx_token', data.token);
      localStorage.setItem('popx_user', JSON.stringify(data.user));
      onLogin(data.user);

      // redirect based on role
      navigate(data.user.role === 'admin' ? '/admin' : '/user', { replace: true });
    } catch {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h2 style={s.title}>Sign in</h2>

        <form onSubmit={handleSubmit}>
          <label style={s.label}>Email</label>
          <input name="email" type="email" style={s.input} placeholder="you@example.com"
            value={form.email} onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setError(''); }}
            autoComplete="email" />

          <label style={s.label}>Password</label>
          <input name="password" type="password" style={s.input} placeholder="••••••••"
            value={form.password} onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setError(''); }}
            autoComplete="current-password" />

          {error && <p style={s.error}>{error}</p>}

          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={s.footer}>No account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
}

const s = {
  page:   { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' },
  card:   { background: '#fff', border: '1px solid #e5e5e5', borderRadius: 10, padding: '36px 32px', width: '100%', maxWidth: 360 },
  title:  { fontSize: '1.2rem', fontWeight: 700, marginBottom: 22 },
  label:  { display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#555', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' },
  input:  { display: 'block', width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.9rem', marginBottom: 16, outline: 'none', fontFamily: 'inherit' },
  error:  { fontSize: '0.82rem', color: '#c00', marginBottom: 12 },
  btn:    { width: '100%', padding: '10px', background: '#111', color: '#fff', border: 'none', borderRadius: 7, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', marginTop: 4 },
  footer: { marginTop: 18, fontSize: '0.82rem', color: '#888', textAlign: 'center' },
};
