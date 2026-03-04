import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBusiness } from '@/hooks/useBusiness';

const HomeRouter = () => {
  const { user, loading: authLoading } = useAuth();
  const { business, loading: businessLoading } = useBusiness();

  if (authLoading || (user && businessLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/landing" replace />;
  if (!business) return <Navigate to="/onboarding" replace />;
  return <Navigate to="/dashboard" replace />;
};

export default HomeRouter;
