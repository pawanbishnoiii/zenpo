import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, CreditCard, Receipt, Printer, Bell, Palette, Users, Database, Crown, ExternalLink, Copy, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '@/hooks/useBusiness';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import RazorpayPanel from './RazorpayPanel';
import GstInvoicePanel from './GstInvoicePanel';
import PrintSettingsPanel from './PrintSettingsPanel';
import NotificationsPanel from './NotificationsPanel';
import StaffPanel from './StaffPanel';
import DataBackupPanel from './DataBackupPanel';

const SECTIONS = [
  { group: 'Setup', items: [
    { id: 'business', icon: Building2, label: 'Business Profile' },
    { id: 'razorpay', icon: CreditCard, label: 'Payment Gateway' },
    { id: 'gst', icon: Receipt, label: 'Invoice & GST' },
    { id: 'printer', icon: Printer, label: 'Print Settings' },
  ]},
  { group: 'Preferences', items: [
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'appearance', icon: Palette, label: 'Appearance' },
  ]},
  { group: 'Workspace', items: [
    { id: 'staff', icon: Users, label: 'Staff & Access' },
    { id: 'data', icon: Database, label: 'Data & Backup' },
    { id: 'subscription', icon: Crown, label: 'Subscription' },
  ]},
];

interface Props {
  fallbackContent: (sectionId: string) => React.ReactNode;
}

const DesktopSettingsLayout = ({ fallbackContent }: Props) => {
  const [active, setActive] = useState<string>('business');
  const { business } = useBusiness();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const storeUrl = business?.store_slug ? `${window.location.origin}/store/${business.store_slug}` : '';

  return (
    <div className="hidden md:flex h-[calc(100vh-0px)] bg-background">
      {/* Sidebar */}
      <aside className="w-[260px] border-r border-border bg-card/30 flex flex-col overflow-y-auto sticky top-0 h-screen lg:pl-20">
        <div className="px-5 pt-6 pb-4">
          <h1 className="text-xl font-bold font-display text-foreground">Settings</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Ezo POS Configuration</p>
        </div>

        {storeUrl && (
          <div className="mx-3 mb-4 rounded-xl glass-card p-2.5 text-xs">
            <p className="text-muted-foreground text-[10px] uppercase font-semibold">Store</p>
            <p className="text-primary font-semibold truncate">{business?.store_slug}</p>
            <div className="flex gap-1 mt-1.5">
              <button onClick={() => { navigator.clipboard.writeText(storeUrl); toast({ title: 'Copied!' }); }}
                className="flex-1 py-1 rounded-md bg-muted hover:bg-muted/70 flex items-center justify-center gap-1 text-[10px]"><Copy className="w-3 h-3" /> Copy</button>
              <button onClick={() => window.open(storeUrl, '_blank')}
                className="flex-1 py-1 rounded-md bg-muted hover:bg-muted/70 flex items-center justify-center gap-1 text-[10px]"><ExternalLink className="w-3 h-3" /> Open</button>
            </div>
          </div>
        )}

        <div className="flex-1 px-2">
          {SECTIONS.map((g) => (
            <div key={g.group} className="mb-4">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1.5">{g.group}</p>
              <div className="space-y-0.5">
                {g.items.map(item => {
                  const Icon = item.icon;
                  const isActive = active === item.id;
                  return (
                    <button key={item.id} onClick={() => setActive(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-primary/10 text-primary border-l-2 border-primary font-semibold' : 'text-foreground hover:bg-muted/50'}`}>
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="mb-4">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1.5">Quick Links</p>
            <div className="space-y-0.5">
              <button onClick={() => navigate('/store-manager')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted/50">
                <Palette className="w-4 h-4" /> Store Manager
              </button>
              <button onClick={() => navigate('/offers')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted/50">
                <Crown className="w-4 h-4" /> Offers & Coupons
              </button>
              <button onClick={() => navigate('/customers')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted/50">
                <Users className="w-4 h-4" /> Customers
              </button>
            </div>
          </div>
        </div>

        <button onClick={signOut}
          className="m-3 py-2.5 rounded-lg bg-destructive/10 text-destructive font-semibold text-sm flex items-center justify-center gap-2 hover:bg-destructive/15">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="px-8 py-8 max-w-5xl">
          <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold font-display text-foreground">
                {SECTIONS.flatMap(g => g.items).find(i => i.id === active)?.label}
              </h2>
            </div>
            {active === 'razorpay' ? <RazorpayPanel />
              : active === 'gst' ? <GstInvoicePanel />
              : active === 'printer' ? <PrintSettingsPanel />
              : active === 'notifications' ? <NotificationsPanel />
              : active === 'staff' ? <StaffPanel />
              : active === 'data' ? <DataBackupPanel />
              : fallbackContent(active)}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default DesktopSettingsLayout;
