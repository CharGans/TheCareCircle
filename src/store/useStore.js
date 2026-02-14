import { create } from 'zustand';

const useStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  currentCircle: null,
  userRole: null,
  
  setUser: (user) => set({ user }),
  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },
  setCurrentCircle: (circle) => set({ currentCircle: circle }),
  setUserRole: (role) => set({ userRole: role }),
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, currentCircle: null, userRole: null });
  }
}));

export default useStore;
