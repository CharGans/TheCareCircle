import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import useStore from '../store/useStore';
import Nav from '../components/Nav';
import './Dashboard.css';

function Dashboard() {
  const [circles, setCircles] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [circleName, setCircleName] = useState('');
  const { setCurrentCircle } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadCircles();
  }, []);

  const loadCircles = async () => {
    const data = await api.circles.getAll();
    setCircles(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.circles.create({ name: circleName });
    setCircleName('');
    setShowCreate(false);
    loadCircles();
  };

  const selectCircle = (circle) => {
    setCurrentCircle(circle);
    navigate('/calendar');
  };

  return (
    <div className="dashboard">
      <Nav />
      <div className="content">
        <div className="dashboard-header">
          <h2>My Care Circles</h2>
          <p>Select a circle to get started or create a new one</p>
        </div>
        
        <div className="circles-list">
          {circles.map(circle => (
            <div key={circle.id} className="circle-card" onClick={() => selectCircle(circle)}>
              <div className="circle-icon">{circle.name.charAt(0).toUpperCase()}</div>
              <h3>{circle.name}</h3>
            </div>
          ))}
          
          <div className="circle-card create-circle-card" onClick={() => setShowCreate(true)} title="Create new circle">
            <div className="circle-icon create-icon">+</div>
            <h3>Create New Circle</h3>
          </div>
        </div>
        
        {showCreate && (
          <div className="modal" onClick={() => setShowCreate(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Create New Circle</h3>
              <form onSubmit={handleCreate}>
                <input
                  type="text"
                  placeholder="Circle Name"
                  value={circleName}
                  onChange={(e) => setCircleName(e.target.value)}
                  required
                />
                <button type="submit">Create</button>
                <button type="button" onClick={() => setShowCreate(false)}>Cancel</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
