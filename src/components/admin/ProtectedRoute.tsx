import { Navigate, useLocation } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import type { ModulePermissions } from '@/lib/rbac';

interface ProtectedRouteProps {
  children: React.ReactNode;
  module: keyof ModulePermissions;
  action?: 'view' | 'create' | 'edit' | 'delete';
}

export function ProtectedRoute({ children, module, action = 'view' }: ProtectedRouteProps) {
  const { hasPermission } = usePermissions();
  const location = useLocation();

  if (!hasPermission(module, action)) {
    // Redirect to dashboard if user doesn't have permission
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
