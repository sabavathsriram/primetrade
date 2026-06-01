import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing  from './pages/Landing';
import Login    from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const s = localStorage.getItem('popx_user');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  function logout() {
    localStorage.removeItem('popx_token');
    localStorage.removeItem('popx_user');
    setUser(null);
  }

  // after login, route based on role
  function handleLogin(userData) {
    setUser(userData);
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route
          path="/login"
          element={
            user
              ? <Navigate to={user.role === 'admin' ? '/admin' : '/user'} replace />
              : <Login onLogin={handleLogin} />
          }
        />

        <Route
          path="/register"
          element={
            user
              ? <Navigate to={user.role === 'admin' ? '/admin' : '/user'} replace />
              : <Register onLogin={handleLogin} />
          }
        />

        {/* USER panel — only accessible by role=user */}
        <Route
          path="/user/*"
          element={
            !user
              ? <Navigate to="/login" replace />
              : user.role !== 'user'
              ? <Navigate to="/admin" replace />
              : <UserDashboard user={user} onLogout={logout} />
          }
        />

        {/* ADMIN panel — only accessible by role=admin */}
        <Route
          path="/admin/*"
          element={
            !user
              ? <Navigate to="/login" replace />
              : user.role !== 'admin'
              ? <Navigate to="/user" replace />
              : <AdminDashboard user={user} onLogout={logout} />
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
