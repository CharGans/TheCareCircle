import { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import useStore from '../store/useStore';
import Nav from '../components/Nav';
import './Messages.css';

function Messages() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [members, setMembers] = useState([]);
  const currentCircle = useStore(state => state.currentCircle);
  const user = useStore(state => state.user);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (currentCircle) {
      loadMessages();
      loadMembers();
    }
  }, [currentCircle]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    const data = await api.messages.getAll(currentCircle.id);
    setMessages(data);
  };

  const loadMembers = async () => {
    const data = await api.circles.getMembers(currentCircle.id);
    setMembers(data);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await api.messages.send(currentCircle.id, newMessage);
    setNewMessage('');
    loadMessages();
  };

  const handleDelete = async (messageId) => {
    if (window.confirm('Delete this message?')) {
      await api.messages.delete(currentCircle.id, messageId);
      loadMessages();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  if (!currentCircle) return <div>Select a circle first</div>;

  return (
    <div className="messages">
      <Nav />
      <div className="messages-wrapper">
        <div className="messages-container">
          <div className="messages-header">
            <h2>{currentCircle.name}</h2>
            <p>{messages.length} messages</p>
          </div>
          
          <div className="messages-list">
            {messages.map(msg => (
              <div key={msg.id} className={`message-bubble ${msg.user_id === user?.id ? 'own-message' : ''}`}>
                <div className="message-content">
                  <div className="message-sender">{msg.nickname}</div>
                  <div className="message-text">{msg.message}</div>
                  <div className="message-time">{formatTime(msg.created_at)}</div>
                  {msg.user_id === user?.id && (
                    <button className="delete-message-btn" onClick={() => handleDelete(msg.id)}>×</button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <form className="message-input-form" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              required
            />
            <button type="submit">➤</button>
          </form>
        </div>

        <div className="members-sidebar">
          <div className="members-header">
            <h3>Members ({members.length})</h3>
          </div>
          <div className="members-list">
            {members.map(member => (
              <div key={member.user_id} className="member-item">
                <div className="member-avatar">{member.nickname.charAt(0).toUpperCase()}</div>
                <div className="member-info">
                  <div className="member-name">{member.nickname}</div>
                  <div className="member-role">{member.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Messages;
