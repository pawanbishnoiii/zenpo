import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Save, Mail, MessageCircle, Package } from 'lucide-react';
import { useBusiness } from '@/hooks/useBusiness';
import { useToast } from '@/hooks/use-toast';

interface Prefs {
  whatsapp_after_charge: boolean;
  email_after_charge: boolean;
  low_stock_alerts: boolean;
  low_stock_threshold: number;
  business_email: string;
  email_signature: string;
}

const DEFAULTS: Prefs = {
  whatsapp_after_charge: true,
  email_after_charge: false,
  low_stock_alerts: true,
  low_stock_threshold: 5,
  business_email: '',
  email_signature: 'Thank you for your business!\n— Powered by Ezo POS',
};

const NotificationsPanel = () => {
  const { business } = useBusiness();
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!business) return;
    const stored = localStorage.getItem(`ezo_notif_${business.id}`);
    if (stored) {
      try { setPrefs({ ...DEFAULTS, ...JSON.parse(stored) }); } catch { setPrefs(DEFAULTS); }
    }
  }, [business?.id]);

  const handleSave = () => {
    if (!business) return;
    setSaving(true);
    localStorage.setItem(`ezo_notif_${business.id}`, JSON.stringify(prefs));
    setTimeout(() => {
      setSaving(false);
      toast({ title: 'Preferences saved!', description: 'Notification settings updated.' });
    }, 300);
  };

  const update = <K extends keyof Prefs>(k: K, v: Prefs[K]) => setPrefs(p => ({ ...p, [k]: v }));

  const toggles: Array<{ key: keyof Prefs; title: string; desc: string; icon: any }> = [
    { key: 'whatsapp_after_charge', title: 'Auto-open WhatsApp after charge', desc: 'Pre-fills bill share via wa.me deep link (no API)', icon: MessageCircle },
    { key: 'email_after_charge', title: 'Auto-send email after charge', desc: 'Sends invoice to customer if email provided', icon: Mail },
    { key: 'low_stock_alerts', title: 'Low stock alerts', desc: 'Show toast and badge when stock falls below threshold', icon: Package },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex gap-3">
        <Bell className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">Notification Preferences</p>
          <p className="text-xs text-muted-foreground mt-1">Control alerts, sharing automations and email signatures.</p>
        </div>
      </div>

      <div className="space-y-2">
        {toggles.map(t => {
          const Icon = t.icon;
          return (
            <label key={t.key} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Icon className="w-4 h-4 text-primary" /></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </div>
              <input type="checkbox" checked={prefs[t.key] as boolean} onChange={e => update(t.key, e.target.checked as any)}
                className="w-10 h-5 appearance-none bg-muted rounded-full relative checked:bg-primary transition-colors before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:left-[22px] before:transition-all" />
            </label>
          );
        })}
      </div>

      {prefs.low_stock_alerts && (
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Low stock threshold</label>
          <div className="flex items-center gap-2">
            <input type="number" min={1} value={prefs.low_stock_threshold} onChange={e => update('low_stock_threshold', Math.max(1, Number(e.target.value) || 1))}
              className="w-24 px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <span className="text-xs text-muted-foreground">Alert when stock falls below this number</span>
          </div>
        </div>
      )}

      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Business email (for sending invoices)</label>
        <input type="email" value={prefs.business_email} onChange={e => update('business_email', e.target.value)} placeholder="hello@yourstore.com"
          className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Email signature</label>
        <textarea value={prefs.email_signature} onChange={e => update('email_signature', e.target.value)} rows={3}
          className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
      </div>

      <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving}
        className="px-5 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2 disabled:opacity-50">
        <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Preferences'}
      </motion.button>
    </div>
  );
};

export default NotificationsPanel;
