import { useState } from 'react';
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
  ChevronLeft,
  ChevronRight,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { getRoleDisplayName } from '@/lib/rbac';
import punyaLogo from '@/assets/punya-logo.jpeg';

interface MenuItem {
  icon: typeof LayoutDashboard;
  label: string;
  path: string;
  module: 'dashboard' | 'products' | 'certifiedRefurbished' | 'leads' | 'finance' | 'cibil' | 'analytics' | 'banners' | 'settings' | 'dealers' | 'users' | 'mediaLibrary' | 'offersSchemes' | 'contentPages' | 'careers' | 'timeline';
}

const allMenuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin', module: 'dashboard' },
  { icon: Package, label: 'Products', path: '/admin/products', module: 'products' },
  { icon: Car, label: 'Certified Refurbished', path: '/admin/certified-refurbished', module: 'certifiedRefurbished' },
  { icon: Users, label: 'Leads', path: '/admin/leads', module: 'leads' },
  { icon: CreditCard, label: 'Finance', path: '/admin/finance', module: 'finance' },
  { icon: FileCheck, label: 'CIBIL Checks', path: '/admin/cibil', module: 'cibil' },
  { icon: MapPin, label: 'Dealers', path: '/admin/dealers', module: 'dealers' },
  { icon: FolderOpen, label: 'Media Library', path: '/admin/media-library', module: 'mediaLibrary' },
  { icon: Tag, label: 'Offers & Schemes', path: '/admin/offers-schemes', module: 'offersSchemes' },
  { icon: FileText, label: 'Content Pages', path: '/admin/content-pages', module: 'contentPages' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics', module: 'analytics' },
  { icon: Image, label: 'Banners', path: '/admin/banners', module: 'banners' },
  { icon: Settings, label: 'Settings', path: '/admin/settings', module: 'settings' },
  { icon: UserCog, label: 'Users', path: '/admin/users', module: 'users' },
  { icon: Briefcase, label: 'Careers', path: '/admin/careers', module: 'careers' },
  { icon: Calendar, label: 'Timeline', path: '/admin/timeline', module: 'timeline' },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { logout, user } = useAuth();
  const { canView, role } = usePermissions();
  const location = useLocation();

  // Filter menu items based on role permissions
  const menuItems = allMenuItems.filter((item) => canView(item.module));

  return (
    <aside
      className={cn(
        'admin-sidebar-surface fixed left-0 top-0 z-40 h-screen transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo Section */}
      <div className="flex h-20 items-center justify-between border-b border-sidebar-border/80 px-4">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="admin-brand-tile">
              <img
                src={punyaLogo}
                alt="Punya Autowheels"
                className="h-10 rounded-lg"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-bold tracking-[-0.02em] text-sidebar-foreground">
                Punya Autowheels
              </p>
              <p className="text-[11px] uppercase tracking-[0.22em] text-sidebar-muted">
                Admin Hub
              </p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/admin' && location.pathname.startsWith(item.path));
          
          const linkContent = (
            <NavLink
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_12px_30px_-18px_rgba(14,165,233,0.85)]'
                  : 'text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return <div key={item.path}>{linkContent}</div>;
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-sidebar-border/80 p-4">
        {!collapsed ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
            <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-sidebar-accent flex items-center justify-center border border-white/10">
              <span className="text-sm font-medium text-sidebar-foreground">
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.name || 'Admin'}
              </p>
              <Badge variant="outline" className="mt-1 border-white/15 bg-white/5 px-1.5 py-0 text-[10px] text-sidebar-foreground">
                {getRoleDisplayName(role)}
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
        ) : (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="w-full text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Logout</TooltipContent>
          </Tooltip>
        )}
      </div>
    </aside>
  );
}
