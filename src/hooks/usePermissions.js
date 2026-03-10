import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import useStore from '../store/useStore';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentCircle = useStore(state => state.currentCircle);
  const userRole = useStore(state => state.userRole);

  useEffect(() => {
    const loadPermissions = async () => {
      if (!currentCircle) {
        setLoading(false);
        return;
      }

      // Owner has all permissions
      if (userRole === 'owner') {
        setPermissions({
          can_view_calendar: true,
          can_view_messages: true,
          can_view_careplan: true,
          can_view_checklist: true,
          can_view_providers: true,
          can_view_members: true
        });
        setLoading(false);
        return;
      }

      try {
        const perms = await api.permissions.getMy(currentCircle.id);
        setPermissions(perms);
      } catch (error) {
        console.error('Failed to load permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, [currentCircle, userRole]);

  return { permissions, loading };
};
