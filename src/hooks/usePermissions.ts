import { useAuth } from '@/contexts/AuthContext';
import {
  type UserRole,
  type ModulePermissions,
  hasPermission,
  canViewModule,
  canEditModule,
  canCreateInModule,
  canDeleteInModule,
  getAccessibleMenuItems,
} from '@/lib/rbac';

export function usePermissions() {
  const { user } = useAuth();
  const role = (user?.role as UserRole) || 'sales_user';

  return {
    role,
    hasPermission: (module: keyof ModulePermissions, action: 'view' | 'create' | 'edit' | 'delete') =>
      hasPermission(role, module, action),
    canView: (module: keyof ModulePermissions) => canViewModule(role, module),
    canEdit: (module: keyof ModulePermissions) => canEditModule(role, module),
    canCreate: (module: keyof ModulePermissions) => canCreateInModule(role, module),
    canDelete: (module: keyof ModulePermissions) => canDeleteInModule(role, module),
    accessiblePaths: getAccessibleMenuItems(role),
    isMasterAdmin: role === 'master_admin',
    isAdmin: role === 'admin' || role === 'master_admin',
    isSalesUser: role === 'sales_user',
  };
}
