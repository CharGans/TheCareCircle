import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import useStore from '../store/useStore';
import Nav from '../components/Nav';
import PermissionGuard from '../components/PermissionGuard';
import './Links.css';

function Links() {
  const [links, setLinks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', url: '', description: '' });
  const currentCircle = useStore(state => state.currentCircle);

  useEffect(() => {
    if (currentCircle) loadLinks();
  }, [currentCircle]);

  const loadLinks = async () => {
    try {
      const data = await api.links.getAll(currentCircle.id);
      setLinks(data);
    } catch (error) {
      console.error('Error loading links:', error);
      setLinks([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.links.create(currentCircle.id, formData);
    setFormData({ title: '', url: '', description: '' });
    setShowForm(false);
    loadLinks();
  };

  const handleDelete = async (linkId) => {
    if (confirm('Delete this link?')) {
      await api.links.delete(currentCircle.id, linkId);
      loadLinks();
    }
  };

  if (!currentCircle) return <div>Select a circle first</div>;

  return (
    <PermissionGuard permission="can_view_links">
    <div className="links-page">
      <Nav />
      <div className="content">
        <h2>Important Links - {currentCircle.name}</h2>
        
        <button onClick={() => setShowForm(true)}>Add Link</button>
        
        <div className="links-list">
          {links.map(link => (
            <div key={link.id} className="link-card">
              <button className="delete-link-btn" onClick={() => handleDelete(link.id)}>×</button>
              <h3>{link.title}</h3>
              {link.description && <p className="link-description">{link.description}</p>}
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="link-url">
                {link.url}
              </a>
              <small>Added by {link.nickname} on {new Date(link.created_at).toLocaleDateString()}</small>
            </div>
          ))}
        </div>
        
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Add Important Link</h3>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Link Title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
                <input
                  type="url"
                  placeholder="URL (https://...)"
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  required
                />
                <textarea
                  placeholder="Description (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
                <div className="modal-buttons">
                  <button type="submit">Add Link</button>
                  <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
    </PermissionGuard>
  );
}

export default Links;
