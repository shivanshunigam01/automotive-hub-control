// Role-Based Access Control System

export type UserRole = 'master_admin' | 'admin' | 'sales_user';

export interface Permission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export?: boolean;
}

export interface ModulePermissions {
  dashboard: Permission;
  products: Permission;
  certifiedRefurbished: Permission;
  leads: Permission;
  finance: Permission;
  cibil: Permission;
  analytics: Permission;
  banners: Permission;
  settings: Permission;
  dealers: Permission;
  users: Permission;
  mediaLibrary: Permission;
  offersSchemes: Permission;
  contentPages: Permission;
}

// Full permission
const FULL: Permission = { view: true, create: true, edit: true, delete: true, export: true };
// Read-only permission
const READ_ONLY: Permission = { view: true, create: false, edit: false, delete: false, export: false };
// No access
const NONE: Permission = { view: false, create: false, edit: false, delete: false, export: false };
// Sales lead permissions
const SALES_LEAD: Permission = { view: true, create: true, edit: true, delete: false, export: true };

export const ROLE_PERMISSIONS: Record<UserRole, ModulePermissions> = {
  master_admin: {
    dashboard: FULL,
    products: FULL,
    certifiedRefurbished: FULL,
    leads: FULL,
    finance: FULL,
    cibil: FULL,
    analytics: FULL,
    banners: FULL,
    settings: FULL,
    dealers: FULL,
    users: FULL,
    mediaLibrary: FULL,
    offersSchemes: FULL,
    contentPages: FULL,
  },
  admin: {
    dashboard: FULL,
    products: FULL,
    certifiedRefurbished: FULL,
    leads: FULL,
    finance: FULL,
    cibil: FULL,
    analytics: FULL,
    banners: FULL,
    settings: READ_ONLY,
    dealers: FULL,
    users: NONE,
    mediaLibrary: FULL,
    offersSchemes: FULL,
    contentPages: FULL,
  },
  sales_user: {
    dashboard: READ_ONLY,
    products: NONE,
    certifiedRefurbished: NONE,
    leads: SALES_LEAD,
    finance: SALES_LEAD,
    cibil: NONE,
    analytics: READ_ONLY,
    banners: NONE,
    settings: NONE,
    dealers: READ_ONLY,
    users: NONE,
    mediaLibrary: NONE,
    offersSchemes: NONE,
    contentPages: NONE,
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
  return !!modulePermission[action];
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

export function canExportInModule(role: UserRole, module: keyof ModulePermissions): boolean {
  return hasPermission(role, module, 'export');
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
  { path: '/admin/certified-refurbished', module: 'certifiedRefurbished' },
  { path: '/admin/leads', module: 'leads' },
  { path: '/admin/finance', module: 'finance' },
  { path: '/admin/cibil', module: 'cibil' },
  { path: '/admin/analytics', module: 'analytics' },
  { path: '/admin/dealers', module: 'dealers' },
  { path: '/admin/media-library', module: 'mediaLibrary' },
  { path: '/admin/offers-schemes', module: 'offersSchemes' },
  { path: '/admin/content-pages', module: 'contentPages' },
  { path: '/admin/banners', module: 'banners' },
  { path: '/admin/settings', module: 'settings' },
  { path: '/admin/users', module: 'users' },
];

export function getAccessibleMenuItems(role: UserRole): string[] {
  return MENU_MODULE_MAP
    .filter((item) => canViewModule(role, item.module))
    .map((item) => item.path);
}

// All available modules for permission management
export const ALL_MODULES: Array<{ key: keyof ModulePermissions; label: string }> = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'products', label: 'Products' },
  { key: 'certifiedRefurbished', label: 'Certified Refurbished' },
  { key: 'leads', label: 'Leads' },
  { key: 'finance', label: 'Finance Applications' },
  { key: 'cibil', label: 'CIBIL' },
  { key: 'analytics', label: 'Reports / Analytics' },
  { key: 'dealers', label: 'Dealer Locator' },
  { key: 'mediaLibrary', label: 'Media Library' },
  { key: 'offersSchemes', label: 'Offers & Schemes' },
  { key: 'contentPages', label: 'Content Pages' },
  { key: 'banners', label: 'Banners' },
  { key: 'settings', label: 'Settings' },
  { key: 'users', label: 'User Management' },
];
