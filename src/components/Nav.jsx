import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import './Nav.css';

function Nav() {
  const navigate = useNavigate();
  const { logout, currentCircle } = useStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav>
      <h2>{currentCircle?.name || 'TheCareCircle'}</h2>
      <div className="nav-links">
        <a onClick={() => navigate('/dashboard')}>Dashboard</a>
        <a onClick={() => navigate('/calendar')}>Calendar</a>
        <a onClick={() => navigate('/messages')}>Messages</a>
        <a onClick={() => navigate('/careplan')}>Care Plan</a>
        <a onClick={() => navigate('/checklist')}>Checklist</a>
        <a onClick={() => navigate('/providers')}>Providers</a>
        <a onClick={() => navigate('/manage')}>Manage</a>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Nav;
