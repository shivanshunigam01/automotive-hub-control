// Role-Based Access Control System

export type UserRole = 'master_admin' | 'admin' | 'sales_user';

export interface Permission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface ModulePermissions {
  dashboard: Permission;
  products: Permission;
  usedVehicles: Permission;
  leads: Permission;
  finance: Permission;
  cibil: Permission;
  analytics: Permission;
  banners: Permission;
  settings: Permission;
  dealers: Permission;
  users: Permission;
}

// Full permission
const FULL: Permission = { view: true, create: true, edit: true, delete: true };
// Read-only permission
const READ_ONLY: Permission = { view: true, create: false, edit: false, delete: false };
// No access
const NONE: Permission = { view: false, create: false, edit: false, delete: false };

export const ROLE_PERMISSIONS: Record<UserRole, ModulePermissions> = {
  master_admin: {
    dashboard: FULL,
    products: FULL,
    usedVehicles: FULL,
    leads: FULL,
    finance: FULL,
    cibil: FULL,
    analytics: FULL,
    banners: FULL,
    settings: FULL,
    dealers: FULL,
    users: FULL,
  },
  admin: {
    dashboard: FULL,
    products: FULL,
    usedVehicles: FULL,
    leads: FULL,
    finance: FULL,
    cibil: FULL,
    analytics: FULL,
    banners: FULL,
    settings: READ_ONLY,
    dealers: FULL,
    users: NONE,
  },
  sales_user: {
    dashboard: READ_ONLY,
    products: NONE,
    usedVehicles: NONE,
    leads: FULL,
    finance: FULL,
    cibil: NONE,
    analytics: READ_ONLY,
    banners: NONE,
    settings: NONE,
    dealers: READ_ONLY,
    users: NONE,
  },
};

export function hasPermission(
  role: UserRole,
  module: keyof ModulePermissions,
  action: keyof Permission
): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  const modulePermission = permissions[module];
  if (!modulePermission) return false;
  return modulePermission[action];
}

export function canViewModule(role: UserRole, module: keyof ModulePermissions): boolean {
  return hasPermission(role, module, 'view');
}

export function canEditModule(role: UserRole, module: keyof ModulePermissions): boolean {
  return hasPermission(role, module, 'edit');
}

export function canCreateInModule(role: UserRole, module: keyof ModulePermissions): boolean {
  return hasPermission(role, module, 'create');
}

export function canDeleteInModule(role: UserRole, module: keyof ModulePermissions): boolean {
  return hasPermission(role, module, 'delete');
}

export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'master_admin':
      return 'Master Admin';
    case 'admin':
      return 'Admin';
    case 'sales_user':
      return 'Sales User';
    default:
      return 'Unknown';
  }
}

// Menu items that each role can access
export interface MenuItem {
  path: string;
  module: keyof ModulePermissions;
}

export const MENU_MODULE_MAP: MenuItem[] = [
  { path: '/admin', module: 'dashboard' },
  { path: '/admin/products', module: 'products' },
  { path: '/admin/used-vehicles', module: 'usedVehicles' },
  { path: '/admin/leads', module: 'leads' },
  { path: '/admin/finance', module: 'finance' },
  { path: '/admin/cibil', module: 'cibil' },
  { path: '/admin/analytics', module: 'analytics' },
  { path: '/admin/dealers', module: 'dealers' },
  { path: '/admin/banners', module: 'banners' },
  { path: '/admin/settings', module: 'settings' },
  { path: '/admin/users', module: 'users' },
];

export function getAccessibleMenuItems(role: UserRole): string[] {
  return MENU_MODULE_MAP
    .filter((item) => canViewModule(role, item.module))
    .map((item) => item.path);
}
