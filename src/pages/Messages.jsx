import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import useStore from '../store/useStore';
import Nav from '../components/Nav';
import './Messages.css';

function Messages() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const currentCircle = useStore(state => state.currentCircle);

  useEffect(() => {
    if (currentCircle) loadMessages();
  }, [currentCircle]);

  const loadMessages = async () => {
    const data = await api.messages.getAll(currentCircle.id);
    setMessages(data);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    await api.messages.send(currentCircle.id, newMessage);
    setNewMessage('');
    loadMessages();
  };

  if (!currentCircle) return <div>Select a circle first</div>;

  return (
    <div className="messages">
      <Nav />
      <div className="content">
        <h2>Messages - {currentCircle.name}</h2>
        
        <div className="messages-list">
          {messages.map(msg => (
            <div key={msg.id} className="message">
              <strong>{msg.nickname}</strong>
              <p>{msg.message}</p>
              <small>{new Date(msg.created_at).toLocaleString()}</small>
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            required
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

export default Messages;
