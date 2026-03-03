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

  if (loading || (requireBusiness && businessLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  if (requireBusiness && !business) return <Navigate to="/onboarding" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
