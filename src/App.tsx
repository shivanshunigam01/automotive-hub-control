import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Admin Pages
import { AdminLayout } from "@/layouts/AdminLayout";
import { LoginPage } from "@/pages/admin/LoginPage";
import { DashboardPage } from "@/pages/admin/DashboardPage";
import { ProductsPage } from "@/pages/admin/ProductsPage";
import { ProductFormPage } from "@/pages/admin/ProductFormPage";
import { LeadsPage } from "@/pages/admin/LeadsPage";
import { UsedVehiclesPage } from "@/pages/admin/UsedVehiclesPage";
import { FinancePage } from "@/pages/admin/FinancePage";
import { CibilPage } from "@/pages/admin/CibilPage";
import { AnalyticsPage } from "@/pages/admin/AnalyticsPage";
import { BannersPage } from "@/pages/admin/BannersPage";
import { SettingsPage } from "@/pages/admin/SettingsPage";
import { DealersPage } from "@/pages/admin/DealersPage";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Redirect root to admin */}
            <Route path="/" element={<Navigate to="/admin" replace />} />
            
            {/* Admin Login */}
            <Route path="/admin/login" element={<LoginPage />} />
            
            {/* Admin Protected Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/new" element={<ProductFormPage />} />
              <Route path="products/:id" element={<ProductFormPage />} />
              <Route path="products/:id/edit" element={<ProductFormPage />} />
              <Route path="used-vehicles" element={<UsedVehiclesPage />} />
              <Route path="used-vehicles/new" element={<ProductFormPage />} />
              <Route path="used-vehicles/:id" element={<ProductFormPage />} />
              <Route path="used-vehicles/:id/edit" element={<ProductFormPage />} />
              <Route path="leads" element={<LeadsPage />} />
              <Route path="finance" element={<FinancePage />} />
              <Route path="cibil" element={<CibilPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="dealers" element={<DealersPage />} />
              <Route path="banners" element={<BannersPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
