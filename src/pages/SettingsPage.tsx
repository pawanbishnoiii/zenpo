import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Store,
  Printer,
  Palette,
  User,
  ChevronRight,
  Bell,
  Shield,
  Globe,
  LogOut,
  Tag,
  Users,
  Loader2,
  Link2,
} from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { useAuth } from '@/hooks/useAuth';
import { useBusiness } from '@/hooks/useBusiness';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { connectPrinter } from '@/lib/ezoPrinter';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type SettingsPanel =
  | 'business'
  | 'printer'
  | 'theme'
  | 'profile'
  | 'notifications'
  | 'security'
  | 'language'
  | 'offers'
  | 'customers'
  | null;

const SettingsPage = () => {
  const { signOut, user } = useAuth();
  const { business } = useBusiness();
  const { toast } = useToast();
  const [activePanel, setActivePanel] = useState<SettingsPanel>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [connecting, setConnecting] = useState(false);

  const settingsGroups = useMemo(
    () => [
      {
        title: 'Business',
        items: [
          { key: 'business' as SettingsPanel, icon: Store, label: 'Business Profile', desc: 'Name, logo, GST' },
          { key: 'printer' as SettingsPanel, icon: Printer, label: 'Printer Settings', desc: 'Ezo connection, paper size' },
          { key: 'theme' as SettingsPanel, icon: Palette, label: 'Theme', desc: 'Colors and style' },
          { key: 'offers' as SettingsPanel, icon: Tag, label: 'Offers', desc: 'Discount campaigns' },
        ],
      },
      {
        title: 'Account',
        items: [
          { key: 'profile' as SettingsPanel, icon: User, label: 'Profile', desc: user?.email || 'Name, email, password' },
          { key: 'customers' as SettingsPanel, icon: Users, label: 'Customer Manager', desc: 'Saved billing customers' },
          { key: 'notifications' as SettingsPanel, icon: Bell, label: 'Notifications', desc: 'Alerts and updates' },
          { key: 'security' as SettingsPanel, icon: Shield, label: 'Security', desc: 'Sessions and login safety' },
          { key: 'language' as SettingsPanel, icon: Globe, label: 'Language', desc: 'App language' },
        ],
      },
    ],
    [user?.email]
  );

  useEffect(() => {
    const loadCustomers = async () => {
      if (!business?.id) return;
      const { data } = await supabase
        .from('customers')
        .select('id, full_name, phone, email, visit_count, total_spent, last_visit_at')
        .eq('business_id', business.id)
        .order('updated_at', { ascending: false })
        .limit(15);

      setCustomers(data ?? []);
    };

    if (activePanel === 'customers') {
      void loadCustomers();
    }
  }, [activePanel, business?.id]);

  const handleConnectPrinter = async () => {
    setConnecting(true);
    const connection = await connectPrinter();
    setConnecting(false);

    if (connection.connected) {
      toast({ title: 'Printer connected', description: connection.device?.name || 'Ezo machine ready' });
    } else {
      toast({
        title: 'Connection failed',
        description: 'Bluetooth on karein, printer pairing mode me rakhein, phir retry karein.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="px-4 pt-4 lg:pl-24 max-w-2xl mx-auto space-y-6 pb-8">
      <PageHeader title="Settings" backTo="/dashboard" />

      {settingsGroups.map((group, gi) => (
        <motion.div
          key={group.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: gi * 0.1 }}
          className="space-y-2"
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">{group.title}</p>
          <div className="rounded-2xl glass-card shadow-soft overflow-hidden divide-y divide-border">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => setActivePanel(item.key)}
                  className="flex items-center gap-3 p-4 w-full text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </motion.div>
      ))}

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={signOut}
        className="w-full py-3 rounded-xl bg-destructive/10 text-destructive font-semibold text-sm flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </motion.button>

      <Dialog open={!!activePanel} onOpenChange={(open) => !open && setActivePanel(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">Settings Detail</DialogTitle>
            <DialogDescription>Owner management controls</DialogDescription>
          </DialogHeader>

          {activePanel === 'business' && (
            <div className="space-y-2 text-sm">
              <p className="text-foreground font-semibold">{business?.business_name || 'No business found'}</p>
              <p className="text-muted-foreground">Category: {business?.category || 'N/A'}</p>
              <p className="text-muted-foreground">GST: {business?.gst_number || 'Not set'}</p>
            </div>
          )}

          {activePanel === 'printer' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Ezo thermal machine connect karne ke liye Bluetooth printer pairing mode me rakhein.</p>
              <button
                onClick={() => void handleConnectPrinter()}
                disabled={connecting}
                className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                Connect Ezo Printer
              </button>
            </div>
          )}

          {activePanel === 'customers' && (
            <div className="max-h-80 overflow-y-auto space-y-2">
              {customers.length === 0 ? (
                <p className="text-sm text-muted-foreground">Abhi tak customer records nahi mile. Billing ke baad auto-save hoga.</p>
              ) : (
                customers.map((customer) => (
                  <div key={customer.id} className="rounded-xl border border-border p-3">
                    <p className="text-sm font-semibold text-foreground">{customer.full_name || 'Walk-in Customer'}</p>
                    <p className="text-xs text-muted-foreground">{customer.phone || customer.email || 'No contact'}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Visits: {customer.visit_count || 0} • Spend: ₹{Number(customer.total_spent || 0).toFixed(0)}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {activePanel === 'offers' && <p className="text-sm text-muted-foreground">Offers table ready hai; next step me create/edit UI add kar sakte hain.</p>}
          {activePanel === 'theme' && <p className="text-sm text-muted-foreground">Fire theme active hai, category-based theme extensions next module me add honge.</p>}
          {activePanel === 'profile' && <p className="text-sm text-muted-foreground">Profile data authentication ke saath synced hai.</p>}
          {activePanel === 'notifications' && <p className="text-sm text-muted-foreground">Notification preferences panel next patch me expand karenge.</p>}
          {activePanel === 'security' && <p className="text-sm text-muted-foreground">Session security active hai. Password reset flow bhi add kiya ja sakta hai.</p>}
          {activePanel === 'language' && <p className="text-sm text-muted-foreground">Language options ke liye i18n module next phase me add karenge.</p>}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
