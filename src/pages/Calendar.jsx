import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import useStore from '../store/useStore';
import Nav from '../components/Nav';
import './Calendar.css';

function Calendar() {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    event_date: '',
    event_time: '',
    location: '',
    notes: ''
  });
  const currentCircle = useStore(state => state.currentCircle);

  useEffect(() => {
    if (currentCircle) loadEvents();
  }, [currentCircle]);

  const loadEvents = async () => {
    const data = await api.events.getAll(currentCircle.id);
    setEvents(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.events.create(currentCircle.id, formData);
    setFormData({ title: '', event_date: '', event_time: '', location: '', notes: '' });
    setShowForm(false);
    loadEvents();
  };

  const claimEvent = async (eventId) => {
    await api.events.claim(currentCircle.id, eventId);
    loadEvents();
  };

  if (!currentCircle) return <div>Select a circle first</div>;

  return (
    <div className="calendar">
      <Nav />
      <div className="content">
        <h2>Calendar - {currentCircle.name}</h2>
        <button onClick={() => setShowForm(true)}>Add Event</button>
        
        {showForm && (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Event Title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
            <input
              type="date"
              value={formData.event_date}
              onChange={(e) => setFormData({...formData, event_date: e.target.value})}
              required
            />
            <input
              type="time"
              value={formData.event_time}
              onChange={(e) => setFormData({...formData, event_time: e.target.value})}
            />
            <input
              type="text"
              placeholder="Location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
            <textarea
              placeholder="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
            <button type="submit">Add</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </form>
        )}
        
        <div className="events-list">
          {events.map(event => (
            <div key={event.id} className="event-card">
              <h3>{event.title}</h3>
              <p>📅 {event.event_date} {event.event_time}</p>
              <p>📍 {event.location}</p>
              <p>{event.notes}</p>
              {event.responsible_name ? (
                <p>✓ Claimed by {event.responsible_name}</p>
              ) : (
                <button onClick={() => claimEvent(event.id)}>Claim Responsibility</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Calendar;
