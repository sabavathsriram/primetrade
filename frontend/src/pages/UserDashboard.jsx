import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '/api/v1')
  : '/api/v1';

const STATUSES   = ['todo', 'in-progress', 'done'];
const PRIORITIES = ['low', 'medium', 'high'];
const EMPTY      = { title: '', description: '', status: 'todo', priority: 'medium' };
const S_COLOR    = { todo: '#888', 'in-progress': '#b45309', done: '#16a34a' };
const P_COLOR    = { low: '#888', medium: '#2563eb', high: '#dc2626' };

export default function UserDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const token   = localStorage.getItem('popx_token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const [tasks,      setTasks]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [form,       setForm]       = useState(EMPTY);
  const [editId,     setEditId]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [msg,        setMsg]        = useState({ text: '', ok: true });
  const [filter,     setFilter]     = useState('');
  const [tab,        setTab]        = useState('tasks'); // 'profile' | 'tasks'

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const qs  = filter ? `?status=${filter}` : '';
      const res = await fetch(`${API}/tasks${qs}`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setTasks(data.tasks);
    } catch (e) { flash(e.message, false); }
    finally { setLoading(false); }
  }, [filter, token]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  function flash(text, ok = true) {
    setMsg({ text, ok });
    setTimeout(() => setMsg({ text: '', ok: true }), 3000);
  }

  function logout() { onLogout(); navigate('/login'); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return flash('Title is required.', false);
    setSubmitting(true);
    try {
      const url    = editId ? `${API}/tasks/${editId}` : `${API}/tasks`;
      const method = editId ? 'PUT' : 'POST';
      const res    = await fetch(url, { method, headers, body: JSON.stringify(form) });
      const data   = await res.json();
      if (!res.ok) throw new Error(data.message);
      flash(editId ? 'Task updated.' : 'Task created.');
      setForm(EMPTY); setEditId(null); loadTasks();
    } catch (e) { flash(e.message, false); }
    finally { setSubmitting(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this task?')) return;
    try {
      const res  = await fetch(`${API}/tasks/${id}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      flash('Task deleted.'); loadTasks();
    } catch (e) { flash(e.message, false); }
  }

  function startEdit(task) {
    setEditId(task._id);
    setForm({ title: task.title, description: task.description || '', status: task.status, priority: task.priority });
    setTab('tasks');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  return (
    <div style={s.page}>
      {/* ── Navbar ── */}
      <div style={s.navbar}>
        <span style={s.brand}>User Panel</span>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={s.navUser}>{user.fullName}</span>
          <span style={s.roleBadge}>user</span>
          <button style={s.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </div>

      <div style={s.wrap}>
        {/* ── Tabs ── */}
        <div style={s.tabs}>
          <button style={{ ...s.tab, ...(tab === 'profile' ? s.tabActive : {}) }} onClick={() => setTab('profile')}>
            Profile
          </button>
          <button style={{ ...s.tab, ...(tab === 'tasks' ? s.tabActive : {}) }} onClick={() => setTab('tasks')}>
            My Tasks {tasks.length > 0 && `(${tasks.length})`}
          </button>
        </div>

        {/* ── Profile tab ── */}
        {tab === 'profile' && (
          <div style={s.card}>
            <p style={s.profileName}>{user.fullName}</p>
            <p style={s.profileEmail}>{user.email}</p>
            <span style={s.roleBadge}>user</span>
          </div>
        )}

        {/* ── Tasks tab ── */}
        {tab === 'tasks' && (
          <>
            {/* form */}
            <div style={s.card}>
              <p style={s.sectionTitle}>{editId ? 'Edit Task' : 'New Task'}</p>
              <form onSubmit={handleSubmit}>
                <input style={s.input} placeholder="Title *" value={form.title} onChange={e => set('title', e.target.value)} />
                <textarea style={{ ...s.input, resize: 'vertical', minHeight: 60 }}
                  placeholder="Description (optional)" value={form.description}
                  onChange={e => set('description', e.target.value)} />
                <div style={s.row}>
                  <div style={s.field}>
                    <label style={s.label}>Status</label>
                    <select style={s.select} value={form.status} onChange={e => set('status', e.target.value)}>
                      {STATUSES.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Priority</label>
                    <select style={s.select} value={form.priority} onChange={e => set('priority', e.target.value)}>
                      {PRIORITIES.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
                {msg.text && <p style={{ fontSize: '0.82rem', color: msg.ok ? '#16a34a' : '#c00', marginBottom: 8 }}>{msg.text}</p>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" style={s.btnPrimary} disabled={submitting}>
                    {submitting ? 'Saving…' : editId ? 'Update' : 'Create'}
                  </button>
                  {editId && (
                    <button type="button" style={s.btnGhost} onClick={() => { setEditId(null); setForm(EMPTY); }}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* filter */}
            <div style={s.filterRow}>
              {['', ...STATUSES].map(v => (
                <button key={v}
                  style={{ ...s.filterBtn, ...(filter === v ? s.filterActive : {}) }}
                  onClick={() => setFilter(v)}>
                  {v || 'All'}
                </button>
              ))}
            </div>

            {/* list */}
            {loading ? (
              <p style={s.empty}>Loading…</p>
            ) : tasks.length === 0 ? (
              <p style={s.empty}>No tasks yet. Create one above.</p>
            ) : (
              <ul style={s.list}>
                {tasks.map(t => (
                  <li key={t._id} style={s.taskCard}>
                    <div style={s.taskTop}>
                      <span style={s.taskTitle}>{t.title}</span>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <span style={{ ...s.badge, background: S_COLOR[t.status] }}>{t.status}</span>
                        <span style={{ ...s.badge, background: P_COLOR[t.priority] }}>{t.priority}</span>
                      </div>
                    </div>
                    {t.description && <p style={s.taskDesc}>{t.description}</p>}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={s.btnSm} onClick={() => startEdit(t)}>Edit</button>
                      <button style={{ ...s.btnSm, color: '#c00', borderColor: '#fca5a5' }} onClick={() => handleDelete(t._id)}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  page:        { minHeight: '100vh', background: '#f5f5f5' },
  navbar:      { background: '#fff', borderBottom: '1px solid #e5e5e5', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  brand:       { fontWeight: 700, fontSize: '0.95rem' },
  navUser:     { fontSize: '0.85rem', color: '#555' },
  roleBadge:   { fontSize: '0.68rem', fontWeight: 700, background: '#eee', color: '#555', padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase' },
  logoutBtn:   { fontSize: '0.82rem', background: 'none', border: 'none', color: '#c00', fontWeight: 600, cursor: 'pointer' },
  wrap:        { maxWidth: 640, margin: '0 auto', padding: '24px 16px 60px' },
  tabs:        { display: 'flex', gap: 8, marginBottom: 20 },
  tab:         { padding: '7px 18px', background: '#fff', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' },
  tabActive:   { background: '#111', color: '#fff', borderColor: '#111' },
  card:        { background: '#fff', border: '1px solid #e5e5e5', borderRadius: 10, padding: '20px', marginBottom: 16 },
  profileName: { fontSize: '1.05rem', fontWeight: 700, marginBottom: 4 },
  profileEmail:{ fontSize: '0.85rem', color: '#888', marginBottom: 12 },
  sectionTitle:{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 14, color: '#333' },
  input:       { display: 'block', width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.88rem', marginBottom: 10, outline: 'none', fontFamily: 'inherit' },
  row:         { display: 'flex', gap: 10, marginBottom: 10 },
  field:       { flex: 1, display: 'flex', flexDirection: 'column', gap: 4 },
  label:       { fontSize: '0.72rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em' },
  select:      { padding: '8px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.88rem', background: '#fff', fontFamily: 'inherit', outline: 'none' },
  btnPrimary:  { padding: '9px 18px', background: '#111', color: '#fff', border: 'none', borderRadius: 6, fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' },
  btnGhost:    { padding: '9px 18px', background: '#fff', color: '#555', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' },
  filterRow:   { display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' },
  filterBtn:   { padding: '4px 12px', background: '#fff', border: '1px solid #ddd', borderRadius: 20, fontSize: '0.78rem', cursor: 'pointer', textTransform: 'capitalize' },
  filterActive:{ background: '#111', color: '#fff', borderColor: '#111' },
  list:        { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 },
  taskCard:    { background: '#fff', border: '1px solid #e5e5e5', borderRadius: 8, padding: '14px 16px' },
  taskTop:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  taskTitle:   { fontWeight: 600, fontSize: '0.9rem' },
  badge:       { fontSize: '0.68rem', fontWeight: 700, color: '#fff', padding: '2px 7px', borderRadius: 20, textTransform: 'capitalize' },
  taskDesc:    { fontSize: '0.82rem', color: '#888', marginBottom: 10 },
  btnSm:       { padding: '4px 12px', background: '#fff', border: '1px solid #ddd', borderRadius: 5, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' },
  empty:       { textAlign: 'center', color: '#aaa', padding: '40px 0', fontSize: '0.88rem' },
};
