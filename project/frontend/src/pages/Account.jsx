import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Account.css';

export default function Account({ user, onLogout }) {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [avatar, setAvatar] = useState(user?.avatar || null);

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatar(ev.target.result);
      const stored = JSON.parse(localStorage.getItem('popx_user') || '{}');
      stored.avatar = ev.target.result;
      localStorage.setItem('popx_user', JSON.stringify(stored));
    };
    reader.readAsDataURL(file);
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="account-container">

      {/* ── Header ── */}
      <div className="account-header">
        <h2 className="account-title">Account Settings</h2>
      </div>

      {/* ── White card: avatar + name/email + bio ── */}
      <div className="account-card">

        {/* Profile row */}
        <div className="profile-row">
          <div className="avatar-wrapper">
            <img
              src={
                avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=6c3ce1&color=fff&size=80`
              }
              alt={user.fullName}
              className="avatar-img"
            />
            <button
              className="avatar-edit-btn"
              onClick={() => fileRef.current.click()}
              aria-label="Change profile picture"
            >
              {/* Camera icon */}
              <svg viewBox="0 0 24 24" fill="white" width="13" height="13">
                <path d="M12 15.2A3.2 3.2 0 1 1 12 8.8a3.2 3.2 0 0 1 0 6.4zm7-10.2h-1.8l-1.4-2H8.2L6.8 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" />
              </svg>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </div>

          <div className="profile-info">
            <p className="profile-name">{user.fullName}</p>
            <p className="profile-email">{user.email}</p>
          </div>
        </div>

        {/* Bio */}
        <p className="account-bio">
          Lorem Ipsum Dolor Sit Amet, Consetetur Sadipscing Elitr, Sed Diam
          Nonumy Eirmod Tempor Invidunt Ut Labore Et Dolore Magna Aliquyam
          Erat, Sed Diam
        </p>

        {/* Dashed divider */}
        <div className="dashed-divider" />
      </div>

    </div>
  );
}
