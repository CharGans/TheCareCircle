import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import useStore from '../store/useStore';
import Nav from '../components/Nav';
import PermissionGuard from '../components/PermissionGuard';
import './CarePlan.css';

function CarePlan() {
  const [notes, setNotes] = useState([]);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [noteText, setNoteText] = useState('');
  const currentCircle = useStore(state => state.currentCircle);

  useEffect(() => {
    if (currentCircle) {
      loadNotes();
    }
  }, [currentCircle]);

  const loadNotes = async () => {
    const data = await api.careplan.getNotes(currentCircle.id);
    setNotes(data);
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

  const displayedNotes = showAllNotes ? notes : notes.slice(0, 3);

  return (
    <PermissionGuard permission="can_view_careplan">
    <div className="careplan">
      <Nav />
      <div className="content">
        <h2>Care Journal - {currentCircle.name}</h2>
        
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
    </PermissionGuard>
  );
}

export default CarePlan;
