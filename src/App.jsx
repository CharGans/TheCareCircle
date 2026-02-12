import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store/useStore';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CircleHome from './pages/CircleHome';
import Calendar from './pages/Calendar';
import Messages from './pages/Messages';
import CarePlan from './pages/CarePlan';
import Checklist from './pages/Checklist';
import Providers from './pages/Providers';
import ManageMembers from './pages/ManageMembers';
import './App.css';

function App() {
  const token = useStore(state => state.token);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/circle-home" element={token ? <CircleHome /> : <Navigate to="/login" />} />
        <Route path="/calendar" element={token ? <Calendar /> : <Navigate to="/login" />} />
        <Route path="/messages" element={token ? <Messages /> : <Navigate to="/login" />} />
        <Route path="/careplan" element={token ? <CarePlan /> : <Navigate to="/login" />} />
        <Route path="/checklist" element={token ? <Checklist /> : <Navigate to="/login" />} />
        <Route path="/providers" element={token ? <Providers /> : <Navigate to="/login" />} />
        <Route path="/members" element={token ? <ManageMembers /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
