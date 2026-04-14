import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="admin-shell min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 transition-all duration-300">
        <AdminTopbar />
        <main className="p-4 md:p-6 animate-fade-in">
          <div className="admin-panel min-h-[calc(100vh-7rem)] p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
