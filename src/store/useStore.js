import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      currentCircle: null,
      userRole: null,
      
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setCurrentCircle: (circle) => set({ currentCircle: circle }),
      setUserRole: (role) => set({ userRole: role }),
      logout: () => set({ user: null, token: null, currentCircle: null, userRole: null })
    }),
    {
      name: 'care-circle-storage'
    }
  )
);

export default useStore;
