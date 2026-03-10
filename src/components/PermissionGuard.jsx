import { usePermissions } from '../hooks/usePermissions';
import Nav from './Nav';

function PermissionGuard({ permission, children }) {
  const { permissions, loading } = usePermissions();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!permissions?.[permission]) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <Nav />
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '100px 20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', color: '#333', marginBottom: '20px' }}>Access Denied</h2>
          <p style={{ fontSize: '18px', color: '#666' }}>You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return children;
}

export default PermissionGuard;
