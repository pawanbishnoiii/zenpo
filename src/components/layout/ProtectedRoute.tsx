import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useBusiness } from '@/hooks/useBusiness';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  requireBusiness?: boolean;
}

const ProtectedRoute = ({ children, adminOnly, requireBusiness }: ProtectedRouteProps) => {
  const { user, loading, isAdmin } = useAuth();
  const { business, loading: businessLoading } = useBusiness();

  // Always wait for auth to load
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  // Admin routes don't require business
  if (adminOnly) {
    if (!isAdmin) return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
  }

  // Business-required routes
  if (requireBusiness) {
    if (businessLoading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }
    if (!business) return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
