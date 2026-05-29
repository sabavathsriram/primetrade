import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';

function App() {
  // Restore user from localStorage on first load
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('popx_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  function handleLogin(userData) {
    setUser(userData);
  }

  function handleLogout() {
    setUser(null);
  }

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/login"
            element={
              user ? <Navigate to="/account" replace /> : <Login onLogin={handleLogin} />
            }
          />
          <Route
            path="/register"
            element={
              user ? <Navigate to="/account" replace /> : <Register onLogin={handleLogin} />
            }
          />
          <Route
            path="/account"
            element={
              user
                ? <Account user={user} onLogout={handleLogout} />
                : <Navigate to="/login" replace />
            }
          />
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
