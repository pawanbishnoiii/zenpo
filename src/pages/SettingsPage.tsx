import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Store, Printer, Palette, User, ChevronRight, Bell, Shield, Globe, LogOut, Tag, Users, Loader2, Link2, Save, ExternalLink, Check, X } from 'lucide-react';
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
  const { signOut, user, isAdmin } = useAuth();
  const { business, refetch } = useBusiness();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState<SettingsPanel>(null);
  const [connecting, setConnecting] = useState(false);

  const [bizName, setBizName] = useState('');
  const [bizPhone, setBizPhone] = useState('');
  const [bizAddress, setBizAddress] = useState('');
  const [bizGst, setBizGst] = useState('');
  const [bizSlug, setBizSlug] = useState('');
  const [bizPrinterType, setBizPrinterType] = useState('58mm');
  const [savingBiz, setSavingBiz] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (business) {
      setBizName(business.business_name || '');
      setBizPhone(business.phone || '');
      setBizAddress(business.address || '');
      setBizGst(business.gst_number || '');
      setBizSlug(business.store_slug || '');
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

  // Slug availability check
  useEffect(() => {
    if (activePanel !== 'business' || !bizSlug.trim()) { setSlugAvailable(null); return; }
    if (bizSlug === business?.store_slug) { setSlugAvailable(true); return; }
    const timer = setTimeout(async () => {
      setCheckingSlug(true);
      try {
        const { data } = await supabase.rpc('check_slug_available', { _slug: bizSlug.trim() });
        setSlugAvailable(data as boolean);
      } catch { setSlugAvailable(null); }
      setCheckingSlug(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [bizSlug, activePanel]);

  const handleSaveBusiness = async () => {
    if (!business) return;
    if (bizSlug.trim() && slugAvailable === false) {
      toast({ title: 'Store link not available', description: 'Please choose a different store link', variant: 'destructive' });
      return;
    }
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
    else { toast({ title: 'Saved!' }); refetch(); setActivePanel(null); }
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
    else { toast({ title: 'Profile updated!' }); setActivePanel(null); }
    setSavingProfile(false);
  };

  const handleConnectPrinter = async () => {
    setConnecting(true);
    const connection = await connectPrinter();
    setConnecting(false);
    if (connection.connected) toast({ title: 'Printer connected', description: connection.device?.name || 'Ezo machine ready' });
    else toast({ title: 'Connection failed', description: 'Turn on Bluetooth and keep printer in pairing mode.', variant: 'destructive' });
  };

  const storeUrl = bizSlug ? `${window.location.origin}/store/${bizSlug}` : '';

  const settingsGroups = useMemo(() => {
    const groups = [
      {
        title: 'Business',
        items: [
          { key: 'business' as SettingsPanel, icon: Store, label: 'Business Profile', desc: 'Name, GST, address, store link' },
          { key: 'printer' as SettingsPanel, icon: Printer, label: 'Printer Settings', desc: 'Ezo connection, paper size' },
          { key: 'theme' as SettingsPanel, icon: Palette, label: 'Theme', desc: 'Colors and appearance' },
        ],
      },
      {
        title: 'Modules',
        items: [
          { nav: '/offers', icon: Tag, label: 'Offers', desc: 'Discount campaigns' },
          { nav: '/customers', icon: Users, label: 'Customer Manager', desc: 'View and manage customers' },
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
    ];

    // Add admin panel for admin users
    if (isAdmin) {
      groups.push({
        title: 'Administration',
        items: [
          { nav: '/admin', icon: Shield, label: 'Admin Dashboard', desc: 'Platform management and gallery' } as any,
        ],
      });
    }

    return groups;
  }, [user?.email, isAdmin]);

  return (
    <div className="px-4 pt-4 lg:pl-24 max-w-2xl mx-auto space-y-6 pb-24">
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
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${group.title === 'Administration' ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                    <Icon className={`w-5 h-5 ${group.title === 'Administration' ? 'text-destructive' : 'text-primary'}`} />
                  </div>
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
              {activePanel === 'business' ? 'Business Profile' : activePanel === 'printer' ? 'Printer Settings' : activePanel === 'profile' ? 'Profile' : activePanel === 'theme' ? 'Theme' : activePanel === 'notifications' ? 'Notifications' : activePanel === 'security' ? 'Security' : activePanel === 'language' ? 'Language' : 'Settings'}
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
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Store Link</label>
                <input type="text" value={bizSlug} onChange={e => { setBizSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); setSlugAvailable(null); }}
                  placeholder="my-store" className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                {storeUrl && <p className="text-xs text-primary mt-1 flex items-center gap-1"><ExternalLink className="w-3 h-3" />{storeUrl}</p>}
                {checkingSlug && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Loader2 className="w-3 h-3 animate-spin" /> Checking...</p>}
                {!checkingSlug && slugAvailable === true && bizSlug.trim() && <p className="text-xs text-success font-medium flex items-center gap-1 mt-1"><Check className="w-3 h-3" /> Available</p>}
                {!checkingSlug && slugAvailable === false && bizSlug.trim() && <p className="text-xs text-destructive font-medium flex items-center gap-1 mt-1"><X className="w-3 h-3" /> Already taken</p>}
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
              <p className="text-sm text-muted-foreground">Turn on Bluetooth and keep the Ezo thermal printer in pairing mode before connecting.</p>
              <button onClick={() => void handleConnectPrinter()} disabled={connecting}
                className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />} Connect Ezo Printer
              </button>
              <div className="rounded-xl bg-muted/50 p-3 space-y-1">
                <p className="text-xs font-semibold text-foreground">How to connect:</p>
                <ol className="text-xs text-muted-foreground list-decimal pl-4 space-y-0.5">
                  <li>Turn on the Ezo printer and enable Bluetooth</li>
                  <li>Put the printer in pairing mode</li>
                  <li>Click "Connect Ezo Printer" above</li>
                  <li>Select the printer from the browser popup</li>
                </ol>
              </div>
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

          {activePanel === 'theme' && (
            <div className="space-y-3">
              <p className="text-sm text-foreground font-semibold">Current Theme: Fire Orange</p>
              <p className="text-xs text-muted-foreground">The Fire Orange theme is active. Category-based themes and dark mode toggle coming in a future update.</p>
              <div className="flex gap-2">
                {['hsl(24, 95%, 53%)', 'hsl(4, 90%, 58%)', 'hsl(38, 92%, 50%)', 'hsl(152, 69%, 45%)'].map((color, i) => (
                  <div key={i} className="w-10 h-10 rounded-xl border-2 border-border" style={{ background: color }} />
                ))}
              </div>
            </div>
          )}

          {activePanel === 'notifications' && (
            <div className="space-y-3">
              <p className="text-sm text-foreground font-semibold">Notification Preferences</p>
              <p className="text-xs text-muted-foreground">Push notifications and email alerts for low stock, daily revenue summary, and new customer registrations will be available in a future update.</p>
            </div>
          )}

          {activePanel === 'security' && (
            <div className="space-y-3">
              <p className="text-sm text-foreground font-semibold">Security</p>
              <p className="text-xs text-muted-foreground">Your session is secured with automatic token refresh. Password reset is available through email.</p>
              <div className="rounded-xl bg-muted/50 p-3 space-y-1">
                <p className="text-xs font-semibold text-foreground">Session Info</p>
                <p className="text-xs text-muted-foreground">Email: {user?.email}</p>
                <p className="text-xs text-muted-foreground">Role: {isAdmin ? 'Admin' : 'Owner'}</p>
              </div>
            </div>
          )}

          {activePanel === 'language' && (
            <div className="space-y-3">
              <p className="text-sm text-foreground font-semibold">Language</p>
              <p className="text-xs text-muted-foreground">Currently the app is in English. Additional language support (Hindi, etc.) will be available in a future update.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
