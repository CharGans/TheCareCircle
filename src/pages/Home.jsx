import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <header>
        <h1>TheCareCircle</h1>
        <div className="auth-buttons">
          <button onClick={() => navigate('/login')}>Login</button>
          <button onClick={() => navigate('/register')}>Register</button>
        </div>
      </header>
      
      <section className="hero">
        <h2>Coordinate Care Together</h2>
        <p>Connect families and caregivers to provide better care for your loved ones</p>
        <button className="cta" onClick={() => navigate('/register')}>Create a Care Circle</button>
      </section>
      
      <section className="about">
        <h3>About TheCareCircle</h3>
        <p>TheCareCircle helps families and home health aides communicate effectively to provide the best care possible. Coordinate schedules, share care plans, track medications, and stay connected with everyone involved in your loved one's care.</p>
        
        <div className="features">
          <div className="feature">
            <h4>📅 Shared Calendar</h4>
            <p>Coordinate appointments and events</p>
          </div>
          <div className="feature">
            <h4>💬 Group Messaging</h4>
            <p>Stay in touch with all caregivers</p>
          </div>
          <div className="feature">
            <h4>💊 Care Plans</h4>
            <p>Track medications and care notes</p>
          </div>
          <div className="feature">
            <h4>✓ Task Management</h4>
            <p>Organize and assign care tasks</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
