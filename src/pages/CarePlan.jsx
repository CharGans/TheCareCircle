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
  const [editingMed, setEditingMed] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [showAllMeds, setShowAllMeds] = useState(false);
  const [showAllNotes, setShowAllNotes] = useState(false);
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

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    if (editingNote) {
      await api.careplan.updateNote(currentCircle.id, editingNote.id, noteText);
      setEditingNote(null);
    } else {
      await api.careplan.addNote(currentCircle.id, noteText);
    }
    setNoteText('');
    setShowNoteForm(false);
    loadNotes();
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

  const handleEditNote = (note) => {
    setEditingNote(note);
    setNoteText(note.note);
    setShowNoteForm(true);
  };

  const handleDeleteNote = async (noteId) => {
    if (confirm('Delete this note?')) {
      await api.careplan.deleteNote(currentCircle.id, noteId);
      loadNotes();
    }
  };

  if (!currentCircle) return <div>Select a circle first</div>;

  const displayedMeds = showAllMeds ? medications : medications.slice(0, 3);
  const displayedNotes = showAllNotes ? notes : notes.slice(0, 3);

  return (
    <div className="careplan">
      <Nav />
      <div className="content">
        <h2>Care Plan - {currentCircle.name}</h2>
        
        <div className="two-column-layout">
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
          
          <section>
            <h3>Care Notes</h3>
            <button onClick={() => setShowNoteForm(true)}>Add Note</button>
            
            <div className="notes-list">
              {displayedNotes.map(note => (
                <div key={note.id} className="note-card">
                  <div className="card-actions">
                    <button className="edit-btn" onClick={() => handleEditNote(note)}>✎</button>
                    <button className="delete-btn" onClick={() => handleDeleteNote(note.id)}>×</button>
                  </div>
                  <p>{note.note}</p>
                  <small>By {note.nickname} on {new Date(note.created_at).toLocaleString()}</small>
                </div>
              ))}
            </div>
            {notes.length > 3 && (
              <button className="view-more-btn" onClick={() => setShowAllNotes(!showAllNotes)}>
                {showAllNotes ? '▲ Show Less' : `▼ View More (${notes.length - 3})`}
              </button>
            )}
          </section>
        </div>
      </div>

      {showMedForm && (
        <div className="modal-overlay" onClick={() => { setShowMedForm(false); setEditingMed(null); setMedData({ name: '', dosage: '', schedule: '', notes: '' }); }}>
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

      {showNoteForm && (
        <div className="modal-overlay" onClick={() => { setShowNoteForm(false); setEditingNote(null); setNoteText(''); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingNote ? 'Edit Care Note' : 'Add Care Note'}</h3>
            <form onSubmit={handleNoteSubmit}>
              <textarea
                placeholder="Care note..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                required
              />
              <div className="modal-buttons">
                <button type="submit">{editingNote ? 'Update' : 'Add'}</button>
                <button type="button" onClick={() => { setShowNoteForm(false); setEditingNote(null); setNoteText(''); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CarePlan;
