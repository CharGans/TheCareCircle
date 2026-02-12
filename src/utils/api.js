import axios from 'axios';

const client = axios.create({
  baseURL: '/api'
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const api = {
  auth: {
    register: (data) => client.post('/auth/register', data).then(r => r.data),
    login: (data) => client.post('/auth/login', data).then(r => r.data)
  },
  
  circles: {
    create: (data) => client.post('/circles', data).then(r => r.data),
    getAll: () => client.get('/circles').then(r => r.data),
    getMembers: (id) => client.get(`/circles/${id}/members`).then(r => r.data),
    addMember: (id, data) => client.post(`/circles/${id}/members`, data).then(r => r.data),
    updateMemberRole: (id, userId, role) => client.put(`/circles/${id}/members/${userId}`, { role }).then(r => r.data),
    removeMember: (id, userId) => client.delete(`/circles/${id}/members/${userId}`).then(r => r.data)
  },
  
  events: {
    getAll: (circleId) => client.get(`/events/${circleId}`).then(r => r.data),
    create: (circleId, data) => client.post(`/events/${circleId}`, data).then(r => r.data),
    claim: (circleId, eventId) => client.put(`/events/${circleId}/${eventId}/claim`).then(r => r.data)
  },
  
  messages: {
    getAll: (circleId) => client.get(`/messages/${circleId}`).then(r => r.data),
    send: (circleId, message) => client.post(`/messages/${circleId}`, { message }).then(r => r.data)
  },
  
  careplan: {
    getMedications: (circleId) => client.get(`/careplan/${circleId}/medications`).then(r => r.data),
    addMedication: (circleId, data) => client.post(`/careplan/${circleId}/medications`, data).then(r => r.data),
    getNotes: (circleId) => client.get(`/careplan/${circleId}/notes`).then(r => r.data),
    addNote: (circleId, note) => client.post(`/careplan/${circleId}/notes`, { note }).then(r => r.data)
  },
  
  tasks: {
    getAll: (circleId) => client.get(`/tasks/${circleId}`).then(r => r.data),
    create: (circleId, title) => client.post(`/tasks/${circleId}`, { title }).then(r => r.data),
    update: (circleId, taskId, completed) => client.put(`/tasks/${circleId}/${taskId}`, { completed }).then(r => r.data)
  },
  
  providers: {
    getAll: (circleId) => client.get(`/providers/${circleId}`).then(r => r.data),
    create: (circleId, data) => client.post(`/providers/${circleId}`, data).then(r => r.data)
  }
};
