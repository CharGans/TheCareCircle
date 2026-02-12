import { useNavigate, useLocation } from 'react-router-dom';
import useStore from '../store/useStore';
import './Nav.css';

function Nav() {
  const navigate = useNavigate();
  const { logout, currentCircle } = useStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!currentCircle) return null;

  return (
    <nav>
      <h2 onClick={() => navigate('/circle-home')} style={{ cursor: 'pointer' }}>
        TheCareCircle - {currentCircle.name}
      </h2>
      <div className="nav-links">
        <a onClick={() => navigate('/dashboard')}>All Circles</a>
        <a onClick={() => navigate('/circle-home')}>Home</a>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Nav;
