import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import useStore from '../store/useStore';
import Nav from '../components/Nav';

function ManageMembers() {
  const [members, setMembers] = useState([]);
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const currentCircle = useStore(state => state.currentCircle);

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

  if (!currentCircle) return <div>Select a circle first</div>;

  return (
    <div className="manage-members">
      <Nav />
      <div className="content">
        <h2>Manage Members - {currentCircle.name}</h2>
        <button onClick={() => setShowInvite(true)}>Invite Member</button>
        
        {showInvite && (
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
              <option value="co-owner">Co-Owner</option>
            </select>
            <button type="submit">Invite</button>
            <button type="button" onClick={() => setShowInvite(false)}>Cancel</button>
          </form>
        )}
        
        <div className="members-list">
          {members.map(member => (
            <div key={member.id} className="member-card">
              <h3>{member.nickname}</h3>
              <p>{member.email}</p>
              <select
                value={member.role}
                onChange={(e) => updateRole(member.id, e.target.value)}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="co-owner">Co-Owner</option>
                <option value="owner">Owner</option>
              </select>
              {member.role !== 'owner' && (
                <button onClick={() => removeMember(member.id)}>Remove</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ManageMembers;
