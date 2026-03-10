import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import Nav from '../components/Nav';
import { usePermissions } from '../hooks/usePermissions';
import './CircleHome.css';

function CircleHome() {
  const navigate = useNavigate();
  const currentCircle = useStore(state => state.currentCircle);
  const userRole = useStore(state => state.userRole);
  const { permissions, loading } = usePermissions();

  if (!currentCircle) {
    navigate('/dashboard');
    return null;
  }

  if (loading) return <div>Loading...</div>;

  const navItems = [
    { name: 'Calendar', path: '/calendar', icon: '📅', description: 'View and manage events', permission: 'can_view_calendar' },
    { name: 'Messages', path: '/messages', icon: '💬', description: 'Chat with circle members', permission: 'can_view_messages' },
    { name: 'Care Plan', path: '/careplan', icon: '💊', description: 'Medications and care notes', permission: 'can_view_careplan' },
    { name: 'Checklist', path: '/checklist', icon: '✓', description: 'Tasks and to-dos', permission: 'can_view_checklist' },
    { name: 'Providers', path: '/providers', icon: '🏥', description: 'Healthcare providers', permission: 'can_view_providers' }
  ];

  if (permissions?.can_view_members) {
    navItems.push({ name: 'Members', path: '/members', icon: '👥', description: 'Manage circle members', permission: 'can_view_members' });
  }

  const filteredItems = navItems.filter(item => permissions?.[item.permission]);

  return (
    <div className="circle-home">
      <Nav />
      <div className="circle-home-content">
        <div className="circle-home-header">
          <h1>{currentCircle.name}</h1>
          <p>Choose where you'd like to go</p>
        </div>

        <div className="nav-grid">
          {filteredItems.map(item => (
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
