import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import useStore from '../store/useStore';
import Nav from '../components/Nav';
import PermissionGuard from '../components/PermissionGuard';
import './Providers.css';

function Providers() {
  const [providers, setProviders] = useState([]);
  const [medications, setMedications] = useState([]);
  const [showProviderForm, setShowProviderForm] = useState(false);
  const [showMedForm, setShowMedForm] = useState(false);
  const [editingProviderId, setEditingProviderId] = useState(null);
  const [editingMed, setEditingMed] = useState(null);
  const [showAllMeds, setShowAllMeds] = useState(false);
  const [providerData, setProviderData] = useState({ name: '', specialty: '', phone: '', hospital: '' });
  const [medData, setMedData] = useState({ name: '', dosage: '', schedule: '', notes: '' });
  const currentCircle = useStore(state => state.currentCircle);

  useEffect(() => {
    if (currentCircle) {
      loadProviders();
      loadMedications();
    }
  }, [currentCircle]);

  const loadProviders = async () => {
    const data = await api.providers.getAll(currentCircle.id);
    setProviders(data);
  };

  const loadMedications = async () => {
    const data = await api.careplan.getMedications(currentCircle.id);
    setMedications(data);
  };

  const handleProviderSubmit = async (e) => {
    e.preventDefault();
    if (editingProviderId) {
      await api.providers.update(currentCircle.id, editingProviderId, providerData);
      setEditingProviderId(null);
    } else {
      await api.providers.create(currentCircle.id, providerData);
    }
    setProviderData({ name: '', specialty: '', phone: '', hospital: '' });
    setShowProviderForm(false);
    loadProviders();
  };

  const handleMedSubmit = async (e) => {
    e.preventDefault();
    if (editingMed) {
      await api.careplan.updateMedication(currentCircle.id, editingMed.id, medData);
      setEditingMed(null);
    } else {
      await api.careplan.addMedication(currentCircle.id, medData);
    }
    setMedData({ name: '', dosage: '', schedule: '', notes: '' });
    setShowMedForm(false);
    loadMedications();
  };

  const handleEditProvider = (provider) => {
    setProviderData({ name: provider.name, specialty: provider.specialty, phone: provider.phone, hospital: provider.hospital });
    setEditingProviderId(provider.id);
    setShowProviderForm(true);
  };

  const handleDeleteProvider = async (providerId) => {
    if (confirm('Delete this provider?')) {
      await api.providers.delete(currentCircle.id, providerId);
      loadProviders();
    }
  };

  const handleEditMed = (med) => {
    setEditingMed(med);
    setMedData({ name: med.name, dosage: med.dosage, schedule: med.schedule, notes: med.notes });
    setShowMedForm(true);
  };

  const handleDeleteMed = async (medId) => {
    if (confirm('Delete this medication?')) {
      await api.careplan.deleteMedication(currentCircle.id, medId);
      loadMedications();
    }
  };

  if (!currentCircle) return <div>Select a circle first</div>;

  const displayedMeds = showAllMeds ? medications : medications.slice(0, 3);

  return (
    <PermissionGuard permission="can_view_providers">
    <div className="providers">
      <Nav />
      <div className="content">
        <h2>Healthcare - {currentCircle.name}</h2>
        
        <div className="two-column-layout">
          <section>
            <h3>Healthcare Providers</h3>
            <button onClick={() => setShowProviderForm(true)}>Add Provider</button>
            
            <div className="providers-list">
              {providers.map(provider => (
                <div key={provider.id} className="provider-card">
                  <div className="card-actions">
                    <button className="edit-btn" onClick={() => handleEditProvider(provider)}>✎</button>
                    <button className="delete-btn" onClick={() => handleDeleteProvider(provider.id)}>×</button>
                  </div>
                  <h4>{provider.name}</h4>
                  <p>{provider.specialty}</p>
                  <p>📞 {provider.phone}</p>
                  <p>🏥 {provider.hospital}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3>Medications</h3>
            <button onClick={() => setShowMedForm(true)}>Add Medication</button>
            
            <div className="medications-list">
              {displayedMeds.map(med => (
                <div key={med.id} className="med-card">
                  <div className="card-actions">
                    <button className="edit-btn" onClick={() => handleEditMed(med)}>✎</button>
                    <button className="delete-btn" onClick={() => handleDeleteMed(med.id)}>×</button>
                  </div>
                  <h4>{med.name}</h4>
                  <p>Dosage: {med.dosage}</p>
                  <p>Schedule: {med.schedule}</p>
                  <p>{med.notes}</p>
                </div>
              ))}
            </div>
            {medications.length > 3 && (
              <button className="view-more-btn" onClick={() => setShowAllMeds(!showAllMeds)}>
                {showAllMeds ? '▲ Show Less' : `▼ View More (${medications.length - 3})`}
              </button>
            )}
          </section>
        </div>
      </div>
      
      {showProviderForm && (
        <div className="modal" onClick={() => { setShowProviderForm(false); setEditingProviderId(null); setProviderData({ name: '', specialty: '', phone: '', hospital: '' }); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingProviderId ? 'Edit Healthcare Provider' : 'Add Healthcare Provider'}</h3>
            <form onSubmit={handleProviderSubmit}>
              <input
                type="text"
                placeholder="Provider Name"
                value={providerData.name}
                onChange={(e) => setProviderData({...providerData, name: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Specialty"
                value={providerData.specialty}
                onChange={(e) => setProviderData({...providerData, specialty: e.target.value})}
              />
              <input
                type="text"
                placeholder="Phone"
                value={providerData.phone}
                onChange={(e) => setProviderData({...providerData, phone: e.target.value})}
              />
              <input
                type="text"
                placeholder="Hospital"
                value={providerData.hospital}
                onChange={(e) => setProviderData({...providerData, hospital: e.target.value})}
              />
              <button type="submit">{editingProviderId ? 'Update' : 'Add'}</button>
              <button type="button" onClick={() => { setShowProviderForm(false); setEditingProviderId(null); setProviderData({ name: '', specialty: '', phone: '', hospital: '' }); }}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {showMedForm && (
        <div className="modal" onClick={() => { setShowMedForm(false); setEditingMed(null); setMedData({ name: '', dosage: '', schedule: '', notes: '' }); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingMed ? 'Edit Medication' : 'Add Medication'}</h3>
            <form onSubmit={handleMedSubmit}>
              <input
                type="text"
                placeholder="Medication Name"
                value={medData.name}
                onChange={(e) => setMedData({...medData, name: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Dosage"
                value={medData.dosage}
                onChange={(e) => setMedData({...medData, dosage: e.target.value})}
              />
              <input
                type="text"
                placeholder="Schedule (e.g., 8am, 2pm, 8pm)"
                value={medData.schedule}
                onChange={(e) => setMedData({...medData, schedule: e.target.value})}
              />
              <textarea
                placeholder="Notes"
                value={medData.notes}
                onChange={(e) => setMedData({...medData, notes: e.target.value})}
              />
              <div className="modal-buttons">
                <button type="submit">{editingMed ? 'Update' : 'Add'}</button>
                <button type="button" onClick={() => { setShowMedForm(false); setEditingMed(null); setMedData({ name: '', dosage: '', schedule: '', notes: '' }); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </PermissionGuard>
  );
}

export default Providers;
