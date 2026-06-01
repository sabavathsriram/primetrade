import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={s.page}>
      <div style={s.box}>
        <h1 style={s.title}>Task Manager</h1>
        <p style={s.sub}>JWT auth · Role-based access · Task CRUD</p>
        <button style={s.btnPrimary} onClick={() => navigate('/register')}>Register</button>
        <button style={s.btnSecondary} onClick={() => navigate('/login')}>Login</button>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f5f5',
  },
  box: {
    background: '#fff',
    border: '1px solid #e5e5e5',
    borderRadius: 10,
    padding: '40px 36px',
    width: '100%',
    maxWidth: 380,
    textAlign: 'center',
  },
  title: { fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 },
  sub:   { fontSize: '0.85rem', color: '#888', marginBottom: 28 },
  btnPrimary: {
    display: 'block',
    width: '100%',
    padding: '11px',
    background: '#111',
    color: '#fff',
    border: 'none',
    borderRadius: 7,
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: 10,
  },
  btnSecondary: {
    display: 'block',
    width: '100%',
    padding: '11px',
    background: '#fff',
    color: '#111',
    border: '1px solid #ddd',
    borderRadius: 7,
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
