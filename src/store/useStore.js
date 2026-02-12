import { create } from 'zustand';

const useStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  currentCircle: null,
  
  setUser: (user) => set({ user }),
  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },
  setCurrentCircle: (circle) => set({ currentCircle: circle }),
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, currentCircle: null });
  }
}));

export default useStore;
