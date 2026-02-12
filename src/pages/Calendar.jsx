import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import useStore from '../store/useStore';
import Nav from '../components/Nav';
import './Calendar.css';

function Calendar() {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
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

  const unclaimEvent = async (eventId) => {
    await api.events.unclaim(currentCircle.id, eventId);
    loadEvents();
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const hasEvent = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.some(e => {
      const eventDate = typeof e.event_date === 'string' ? e.event_date.split('T')[0] : 
                        e.event_date instanceof Date ? e.event_date.toISOString().split('T')[0] : e.event_date;
      return eventDate === dateStr;
    });
  };

  const getEventsForDay = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => {
      const eventDate = typeof e.event_date === 'string' ? e.event_date.split('T')[0] : 
                        e.event_date instanceof Date ? e.event_date.toISOString().split('T')[0] : e.event_date;
      return eventDate === dateStr;
    });
  };

  const getEventStatus = (day) => {
    const dayEvents = getEventsForDay(day);
    if (dayEvents.length === 0) return null;
    return dayEvents.every(e => e.responsible_user_id) ? 'claimed' : 'unclaimed';
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  if (!currentCircle) return <div>Select a circle first</div>;

  return (
    <div className="calendar">
      <Nav />
      <div className="content">
        <h2>Calendar - {currentCircle.name}</h2>
        
        <div className="calendar-controls">
          <button onClick={() => changeMonth(-1)}>←</button>
          <h3>{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
          <button onClick={() => changeMonth(1)}>→</button>
        </div>

        <div className="calendar-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="calendar-day-header">{day}</div>
          ))}
          {Array.from({ length: getDaysInMonth(currentDate).firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="calendar-day empty"></div>
          ))}
          {Array.from({ length: getDaysInMonth(currentDate).daysInMonth }).map((_, i) => {
            const day = i + 1;
            const hasEventDay = hasEvent(day);
            const eventStatus = getEventStatus(day);
            return (
              <div 
                key={day} 
                className={`calendar-day ${isToday(day) ? 'today' : ''} clickable`}
                onClick={() => setSelectedDay(day)}
              >
                <span className="day-number">{day}</span>
                {hasEventDay && <span className={`event-indicator ${eventStatus}`}>●</span>}
              </div>
            );
          })}
        </div>

        <button onClick={() => {
          setFormData({ title: '', event_date: '', event_time: '', location: '', notes: '' });
          setShowForm(true);
        }}>Add Event</button>

        {selectedDay && (
          <div className="modal" onClick={() => setSelectedDay(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Events on {currentDate.toLocaleDateString('en-US', { month: 'long' })} {selectedDay}</h3>
              {getEventsForDay(selectedDay).length > 0 ? (
                getEventsForDay(selectedDay).map(event => (
                  <div key={event.id} className="modal-event">
                    <h4>{event.title}</h4>
                    <p>⏰ {event.event_time}</p>
                    <p>📍 {event.location}</p>
                    <p>{event.notes}</p>
                    {event.responsible_name ? (
                      <div>
                        <p>✓ Claimed by {event.responsible_name}</p>
                        <button onClick={() => { unclaimEvent(event.id); setSelectedDay(null); }}>Unclaim</button>
                      </div>
                    ) : (
                      <button onClick={() => { claimEvent(event.id); setSelectedDay(null); }}>Claim</button>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-events">
                  <p>No events scheduled for this day.</p>
                  <button onClick={() => {
                    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
                    setFormData({...formData, event_date: dateStr});
                    setSelectedDay(null);
                    setShowForm(true);
                  }}>Add Event</button>
                </div>
              )}
              <button onClick={() => setSelectedDay(null)}>Close</button>
            </div>
          </div>
        )}
        
        {showForm && (
          <div className="modal" onClick={() => setShowForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Add New Event</h3>
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
                <button type="submit">Add Event</button>
                <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
              </form>
            </div>
          </div>
        )}
        
        <div className="events-list">
          {events.map(event => (
            <div key={event.id} className="event-card">
              <h3>{event.title}</h3>
              <p>📅 {event.event_date} {event.event_time}</p>
              <p>📍 {event.location}</p>
              <p>{event.notes}</p>
              {event.responsible_name ? (
                <div>
                  <p>✓ Claimed by {event.responsible_name}</p>
                  <button onClick={() => unclaimEvent(event.id)}>Unclaim</button>
                </div>
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
