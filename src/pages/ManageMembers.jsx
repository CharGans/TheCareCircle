import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import useStore from '../store/useStore';
import Nav from '../components/Nav';
import PermissionGuard from '../components/PermissionGuard';
import './ManageMembers.css';

function ManageMembers() {
  const [members, setMembers] = useState([]);
  const [showInvite, setShowInvite] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const currentCircle = useStore(state => state.currentCircle);
  const userRole = useStore(state => state.userRole);

  useEffect(() => {
    if (currentCircle) loadMembers();
  }, [currentCircle]);

  const loadMembers = async () => {
    const data = await api.circles.getMembers(currentCircle.id);
    setMembers(data);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    await api.circles.addMember(currentCircle.id, { email, role });
    setEmail('');
    setRole('member');
    setShowInvite(false);
    loadMembers();
  };

  const updateRole = async (userId, newRole) => {
    await api.circles.updateMemberRole(currentCircle.id, userId, newRole);
    loadMembers();
  };

  const removeMember = async (userId) => {
    await api.circles.removeMember(currentCircle.id, userId);
    loadMembers();
  };

  const openPermissions = async (member) => {
    setSelectedMember(member);
    const perms = await api.permissions.get(currentCircle.id, member.id);
    setPermissions(perms);
    setShowPermissions(true);
  };

  const savePermissions = async () => {
    await api.permissions.update(currentCircle.id, selectedMember.id, permissions);
    setShowPermissions(false);
  };

  const togglePermission = (key) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!currentCircle) return <div>Select a circle first</div>;
  
  if (userRole !== 'owner') {
    return (
      <PermissionGuard permission="can_view_members">
      <div className="manage-members">
        <Nav />
        <div className="content">
          <h2>Access Denied</h2>
          <p>Only the owner can manage members.</p>
        </div>
      </div>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard permission="can_view_members">
    <div className="manage-members">
      <Nav />
      <div className="content">
        <h2>Manage Members - {currentCircle.name}</h2>
        <button onClick={() => setShowInvite(true)}>Invite Member</button>
        
        <div className="members-list">
          {members.map(member => (
            <div key={member.id} className="member-card">
              <h3>{member.nickname}</h3>
              <p>{member.email}</p>
              <select
                value={member.role}
                onChange={(e) => updateRole(member.id, e.target.value)}
                disabled={member.role === 'owner'}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                {member.role === 'owner' && <option value="owner">Owner</option>}
              </select>
              {member.role !== 'owner' && (
                <>
                  <button onClick={() => openPermissions(member)}>Permissions</button>
                  <button onClick={() => removeMember(member.id)}>Remove</button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {showInvite && (
        <div className="modal" onClick={() => setShowInvite(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Invite Member</h3>
            <form onSubmit={handleInvite}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <button type="submit">Invite</button>
              <button type="button" onClick={() => setShowInvite(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {showPermissions && selectedMember && (
        <div className="modal" onClick={() => setShowPermissions(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Permissions for {selectedMember.nickname}</h3>
            <div className="permissions-list">
              <label>
                <input
                  type="checkbox"
                  checked={permissions.can_view_calendar ?? true}
                  onChange={() => togglePermission('can_view_calendar')}
                />
                Calendar
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={permissions.can_view_messages ?? true}
                  onChange={() => togglePermission('can_view_messages')}
                />
                Messages
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={permissions.can_view_careplan ?? true}
                  onChange={() => togglePermission('can_view_careplan')}
                />
                Care Plan
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={permissions.can_view_checklist ?? true}
                  onChange={() => togglePermission('can_view_checklist')}
                />
                Checklist
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={permissions.can_view_providers ?? true}
                  onChange={() => togglePermission('can_view_providers')}
                />
                Providers
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={permissions.can_view_members ?? true}
                  onChange={() => togglePermission('can_view_members')}
                />
                Members List
              </label>
            </div>
            <button onClick={savePermissions}>Save</button>
            <button onClick={() => setShowPermissions(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
    </PermissionGuard>
  );
}

export default ManageMembers;
