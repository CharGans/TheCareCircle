import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import useStore from '../store/useStore';
import Nav from '../components/Nav';
import './Providers.css';

function Providers() {
  const [providers, setProviders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', specialty: '', phone: '', hospital: '' });
  const currentCircle = useStore(state => state.currentCircle);

  useEffect(() => {
    if (currentCircle) loadProviders();
  }, [currentCircle]);

  const loadProviders = async () => {
    const data = await api.providers.getAll(currentCircle.id);
    setProviders(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await api.providers.update(currentCircle.id, editingId, formData);
      setEditingId(null);
    } else {
      await api.providers.create(currentCircle.id, formData);
    }
    setFormData({ name: '', specialty: '', phone: '', hospital: '' });
    setShowForm(false);
    loadProviders();
  };

  const handleEdit = (provider) => {
    setFormData({ name: provider.name, specialty: provider.specialty, phone: provider.phone, hospital: provider.hospital });
    setEditingId(provider.id);
    setShowForm(true);
  };

  const handleDelete = async (providerId) => {
    await api.providers.delete(currentCircle.id, providerId);
    loadProviders();
  };

  if (!currentCircle) return <div>Select a circle first</div>;

  return (
    <div className="providers">
      <Nav />
      <div className="content">
        <h2>Healthcare Providers - {currentCircle.name}</h2>
        <button onClick={() => setShowForm(true)}>Add Provider</button>
        
        <div className="providers-list">
          {providers.map(provider => (
            <div key={provider.id} className="provider-card">
              <button className="delete-btn" onClick={() => handleDelete(provider.id)}>×</button>
              <h3>{provider.name}</h3>
              <p>{provider.specialty}</p>
              <p>📞 {provider.phone}</p>
              <p>🏥 {provider.hospital}</p>
              <div className="provider-actions">
                <button className="edit-btn" onClick={() => handleEdit(provider)}>Edit</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {showForm && (
        <div className="modal" onClick={() => { setShowForm(false); setEditingId(null); setFormData({ name: '', specialty: '', phone: '', hospital: '' }); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? 'Edit Healthcare Provider' : 'Add Healthcare Provider'}</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Provider Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Specialty"
                value={formData.specialty}
                onChange={(e) => setFormData({...formData, specialty: e.target.value})}
              />
              <input
                type="text"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
              <input
                type="text"
                placeholder="Hospital"
                value={formData.hospital}
                onChange={(e) => setFormData({...formData, hospital: e.target.value})}
              />
              <button type="submit">{editingId ? 'Update' : 'Add'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setFormData({ name: '', specialty: '', phone: '', hospital: '' }); }}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Providers;
