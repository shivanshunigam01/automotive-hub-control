import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AdminSidebarMobile } from './AdminSidebarMobile';

const breadcrumbMap: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/products': 'Products',
  '/admin/products/new': 'New Product',
  '/admin/used-vehicles': 'Used Vehicles',
  '/admin/leads': 'Leads',
  '/admin/finance': 'Finance Applications',
  '/admin/cibil': 'CIBIL Checks',
  '/admin/analytics': 'Analytics',
  '/admin/banners': 'Banners',
  '/admin/settings': 'Settings',
};

export function AdminTopbar() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const getBreadcrumbs = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: Array<{ label: string; path: string }> = [];
    let currentPath = '';

    parts.forEach((part) => {
      currentPath += `/${part}`;
      const label = breadcrumbMap[currentPath] || part.charAt(0).toUpperCase() + part.slice(1);
      breadcrumbs.push({ label, path: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-6">
      {/* Mobile Menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <AdminSidebarMobile />
        </SheetContent>
      </Sheet>

      {/* Breadcrumbs */}
      <nav className="hidden md:flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.path} className="flex items-center gap-2">
            {index > 0 && <span className="text-muted-foreground">/</span>}
            <span
              className={
                index === breadcrumbs.length - 1
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground'
              }
            >
              {crumb.label}
            </span>
          </div>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="relative w-64 hidden md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-muted/50 border-0 focus-visible:ring-1"
        />
      </div>

      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-accent">
              3
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
            <span className="font-medium">New Lead Received</span>
            <span className="text-xs text-muted-foreground">
              Rajesh Kumar interested in JCB 3DX
            </span>
            <span className="text-xs text-muted-foreground">5 minutes ago</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
            <span className="font-medium">Finance Application Approved</span>
            <span className="text-xs text-muted-foreground">
              Application #FIN-1234 has been approved
            </span>
            <span className="text-xs text-muted-foreground">1 hour ago</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
            <span className="font-medium">CIBIL Check Completed</span>
            <span className="text-xs text-muted-foreground">
              Score: 756 (Good) for Suresh Patel
            </span>
            <span className="text-xs text-muted-foreground">2 hours ago</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
