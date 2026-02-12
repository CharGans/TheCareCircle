import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import useStore from '../store/useStore';
import Nav from '../components/Nav';
import './CarePlan.css';

function CarePlan() {
  const [medications, setMedications] = useState([]);
  const [notes, setNotes] = useState([]);
  const [showMedForm, setShowMedForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [medData, setMedData] = useState({ name: '', dosage: '', schedule: '', notes: '' });
  const [noteText, setNoteText] = useState('');
  const currentCircle = useStore(state => state.currentCircle);

  useEffect(() => {
    if (currentCircle) {
      loadMedications();
      loadNotes();
    }
  }, [currentCircle]);

  const loadMedications = async () => {
    const data = await api.careplan.getMedications(currentCircle.id);
    setMedications(data);
  };

  const loadNotes = async () => {
    const data = await api.careplan.getNotes(currentCircle.id);
    setNotes(data);
  };

  const handleMedSubmit = async (e) => {
    e.preventDefault();
    await api.careplan.addMedication(currentCircle.id, medData);
    setMedData({ name: '', dosage: '', schedule: '', notes: '' });
    setShowMedForm(false);
    loadMedications();
  };

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    await api.careplan.addNote(currentCircle.id, noteText);
    setNoteText('');
    setShowNoteForm(false);
    loadNotes();
  };

  if (!currentCircle) return <div>Select a circle first</div>;

  return (
    <div className="careplan">
      <Nav />
      <div className="content">
        <h2>Care Plan - {currentCircle.name}</h2>
        
        <section>
          <h3>Medications</h3>
          <button onClick={() => setShowMedForm(true)}>Add Medication</button>
          
          {showMedForm && (
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
              <button type="submit">Add</button>
              <button type="button" onClick={() => setShowMedForm(false)}>Cancel</button>
            </form>
          )}
          
          <div className="medications-list">
            {medications.map(med => (
              <div key={med.id} className="med-card">
                <h4>{med.name}</h4>
                <p>Dosage: {med.dosage}</p>
                <p>Schedule: {med.schedule}</p>
                <p>{med.notes}</p>
              </div>
            ))}
          </div>
        </section>
        
        <section>
          <h3>Care Notes</h3>
          <button onClick={() => setShowNoteForm(true)}>Add Note</button>
          
          {showNoteForm && (
            <form onSubmit={handleNoteSubmit}>
              <textarea
                placeholder="Care note..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                required
              />
              <button type="submit">Add</button>
              <button type="button" onClick={() => setShowNoteForm(false)}>Cancel</button>
            </form>
          )}
          
          <div className="notes-list">
            {notes.map(note => (
              <div key={note.id} className="note-card">
                <p>{note.note}</p>
                <small>By {note.nickname} on {new Date(note.created_at).toLocaleString()}</small>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default CarePlan;
