import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Store, Printer, Palette, User, ChevronRight, Bell, Shield, Globe, LogOut, Tag, Users, Loader2, Link2, Save, ExternalLink, Check, X, Share2, Copy, Bluetooth, Wifi, Usb, Paintbrush, Star, MessageSquare, Calculator, Receipt, Sun, Moon } from 'lucide-react';
import GstAccountsPanel from '@/components/settings/GstAccountsPanel';
import GstInvoicePanel from '@/components/settings/GstInvoicePanel';
import { useTheme } from '@/hooks/useTheme';
import PageHeader from '@/components/layout/PageHeader';
import { useAuth } from '@/hooks/useAuth';
import { useBusiness } from '@/hooks/useBusiness';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { connectPrinter } from '@/lib/ezoPrinter';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { DASHBOARD_THEMES, type DashboardThemeKey, PRINTER_BRANDS } from '@/lib/categoryConfig';
import { getCategoryConfig } from '@/lib/categoryConfig';
import { useIsMobile } from '@/hooks/use-mobile';
import DesktopSettingsLayout from '@/components/settings/DesktopSettingsLayout';

type SettingsPanel = 'business' | 'printer' | 'theme' | 'profile' | 'notifications' | 'security' | 'language' | 'store_design' | 'reviews' | 'gst_accounts' | 'gst_invoice' | 'appearance' | null;

const STORE_THEME_OPTIONS = [
  { id: 'suspended', label: 'Minimal', desc: 'Clean, modern monochrome', emoji: '⚡' },
  { id: 'classic', label: 'Classic', desc: 'Elegant gold & dark', emoji: '✨' },
  { id: 'vibrant', label: 'Vibrant', desc: 'Bold violet & pink gradient', emoji: '🎨' },
  { id: 'nature', label: 'Nature', desc: 'Fresh green & earth tones', emoji: '🌿' },
  { id: 'ocean', label: 'Ocean', desc: 'Cool blue & sky tones', emoji: '🌊' },
];

const SettingsPage = () => {
  const { mode, toggle: toggleTheme } = useTheme();
  const { signOut, user, isAdmin } = useAuth();
  const { business, refetch } = useBusiness();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activePanel, setActivePanel] = useState<SettingsPanel>(null);
  const [connecting, setConnecting] = useState(false);

  const categoryConfig = business ? getCategoryConfig(business.category) : null;

  const [bizName, setBizName] = useState('');
  const [bizPhone, setBizPhone] = useState('');
  const [bizAddress, setBizAddress] = useState('');
  const [bizGst, setBizGst] = useState('');
  const [bizSlug, setBizSlug] = useState('');
  const [bizUpi, setBizUpi] = useState('');
  const [bizPrinterType, setBizPrinterType] = useState('58mm');
  const [savingBiz, setSavingBiz] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<DashboardThemeKey>('fire_orange');
  const [selectedPrinterBrand, setSelectedPrinterBrand] = useState('ezo');
  const [selectedPrinterModel, setSelectedPrinterModel] = useState('');
  const [selectedStoreTheme, setSelectedStoreTheme] = useState('suspended');
  const [savingStoreTheme, setSavingStoreTheme] = useState(false);

  // Reviews management
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

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
      setBizUpi((business as any).upi_id || '');
      setBizPrinterType(business.printer_type || '58mm');
      setSelectedStoreTheme((business as any).store_theme || 'suspended');
    }
  }, [business]);

  useEffect(() => {
    if (activePanel === 'profile' && user) {
      supabase.from('profiles').select('name, phone').eq('id', user.id).maybeSingle().then(({ data }) => {
        if (data) { setProfileName(data.name || ''); setProfilePhone(data.phone || ''); }
      });
    }
    if (activePanel === 'reviews' && business) {
      setLoadingReviews(true);
      supabase.from('product_reviews').select('*').eq('business_id', business.id).eq('is_approved', false).order('created_at', { ascending: false })
        .then(({ data }) => { setPendingReviews(data || []); setLoadingReviews(false); });
    }
  }, [activePanel, user, business]);

  useEffect(() => {
    if (activePanel !== 'business' || !bizSlug.trim()) { setSlugAvailable(null); return; }
    if (bizSlug === business?.store_slug) { setSlugAvailable(true); return; }
    const timer = setTimeout(async () => {
      setCheckingSlug(true);
      try { const { data } = await supabase.rpc('check_slug_available', { _slug: bizSlug.trim() }); setSlugAvailable(data as boolean); } catch { setSlugAvailable(null); }
      setCheckingSlug(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [bizSlug, activePanel]);

  const handleSaveBusiness = async () => {
    if (!business) return;
    if (bizSlug.trim() && slugAvailable === false) { toast({ title: 'Link not available', variant: 'destructive' }); return; }
    setSavingBiz(true);
    const { error } = await supabase.from('businesses').update({
      business_name: bizName.trim(), phone: bizPhone.trim() || null, address: bizAddress.trim() || null,
      gst_number: bizGst.trim() || null, store_slug: bizSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '') || null,
      upi_id: bizUpi.trim() || null, printer_type: bizPrinterType,
    } as any).eq('id', business.id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Saved!' }); refetch(); setActivePanel(null); }
    setSavingBiz(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase.from('profiles').update({ name: profileName.trim(), phone: profilePhone.trim() || null }).eq('id', user.id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Profile updated!' }); setActivePanel(null); }
    setSavingProfile(false);
  };

  const handleConnectPrinter = async () => {
    setConnecting(true);
    const conn = await connectPrinter();
    setConnecting(false);
    if (conn.connected) toast({ title: 'Printer connected', description: conn.device?.name || 'Ready' });
    else toast({ title: 'Failed', description: 'Enable Bluetooth and try again.', variant: 'destructive' });
  };

  const handleApplyTheme = () => {
    const t = DASHBOARD_THEMES[selectedTheme];
    document.documentElement.style.setProperty('--primary', t.primary);
    document.documentElement.style.setProperty('--ring', t.primary);
    document.documentElement.style.setProperty('--accent', t.accent);
    toast({ title: `Theme: ${t.label}`, description: 'Applied!' });
  };

  const handleSaveStoreTheme = async () => {
    if (!business) return;
    setSavingStoreTheme(true);
    const { error } = await supabase.from('businesses').update({ store_theme: selectedStoreTheme }).eq('id', business.id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Store theme saved!' }); refetch(); setActivePanel(null); }
    setSavingStoreTheme(false);
  };

  const handleApproveReview = async (id: string) => {
    await supabase.from('product_reviews').update({ is_approved: true }).eq('id', id);
    setPendingReviews(prev => prev.filter(r => r.id !== id));
    toast({ title: 'Review approved!' });
  };

  const handleDeleteReview = async (id: string) => {
    await supabase.from('product_reviews').delete().eq('id', id);
    setPendingReviews(prev => prev.filter(r => r.id !== id));
    toast({ title: 'Review deleted' });
  };

  const storeUrl = bizSlug ? `${window.location.origin}/store/${bizSlug}` : '';
  const currentBrand = PRINTER_BRANDS.find(b => b.id === selectedPrinterBrand);

  const settingsGroups = useMemo(() => {
    const groups = [
      {
        title: 'Business',
        items: [
          { key: 'business' as SettingsPanel, icon: Store, label: 'Business Profile', desc: 'Name, GST, address, store link' },
          { nav: '/store-manager', icon: Paintbrush, label: 'Store Manager', desc: 'Manage your public store website' },
          { key: 'printer' as SettingsPanel, icon: Printer, label: 'Printer & Devices', desc: 'Printer brand, model, connection' },
          { key: 'theme' as SettingsPanel, icon: Palette, label: 'Dashboard Theme', desc: 'Colors and appearance' },
        ],
      },
      {
        title: 'Modules',
        items: [
          { key: 'gst_accounts' as SettingsPanel, icon: Calculator, label: 'GST & Accounts', desc: 'Hisab kitab — sales, GST, credit ledger' },
          { key: 'gst_invoice' as SettingsPanel, icon: Receipt, label: 'Invoice & Tax Setup', desc: 'GST number, default tax %, prefix, footer' },
          { nav: '/offers', icon: Tag, label: 'Offers & Coupons', desc: 'Discount campaigns' },
          { nav: '/customers', icon: Users, label: categoryConfig?.navLabel.customers || 'Customer Manager', desc: 'CRM and analytics' },
          { nav: '/history', icon: Shield, label: 'Bill History', desc: 'All past invoices' },
          { key: 'reviews' as SettingsPanel, icon: MessageSquare, label: 'Reviews', desc: 'Approve customer reviews' },
        ],
      },
      {
        title: 'Account',
        items: [
          { key: 'profile' as SettingsPanel, icon: User, label: 'Profile', desc: user?.email || 'Name & contact' },
          { key: 'appearance' as SettingsPanel, icon: mode === 'dark' ? Moon : Sun, label: 'Appearance', desc: `${mode === 'dark' ? 'Dark' : 'Light'} mode` },
          { key: 'notifications' as SettingsPanel, icon: Bell, label: 'Notifications', desc: 'Alerts & updates' },
          { key: 'security' as SettingsPanel, icon: Shield, label: 'Security', desc: 'Sessions & login' },
          { key: 'language' as SettingsPanel, icon: Globe, label: 'Language', desc: 'English' },
        ],
      },
    ];
    if (isAdmin) {
      groups.push({
        title: 'Administration',
        items: [{ nav: '/admin', icon: Shield, label: 'Admin Dashboard', desc: 'Platform management' } as any],
      });
    }
    return groups;
  }, [user?.email, isAdmin, categoryConfig, mode]);

  // Desktop two-panel layout
  if (!isMobile) {
    return (
      <DesktopSettingsLayout fallbackContent={(sectionId) => (
        <div className="rounded-2xl glass-card p-6 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground mb-2">Coming Soon</p>
          <p>The <strong>{sectionId}</strong> panel is being built. Use the mobile layout for full options.</p>
        </div>
      )} />
    );
  }

  return (
    <div className="px-4 pt-4 lg:pl-24 max-w-2xl mx-auto space-y-6 pb-24">
      <PageHeader title={categoryConfig?.navLabel.settings || 'Settings'} backTo="/dashboard" />

      {business?.store_slug && (
        <div className="rounded-2xl glass-card shadow-soft p-4 flex items-center gap-3">
          <Globe className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground">Your Store</p>
            <p className="text-sm text-primary font-semibold truncate">{storeUrl}</p>
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => { navigator.clipboard.writeText(storeUrl); toast({ title: 'Copied!' }); }}
              className="p-2 rounded-lg hover:bg-muted"><Copy className="w-4 h-4 text-muted-foreground" /></button>
            <button onClick={() => window.open(storeUrl, '_blank')} className="p-2 rounded-lg hover:bg-muted"><ExternalLink className="w-4 h-4 text-muted-foreground" /></button>
          </div>
        </div>
      )}

      {categoryConfig && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            <categoryConfig.icon className="w-3.5 h-3.5" /> {categoryConfig.name}
          </div>
        </div>
      )}

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
              {activePanel === 'business' ? 'Business Profile' : activePanel === 'printer' ? 'Printer & Devices' : activePanel === 'profile' ? 'Profile' : activePanel === 'theme' ? 'Dashboard Theme' : activePanel === 'store_design' ? 'Design Your Store' : activePanel === 'reviews' ? 'Manage Reviews' : activePanel === 'notifications' ? 'Notifications' : activePanel === 'security' ? 'Security' : activePanel === 'language' ? 'Language' : 'Settings'}
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
                <label className="text-xs font-medium text-muted-foreground mb-1 block">UPI ID (for QR payments)</label>
                <input type="text" value={bizUpi} onChange={e => setBizUpi(e.target.value)} placeholder="yourname@okhdfcbank"
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <p className="text-[11px] text-muted-foreground mt-1">Customer scans this UPI ID via QR to pay you directly. Example: <code className="px-1 bg-muted rounded">9876543210@paytm</code></p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Store Link</label>
                <input type="text" value={bizSlug} onChange={e => { setBizSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); setSlugAvailable(null); }}
                  placeholder="my-store" className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                {storeUrl && <p className="text-xs text-primary mt-1 flex items-center gap-1"><ExternalLink className="w-3 h-3" />{storeUrl}</p>}
                {checkingSlug && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Loader2 className="w-3 h-3 animate-spin" /> Checking...</p>}
                {!checkingSlug && slugAvailable === true && bizSlug.trim() && <p className="text-xs text-success font-medium flex items-center gap-1 mt-1"><Check className="w-3 h-3" /> Available</p>}
                {!checkingSlug && slugAvailable === false && bizSlug.trim() && <p className="text-xs text-destructive font-medium flex items-center gap-1 mt-1"><X className="w-3 h-3" /> Taken</p>}
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleSaveBusiness} disabled={savingBiz}
                className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                {savingBiz ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
              </motion.button>
            </div>
          )}

          {activePanel === 'store_design' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
                <p className="text-sm font-semibold text-foreground">🎨 Customize Your Store</p>
                <p className="text-xs text-muted-foreground mt-1">Your store auto-uses your business category theme. Choose a custom override below.</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Theme Override</p>
                <div className="space-y-2">
                  {STORE_THEME_OPTIONS.map(t => (
                    <button key={t.id} onClick={() => setSelectedStoreTheme(t.id)}
                      className={`w-full p-3 rounded-xl border-2 text-left flex items-center gap-3 transition-colors ${selectedStoreTheme === t.id ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-muted'}`}>
                      <span className="text-2xl">{t.emoji}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{t.label}</p>
                        <p className="text-xs text-muted-foreground">{t.desc}</p>
                      </div>
                      {selectedStoreTheme === t.id && <Check className="w-4 h-4 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Store Features</p>
                <div className="space-y-2">
                  {[
                    { label: 'Show Products', desc: 'Display product catalog', enabled: true },
                    { label: 'Show Reviews', desc: 'Customer reviews section', enabled: true },
                    { label: 'Show Contact', desc: 'Contact information section', enabled: true },
                    { label: 'Show Offers', desc: 'Active offers & discounts', enabled: true },
                  ].map(f => (
                    <div key={f.label} className="flex items-center justify-between p-3 rounded-xl bg-secondary">
                      <div><p className="text-sm text-foreground">{f.label}</p><p className="text-[10px] text-muted-foreground">{f.desc}</p></div>
                      <div className={`w-10 h-6 rounded-full relative ${f.enabled ? 'bg-success' : 'bg-muted'}`}>
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${f.enabled ? 'right-0.5' : 'left-0.5'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <motion.button whileTap={{ scale: 0.97 }} onClick={handleSaveStoreTheme} disabled={savingStoreTheme}
                className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                {savingStoreTheme ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paintbrush className="w-4 h-4" />} Save Store Settings
              </motion.button>
              {business?.store_slug && (
                <button onClick={() => window.open(`${window.location.origin}/store/${business.store_slug}`, '_blank')}
                  className="w-full py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold flex items-center justify-center gap-2">
                  <ExternalLink className="w-4 h-4" /> Preview Store
                </button>
              )}
            </div>
          )}

          {activePanel === 'reviews' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Approve or reject customer reviews for your store.</p>
              {loadingReviews ? <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div> :
                pendingReviews.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">No pending reviews</p> :
                  pendingReviews.map(r => (
                    <div key={r.id} className="rounded-xl border border-border p-3 space-y-2">
                      <div className="flex items-center gap-1">{[...Array(5)].map((_, j) => <Star key={j} className={`w-3 h-3 ${j < r.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/20'}`} />)}</div>
                      {r.review_text && <p className="text-sm text-foreground italic">"{r.review_text}"</p>}
                      <p className="text-xs text-muted-foreground">{r.reviewer_name} • {new Date(r.created_at).toLocaleDateString()}</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleApproveReview(r.id)} className="flex-1 py-1.5 rounded-lg bg-success/10 text-success text-xs font-semibold">Approve</button>
                        <button onClick={() => handleDeleteReview(r.id)} className="flex-1 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold">Delete</button>
                      </div>
                    </div>
                  ))
              }
            </div>
          )}

          {activePanel === 'printer' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Select Printer Brand</label>
                <div className="grid grid-cols-3 gap-2">
                  {PRINTER_BRANDS.map(brand => (
                    <button key={brand.id} onClick={() => { setSelectedPrinterBrand(brand.id); setSelectedPrinterModel(''); }}
                      className={`p-2.5 rounded-xl text-xs font-semibold text-center transition-colors ${selectedPrinterBrand === brand.id ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-muted'}`}>
                      {brand.name}
                    </button>
                  ))}
                </div>
              </div>
              {currentBrand && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Select Model</label>
                  <div className="space-y-1.5">
                    {currentBrand.models.map(model => (
                      <button key={model} onClick={() => setSelectedPrinterModel(model)}
                        className={`w-full p-3 rounded-xl text-left text-sm transition-colors ${selectedPrinterModel === model ? 'bg-primary/10 border border-primary/30 text-primary font-semibold' : 'bg-secondary text-secondary-foreground hover:bg-muted'}`}>
                        {model}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {currentBrand && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Connection Type</label>
                  <div className="flex gap-2">
                    {currentBrand.connectionType.map(ct => (
                      <div key={ct} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium">
                        {ct === 'bluetooth' && <Bluetooth className="w-3 h-3" />}
                        {ct === 'usb' && <Usb className="w-3 h-3" />}
                        {ct === 'wifi' && <Wifi className="w-3 h-3" />}
                        {ct === 'network' && <Globe className="w-3 h-3" />}
                        {ct.charAt(0).toUpperCase() + ct.slice(1)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Paper Size</label>
                <div className="flex gap-2">
                  {['58mm', '80mm'].map(s => (
                    <button key={s} onClick={() => setBizPrinterType(s)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${bizPrinterType === s ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => void handleConnectPrinter()} disabled={connecting}
                className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                {selectedPrinterBrand === 'ezo' ? 'Connect via Bluetooth' : 'Connect Printer'}
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
                {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
              </motion.button>
            </div>
          )}

          {activePanel === 'theme' && (
            <div className="space-y-4">
              <p className="text-sm text-foreground font-semibold">Choose Dashboard Theme</p>
              <div className="grid grid-cols-2 gap-3">
                {(Object.entries(DASHBOARD_THEMES) as [DashboardThemeKey, typeof DASHBOARD_THEMES[DashboardThemeKey]][]).map(([key, t]) => (
                  <button key={key} onClick={() => setSelectedTheme(key)}
                    className={`p-3 rounded-xl border-2 text-left space-y-2 transition-colors ${selectedTheme === key ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg" style={{ background: `hsl(${t.primary})` }} />
                      <div className="w-8 h-8 rounded-lg" style={{ background: `hsl(${t.accent})` }} />
                      <span className="text-lg">{t.emoji}</span>
                    </div>
                    <p className="text-xs font-semibold text-foreground">{t.label}</p>
                    {selectedTheme === key && <Check className="w-4 h-4 text-primary" />}
                  </button>
                ))}
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleApplyTheme}
                className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">
                Apply Theme
              </motion.button>
            </div>
          )}

          {activePanel === 'notifications' && (
            <div className="space-y-3">
              {['Low stock alerts', 'New customer alerts', 'Daily sales summary', 'Offer expiry reminders'].map(item => (
                <div key={item} className="flex items-center justify-between p-3 rounded-xl bg-secondary">
                  <span className="text-sm text-foreground">{item}</span>
                  <div className="w-10 h-6 rounded-full bg-primary/30 relative"><div className="absolute right-0.5 top-0.5 w-5 h-5 rounded-full bg-primary transition-all" /></div>
                </div>
              ))}
            </div>
          )}

          {activePanel === 'security' && (
            <div className="space-y-3">
              <div className="rounded-xl bg-success/10 p-3">
                <p className="text-sm font-semibold text-success">Session Active</p>
                <p className="text-xs text-muted-foreground">Last login: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          )}

          {activePanel === 'language' && (
            <div className="space-y-3">
              {['English', 'Hindi', 'Tamil', 'Telugu', 'Marathi'].map(lang => (
                <button key={lang} className={`w-full p-3 rounded-xl text-left text-sm transition-colors ${lang === 'English' ? 'bg-primary/10 border border-primary/30 text-primary font-semibold' : 'bg-secondary text-secondary-foreground hover:bg-muted'}`}>
                  {lang} {lang === 'English' && <Check className="inline w-4 h-4 ml-2" />}
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
