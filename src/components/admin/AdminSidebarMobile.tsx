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
  UserCog,
  FolderOpen,
  Tag,
  FileText,
  Briefcase,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import punyaLogo from '@/assets/punya-logo.jpeg';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin', module: 'dashboard' as const },
  { icon: Package, label: 'Products', path: '/admin/products', module: 'products' as const },
  { icon: Car, label: 'Certified Refurbished', path: '/admin/certified-refurbished', module: 'certifiedRefurbished' as const },
  { icon: Users, label: 'Leads', path: '/admin/leads', module: 'leads' as const },
  { icon: CreditCard, label: 'Finance', path: '/admin/finance', module: 'finance' as const },
  { icon: FileCheck, label: 'CIBIL Checks', path: '/admin/cibil', module: 'cibil' as const },
  { icon: MapPin, label: 'Dealers', path: '/admin/dealers', module: 'dealers' as const },
  { icon: FolderOpen, label: 'Media Library', path: '/admin/media-library', module: 'mediaLibrary' as const },
  { icon: Tag, label: 'Offers & Schemes', path: '/admin/offers-schemes', module: 'offersSchemes' as const },
  { icon: FileText, label: 'Content Pages', path: '/admin/content-pages', module: 'contentPages' as const },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics', module: 'analytics' as const },
  { icon: Image, label: 'Banners', path: '/admin/banners', module: 'banners' as const },
  { icon: Settings, label: 'Settings', path: '/admin/settings', module: 'settings' as const },
  { icon: UserCog, label: 'Users', path: '/admin/users', module: 'users' as const },
  { icon: Briefcase, label: 'Careers', path: '/admin/careers', module: 'careers' as const },
  { icon: Calendar, label: 'Timeline', path: '/admin/timeline', module: 'timeline' as const },
];

export function AdminSidebarMobile() {
  const { logout, user } = useAuth();
  const { canView } = usePermissions();
  const location = useLocation();

  const filteredMenuItems = menuItems.filter((item) => canView(item.module));

  return (
    <div className="admin-sidebar-surface flex h-full flex-col">
      {/* Logo Section */}
      <div className="flex h-20 items-center border-b border-sidebar-border/80 px-4">
        <div className="flex items-center gap-3">
          <div className="admin-brand-tile">
            <img
              src={punyaLogo}
              alt="Punya Autowheels"
              className="h-10 rounded-lg"
            />
          </div>
          <div>
            <p className="text-base font-bold tracking-[-0.02em] text-sidebar-foreground">
              Punya Autowheels
            </p>
            <p className="text-[11px] uppercase tracking-[0.22em] text-sidebar-muted">
              Admin Hub
            </p>
          </div>
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
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_12px_30px_-18px_rgba(14,165,233,0.85)]'
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
      <div className="border-t border-sidebar-border/80 p-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
          <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full border border-white/10 bg-sidebar-accent flex items-center justify-center">
            <span className="text-sm font-medium text-sidebar-foreground">
              {user?.name?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.name || 'Admin'}
            </p>
            <Badge variant="outline" className="h-4 border-white/15 bg-white/5 px-1.5 py-0 text-[10px] capitalize text-sidebar-foreground">
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
    </div>
  );
}
