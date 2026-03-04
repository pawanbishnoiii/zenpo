import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Store, Printer, Palette, User, ChevronRight, Bell, Shield, Globe, LogOut, Tag, Users, Loader2, Link2, Save, ExternalLink } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { useAuth } from '@/hooks/useAuth';
import { useBusiness } from '@/hooks/useBusiness';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { connectPrinter } from '@/lib/ezoPrinter';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

type SettingsPanel = 'business' | 'printer' | 'theme' | 'profile' | 'notifications' | 'security' | 'language' | null;

const SettingsPage = () => {
  const { signOut, user } = useAuth();
  const { business, refetch } = useBusiness();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState<SettingsPanel>(null);
  const [connecting, setConnecting] = useState(false);

  // Business edit state
  const [bizName, setBizName] = useState('');
  const [bizPhone, setBizPhone] = useState('');
  const [bizAddress, setBizAddress] = useState('');
  const [bizGst, setBizGst] = useState('');
  const [bizSlug, setBizSlug] = useState('');
  const [bizPrinterType, setBizPrinterType] = useState('58mm');
  const [savingBiz, setSavingBiz] = useState(false);

  // Profile edit
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (business) {
      setBizName(business.business_name || '');
      setBizPhone(business.phone || '');
      setBizAddress(business.address || '');
      setBizGst(business.gst_number || '');
      setBizSlug((business as any).store_slug || '');
      setBizPrinterType(business.printer_type || '58mm');
    }
  }, [business]);

  useEffect(() => {
    if (activePanel === 'profile' && user) {
      supabase.from('profiles').select('name, phone').eq('id', user.id).maybeSingle().then(({ data }) => {
        if (data) { setProfileName(data.name || ''); setProfilePhone(data.phone || ''); }
      });
    }
  }, [activePanel, user]);

  const handleSaveBusiness = async () => {
    if (!business) return;
    setSavingBiz(true);
    const { error } = await supabase.from('businesses').update({
      business_name: bizName.trim(),
      phone: bizPhone.trim() || null,
      address: bizAddress.trim() || null,
      gst_number: bizGst.trim() || null,
      store_slug: bizSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '') || null,
      printer_type: bizPrinterType,
    }).eq('id', business.id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Saved!' }); refetch(); }
    setSavingBiz(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase.from('profiles').update({
      name: profileName.trim(),
      phone: profilePhone.trim() || null,
    }).eq('id', user.id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else toast({ title: 'Profile updated!' });
    setSavingProfile(false);
  };

  const handleConnectPrinter = async () => {
    setConnecting(true);
    const connection = await connectPrinter();
    setConnecting(false);
    if (connection.connected) toast({ title: 'Printer connected', description: connection.device?.name || 'Ezo machine ready' });
    else toast({ title: 'Connection failed', description: 'Bluetooth on karein aur printer pairing mode me rakhein.', variant: 'destructive' });
  };

  const settingsGroups = useMemo(() => [
    {
      title: 'Business',
      items: [
        { key: 'business' as SettingsPanel, icon: Store, label: 'Business Profile', desc: 'Name, GST, address, store link' },
        { key: 'printer' as SettingsPanel, icon: Printer, label: 'Printer Settings', desc: 'Ezo connection, paper size' },
        { key: 'theme' as SettingsPanel, icon: Palette, label: 'Theme', desc: 'Colors and style' },
      ],
    },
    {
      title: 'Modules',
      items: [
        { nav: '/offers', icon: Tag, label: 'Offers', desc: 'Discount campaigns' },
        { nav: '/customers', icon: Users, label: 'Customer Manager', desc: 'Saved billing customers' },
        { nav: '/history', icon: Shield, label: 'Bill History', desc: 'All past invoices' },
      ],
    },
    {
      title: 'Account',
      items: [
        { key: 'profile' as SettingsPanel, icon: User, label: 'Profile', desc: user?.email || 'Name & contact' },
        { key: 'notifications' as SettingsPanel, icon: Bell, label: 'Notifications', desc: 'Alerts and updates' },
        { key: 'security' as SettingsPanel, icon: Shield, label: 'Security', desc: 'Sessions and login' },
        { key: 'language' as SettingsPanel, icon: Globe, label: 'Language', desc: 'App language' },
      ],
    },
  ], [user?.email]);

  const storeUrl = bizSlug ? `${window.location.origin}/store/${bizSlug}` : '';

  return (
    <div className="px-4 pt-4 lg:pl-24 max-w-2xl mx-auto space-y-6 pb-8">
      <PageHeader title="Settings" backTo="/dashboard" />

      {settingsGroups.map((group, gi) => (
        <motion.div key={group.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.1 }} className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">{group.title}</p>
          <div className="rounded-2xl glass-card shadow-soft overflow-hidden divide-y divide-border">
            {group.items.map((item: any) => {
              const Icon = item.icon;
              return (
                <button key={item.label} onClick={() => item.nav ? navigate(item.nav) : setActivePanel(item.key)}
                  className="flex items-center gap-3 p-4 w-full text-left hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Icon className="w-5 h-5 text-primary" /></div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-foreground">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </motion.div>
      ))}

      <motion.button whileTap={{ scale: 0.97 }} onClick={signOut}
        className="w-full py-3 rounded-xl bg-destructive/10 text-destructive font-semibold text-sm flex items-center justify-center gap-2">
        <LogOut className="w-4 h-4" /> Logout
      </motion.button>

      <Dialog open={!!activePanel} onOpenChange={open => !open && setActivePanel(null)}>
        <DialogContent className="rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {activePanel === 'business' ? 'Business Profile' : activePanel === 'printer' ? 'Printer Settings' : activePanel === 'profile' ? 'Profile' : 'Settings'}
            </DialogTitle>
            <DialogDescription>Manage your settings</DialogDescription>
          </DialogHeader>

          {activePanel === 'business' && (
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Business Name</label>
                <input type="text" value={bizName} onChange={e => setBizName(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
                <input type="tel" value={bizPhone} onChange={e => setBizPhone(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Address</label>
                <textarea value={bizAddress} onChange={e => setBizAddress(e.target.value)} rows={2} className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" /></div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">GST Number</label>
                <input type="text" value={bizGst} onChange={e => setBizGst(e.target.value.toUpperCase())} className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Store Link (slug)</label>
                <input type="text" value={bizSlug} onChange={e => setBizSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="my-store" className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                {storeUrl && <p className="text-xs text-primary mt-1 flex items-center gap-1"><ExternalLink className="w-3 h-3" />{storeUrl}</p>}
              </div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Printer Paper Size</label>
                <div className="flex gap-2">{['58mm', '80mm'].map(s => (
                  <button key={s} onClick={() => setBizPrinterType(s)} className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${bizPrinterType === s ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>{s}</button>
                ))}</div>
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleSaveBusiness} disabled={savingBiz}
                className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                {savingBiz ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
              </motion.button>
            </div>
          )}

          {activePanel === 'printer' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Ezo thermal printer connect karne ke liye Bluetooth on karein aur printer pairing mode me rakhein.</p>
              <button onClick={() => void handleConnectPrinter()} disabled={connecting}
                className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />} Connect Ezo Printer
              </button>
            </div>
          )}

          {activePanel === 'profile' && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Email: {user?.email}</p>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Name</label>
                <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
                <input type="tel" value={profilePhone} onChange={e => setProfilePhone(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleSaveProfile} disabled={savingProfile}
                className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Profile
              </motion.button>
            </div>
          )}

          {activePanel === 'theme' && <p className="text-sm text-muted-foreground">Fire theme active hai. Category-based themes next update me aayenge.</p>}
          {activePanel === 'notifications' && <p className="text-sm text-muted-foreground">Push notifications agle update me add honge.</p>}
          {activePanel === 'security' && <p className="text-sm text-muted-foreground">Session security active hai. Password reset support bhi available hai through email.</p>}
          {activePanel === 'language' && <p className="text-sm text-muted-foreground">Language selection (Hindi, English) agle phase me add hoga.</p>}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
