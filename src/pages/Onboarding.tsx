import { Navigate } from 'react-router-dom';
import BusinessSetupDialog from '@/components/business/BusinessSetupDialog';
import { useBusiness } from '@/hooks/useBusiness';

const Onboarding = () => {
  const { business, loading } = useBusiness();

  if (!loading && business) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="px-4 pt-8 lg:pl-24 max-w-3xl mx-auto space-y-6 pb-24">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-display text-foreground">Welcome to ZEN POS</h1>
        <p className="text-sm text-muted-foreground">Pehle business setup karein, phir dashboard aur billing auto unlock ho jayega.</p>
      </div>
      <BusinessSetupDialog />
    </div>
  );
};

export default Onboarding;
