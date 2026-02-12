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
  const [timeInputs, setTimeInputs] = useState({ hour: '12', minute: '00', period: 'PM' });
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
    const hour24 = timeInputs.period === 'PM' && timeInputs.hour !== '12' 
      ? String(parseInt(timeInputs.hour) + 12) 
      : timeInputs.period === 'AM' && timeInputs.hour === '12' 
      ? '00' 
      : timeInputs.hour.padStart(2, '0');
    const timeString = `${hour24}:${timeInputs.minute}`;
    await api.events.create(currentCircle.id, { ...formData, event_time: timeString });
    setFormData({ title: '', event_date: '', event_time: '', location: '', notes: '' });
    setTimeInputs({ hour: '12', minute: '00', period: 'PM' });
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

  const deleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      await api.events.delete(currentCircle.id, eventId);
      loadEvents();
    }
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

  const getUpcomingEvents = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return events
      .filter(e => {
        const eventDateStr = typeof e.event_date === 'string' ? e.event_date.split('T')[0] : e.event_date;
        const eventDate = new Date(eventDateStr);
        return eventDate >= now;
      })
      .slice(0, 3);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
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
                        <button className="delete-btn" onClick={() => { deleteEvent(event.id); setSelectedDay(null); }}>Delete</button>
                      </div>
                    ) : (
                      <div>
                        <button onClick={() => { claimEvent(event.id); setSelectedDay(null); }}>Claim</button>
                        <button className="delete-btn" onClick={() => { deleteEvent(event.id); setSelectedDay(null); }}>Delete</button>
                      </div>
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
                <div className="time-picker">
                  <select value={timeInputs.hour} onChange={(e) => setTimeInputs({...timeInputs, hour: e.target.value})}>
                    {Array.from({length: 12}, (_, i) => String(i + 1)).map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <span>:</span>
                  <select value={timeInputs.minute} onChange={(e) => setTimeInputs({...timeInputs, minute: e.target.value})}>
                    {['00', '15', '30', '45'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select value={timeInputs.period} onChange={(e) => setTimeInputs({...timeInputs, period: e.target.value})}>
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
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
          <h3>Upcoming Events</h3>
          {getUpcomingEvents().map(event => (
            <div key={event.id} className="event-card">
              <h3>{event.title}</h3>
              <p>📅 {formatDate(event.event_date)}</p>
              <p>⏰ {formatTime(event.event_time)}</p>
              <p>📍 {event.location}</p>
              <p>{event.notes}</p>
              {event.responsible_name ? (
                <div>
                  <p>✓ Claimed by {event.responsible_name}</p>
                  <button onClick={() => unclaimEvent(event.id)}>Unclaim</button>
                  <button className="delete-btn" onClick={() => deleteEvent(event.id)}>Delete Event</button>
                </div>
              ) : (
                <div>
                  <button onClick={() => claimEvent(event.id)}>Claim Responsibility</button>
                  <button className="delete-btn" onClick={() => deleteEvent(event.id)}>Delete Event</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Calendar;
