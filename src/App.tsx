import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Billing from "@/pages/Billing";
import Reports from "@/pages/Reports";
import SettingsPage from "@/pages/SettingsPage";
import AdminDashboard from "@/pages/AdminDashboard";
import HomeRouter from "@/pages/HomeRouter";
import Onboarding from "@/pages/Onboarding";
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
            <Route path="/" element={<HomeRouter />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<ProtectedRoute><AppLayout><Onboarding /></AppLayout></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute requireBusiness><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute requireBusiness><AppLayout><Products /></AppLayout></ProtectedRoute>} />
            <Route path="/billing" element={<ProtectedRoute requireBusiness><Billing /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute requireBusiness><AppLayout><Reports /></AppLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute requireBusiness><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
