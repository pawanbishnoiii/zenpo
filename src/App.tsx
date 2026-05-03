import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AppLayout from "@/components/layout/AppLayout";
import AdminLayout from "@/components/admin/AdminLayout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import ErrorBoundary from "@/components/layout/ErrorBoundary";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Workspace from "@/pages/Workspace";
import Billing from "@/pages/Billing";
import Reports from "@/pages/Reports";
import SettingsPage from "@/pages/SettingsPage";
import AdminDashboard from "@/pages/AdminDashboard";
import HomeRouter from "@/pages/HomeRouter";
import Onboarding from "@/pages/Onboarding";
import BillHistory from "@/pages/BillHistory";
import CustomerManagement from "@/pages/CustomerManagement";
import OffersPage from "@/pages/OffersPage";
import StorePage from "@/pages/StorePage";
import StoreManager from "@/pages/StoreManager";
import AppDownloads from "@/pages/AppDownloads";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <ErrorBoundary>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomeRouter />} />
              <Route path="/landing" element={<Index />} />
              <Route path="/app" element={<AppDownloads />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/store/:slug" element={<StorePage />} />
              <Route path="/onboarding" element={<ProtectedRoute><AppLayout><Onboarding /></AppLayout></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute requireBusiness><ErrorBoundary fallbackTitle="Dashboard error"><AppLayout><Dashboard /></AppLayout></ErrorBoundary></ProtectedRoute>} />
              <Route path="/workspace" element={<ProtectedRoute requireBusiness><AppLayout><Workspace /></AppLayout></ProtectedRoute>} />
              <Route path="/billing" element={<ProtectedRoute requireBusiness><ErrorBoundary fallbackTitle="Billing error"><Billing /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute requireBusiness><AppLayout><Reports /></AppLayout></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute requireBusiness><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute requireBusiness><AppLayout><BillHistory /></AppLayout></ProtectedRoute>} />
              <Route path="/customers" element={<ProtectedRoute requireBusiness><AppLayout><CustomerManagement /></AppLayout></ProtectedRoute>} />
              <Route path="/offers" element={<ProtectedRoute requireBusiness><AppLayout><OffersPage /></AppLayout></ProtectedRoute>} />
              <Route path="/store-manager" element={<ProtectedRoute requireBusiness><AppLayout><StoreManager /></AppLayout></ProtectedRoute>} />
              {/* Admin routes with separate layout */}
              <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/*" element={<ProtectedRoute adminOnly><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
