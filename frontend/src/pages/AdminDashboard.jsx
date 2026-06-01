import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '/api/v1')
  : '/api/v1';

const S_COLOR = { todo: '#888', 'in-progress': '#b45309', done: '#16a34a' };
const P_COLOR = { low: '#888', medium: '#2563eb', high: '#dc2626' };

export default function AdminDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const token   = localStorage.getItem('popx_token');
  const headers = { Authorization: `Bearer ${token}` };

  const [tab,   setTab]   = useState('users');
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [msg,   setMsg]   = useState({ text: '', ok: true });

  useEffect(() => { fetchUsers(); fetchTasks(); }, []);

  async function fetchUsers() {
    try {
      const res  = await fetch(`${API}/admin/users`, { headers });
      const data = await res.json();
      if (res.ok) setUsers(data.users);
    } catch {}
  }

  async function fetchTasks() {
    try {
      const res  = await fetch(`${API}/admin/tasks`, { headers });
      const data = await res.json();
      if (res.ok) setTasks(data.tasks);
    } catch {}
  }

  async function deleteTask(id) {
    if (!window.confirm('Delete this task?')) return;
    try {
      const res  = await fetch(`${API}/admin/tasks/${id}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      flash('Task deleted.'); fetchTasks();
    } catch (e) { flash(e.message, false); }
  }

  function flash(text, ok = true) {
    setMsg({ text, ok });
    setTimeout(() => setMsg({ text: '', ok: true }), 3000);
  }

  function logout() { onLogout(); navigate('/login'); }

  return (
    <div style={s.page}>
      {/* ── Navbar ── */}
      <div style={s.navbar}>
        <span style={s.brand}>Admin Panel</span>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={s.navUser}>{user.fullName}</span>
          <span style={s.roleBadge}>admin</span>
          <button style={s.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </div>

      <div style={s.wrap}>
        {/* ── Tabs ── */}
        <div style={s.tabs}>
          <button style={{ ...s.tab, ...(tab === 'users' ? s.tabActive : {}) }} onClick={() => setTab('users')}>
            All Users {users.length > 0 && `(${users.length})`}
          </button>
          <button style={{ ...s.tab, ...(tab === 'tasks' ? s.tabActive : {}) }} onClick={() => setTab('tasks')}>
            All Tasks {tasks.length > 0 && `(${tasks.length})`}
          </button>
        </div>

        {msg.text && <p style={{ fontSize: '0.82rem', color: msg.ok ? '#16a34a' : '#c00', marginBottom: 12 }}>{msg.text}</p>}

        {/* ── Users tab ── */}
        {tab === 'users' && (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Name</th>
                  <th style={s.th}>Email</th>
                  <th style={s.th}>Role</th>
                  <th style={s.th}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={s.tr}>
                    <td style={s.td}>{u.fullName}</td>
                    <td style={s.td}>{u.email}</td>
                    <td style={s.td}>
                      <span style={{ ...s.badge, background: u.role === 'admin' ? '#111' : '#eee', color: u.role === 'admin' ? '#fff' : '#555' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ ...s.td, color: '#888' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <p style={s.empty}>No users found.</p>}
          </div>
        )}

        {/* ── Tasks tab ── */}
        {tab === 'tasks' && (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Title</th>
                  <th style={s.th}>Owner</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Priority</th>
                  <th style={s.th}></th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t._id} style={s.tr}>
                    <td style={s.td}>{t.title}</td>
                    <td style={{ ...s.td, color: '#888' }}>{t.owner?.fullName || '—'}</td>
                    <td style={s.td}>
                      <span style={{ ...s.badge, background: S_COLOR[t.status], color: '#fff' }}>{t.status}</span>
                    </td>
                    <td style={s.td}>
                      <span style={{ ...s.badge, background: P_COLOR[t.priority], color: '#fff' }}>{t.priority}</span>
                    </td>
                    <td style={s.td}>
                      <button style={s.delBtn} onClick={() => deleteTask(t._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tasks.length === 0 && <p style={s.empty}>No tasks found.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page:     { minHeight: '100vh', background: '#f5f5f5' },
  navbar:   { background: '#111', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  brand:    { fontWeight: 700, fontSize: '0.95rem', color: '#fff' },
  navUser:  { fontSize: '0.85rem', color: '#aaa' },
  roleBadge:{ fontSize: '0.68rem', fontWeight: 700, background: '#333', color: '#fff', padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase' },
  logoutBtn:{ fontSize: '0.82rem', background: 'none', border: '1px solid #444', color: '#ccc', fontWeight: 600, cursor: 'pointer', padding: '3px 10px', borderRadius: 5 },
  wrap:     { maxWidth: 900, margin: '0 auto', padding: '24px 16px 60px' },
  tabs:     { display: 'flex', gap: 8, marginBottom: 20 },
  tab:      { padding: '7px 18px', background: '#fff', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' },
  tabActive:{ background: '#111', color: '#fff', borderColor: '#111' },
  tableWrap:{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 10, overflow: 'auto' },
  table:    { width: '100%', borderCollapse: 'collapse' },
  th:       { padding: '10px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#888', borderBottom: '1px solid #e5e5e5', whiteSpace: 'nowrap' },
  tr:       { borderBottom: '1px solid #f0f0f0' },
  td:       { padding: '11px 14px', fontSize: '0.88rem' },
  badge:    { display: 'inline-block', fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: 20, textTransform: 'capitalize' },
  delBtn:   { padding: '3px 10px', background: '#fff', border: '1px solid #fca5a5', borderRadius: 5, fontSize: '0.75rem', fontWeight: 600, color: '#c00', cursor: 'pointer' },
  empty:    { textAlign: 'center', color: '#aaa', padding: '30px 0', fontSize: '0.88rem' },
};
