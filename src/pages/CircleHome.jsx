import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import Nav from '../components/Nav';
import './CircleHome.css';

function CircleHome() {
  const navigate = useNavigate();
  const currentCircle = useStore(state => state.currentCircle);

  if (!currentCircle) {
    navigate('/dashboard');
    return null;
  }

  const navItems = [
    { name: 'Calendar', path: '/calendar', icon: '📅', description: 'View and manage events' },
    { name: 'Messages', path: '/messages', icon: '💬', description: 'Chat with circle members' },
    { name: 'Care Plan', path: '/careplan', icon: '💊', description: 'Medications and care notes' },
    { name: 'Checklist', path: '/checklist', icon: '✓', description: 'Tasks and to-dos' },
    { name: 'Providers', path: '/providers', icon: '🏥', description: 'Healthcare providers' },
    { name: 'Members', path: '/members', icon: '👥', description: 'Manage circle members' }
  ];

  return (
    <div className="circle-home">
      <Nav />
      <div className="circle-home-content">
        <div className="circle-home-header">
          <h1>{currentCircle.name}</h1>
          <p>Choose where you'd like to go</p>
        </div>

        <div className="nav-grid">
          {navItems.map(item => (
            <div key={item.path} className="nav-card" onClick={() => navigate(item.path)}>
              <div className="nav-icon">{item.icon}</div>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CircleHome;
