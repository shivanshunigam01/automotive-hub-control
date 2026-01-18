import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Car,
  Users,
  CreditCard,
  FileCheck,
  BarChart3,
  Image,
  Settings,
  LogOut,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin', module: 'dashboard' as const },
  { icon: Package, label: 'Products', path: '/admin/products', module: 'products' as const },
  { icon: Car, label: 'Certified Refurbished', path: '/admin/certified-refurbished', module: 'certifiedRefurbished' as const },
  { icon: Users, label: 'Leads', path: '/admin/leads', module: 'leads' as const },
  { icon: CreditCard, label: 'Finance', path: '/admin/finance', module: 'finance' as const },
  { icon: FileCheck, label: 'CIBIL Checks', path: '/admin/cibil', module: 'cibil' as const },
  { icon: MapPin, label: 'Dealers', path: '/admin/dealers', module: 'dealers' as const },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics', module: 'analytics' as const },
  { icon: Image, label: 'Banners', path: '/admin/banners', module: 'banners' as const },
  { icon: Settings, label: 'Settings', path: '/admin/settings', module: 'settings' as const },
];

export function AdminSidebarMobile() {
  const { logout, user } = useAuth();
  const { canView } = usePermissions();
  const location = useLocation();

  const filteredMenuItems = menuItems.filter((item) => canView(item.module));

  return (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Logo Section */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg gradient-accent flex items-center justify-center">
            <span className="text-sm font-bold text-accent-foreground">PM</span>
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">Patliputra</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/admin' && location.pathname.startsWith(item.path));
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-sm font-medium text-sidebar-foreground">
              {user?.name?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.name || 'Admin'}
            </p>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 capitalize">
              {user?.role || 'admin'}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
