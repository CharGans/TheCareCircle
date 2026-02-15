import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../utils/api';
import useStore from '../store/useStore';
import './Nav.css';

function Nav() {
  const [showAccount, setShowAccount] = useState(false);
  const [nickname, setNickname] = useState('');
  const navigate = useNavigate();
  const { logout, currentCircle, user, setUser } = useStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleUpdateNickname = async (e) => {
    e.preventDefault();
    const data = await api.user.updateNickname(nickname);
    setUser(data.user);
    setNickname('');
    setShowAccount(false);
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? All circles you own will be permanently deleted. This action cannot be undone.')) {
      await api.user.deleteAccount();
      logout();
      navigate('/');
    }
  };

  if (!currentCircle) return null;

  return (
    <>
      <nav>
        <h2 onClick={() => navigate('/circle-home')} style={{ cursor: 'pointer' }}>
          TheCareCircle - {currentCircle.name}
        </h2>
        <div className="nav-links">
          <a onClick={() => navigate('/dashboard')}>All Circles</a>
          <a onClick={() => navigate('/circle-home')}>Home</a>
          <a onClick={() => setShowAccount(true)}>{user?.nickname || 'Account'}</a>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      
      {showAccount && (
        <div className="modal" onClick={() => setShowAccount(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Account Settings</h3>
            <form onSubmit={handleUpdateNickname}>
              <label>Change Nickname</label>
              <input
                type="text"
                placeholder={user?.nickname || 'New nickname'}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
              <button type="submit">Update Nickname</button>
            </form>
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #e0e0e0' }}>
              <button 
                onClick={handleDeleteAccount}
                style={{ 
                  width: '100%',
                  padding: '12px',
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Delete Account
              </button>
              <p style={{ fontSize: '13px', color: '#666', marginTop: '10px', textAlign: 'center' }}>
                Warning: All circles you own will be permanently deleted
              </p>
            </div>
            <button 
              type="button" 
              onClick={() => setShowAccount(false)}
              style={{ 
                width: '100%',
                marginTop: '15px',
                padding: '12px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Nav;
