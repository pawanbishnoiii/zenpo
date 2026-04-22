import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Printer, Save, Loader2, Bluetooth } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/hooks/useBusiness';
import { useToast } from '@/hooks/use-toast';
import { connectPrinter } from '@/lib/ezoPrinter';

const PAPER_SIZES = [
  { id: '58mm', label: 'Thermal 58mm', desc: 'Most common pocket POS' },
  { id: '80mm', label: 'Thermal 80mm', desc: 'Standard receipt printer' },
  { id: 'a4', label: 'A4', desc: 'Office printer / invoices' },
];

const PrintSettingsPanel = () => {
  const { business } = useBusiness();
  const { toast } = useToast();
  const [paperSize, setPaperSize] = useState('58mm');
  const [showLogo, setShowLogo] = useState(true);
  const [showBarcode, setShowBarcode] = useState(true);
  const [headerText, setHeaderText] = useState('');
  const [footerText, setFooterText] = useState('Thank You!');
  const [autoPrint, setAutoPrint] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  useEffect(() => {
    if (!business) return;
    setLoading(true);
    supabase.from('printer_settings').select('*').eq('business_id', business.id).maybeSingle().then(({ data }) => {
      if (data) {
        setSettingsId(data.id);
        setPaperSize(data.paper_size || '58mm');
        setShowLogo(data.show_logo ?? true);
        setShowBarcode(data.show_barcode ?? true);
        setHeaderText(data.header_text || '');
        setFooterText(data.footer_text || 'Thank You!');
      }
      const stored = localStorage.getItem(`ezo_auto_print_${business.id}`);
      if (stored) setAutoPrint(stored === 'true');
      setLoading(false);
    });
  }, [business?.id]);

  const handleSave = async () => {
    if (!business) return;
    setSaving(true);
    const payload = {
      business_id: business.id,
      paper_size: paperSize,
      show_logo: showLogo,
      show_barcode: showBarcode,
      header_text: headerText.trim() || null,
      footer_text: footerText.trim() || 'Thank You!',
    };
    const { error } = settingsId
      ? await supabase.from('printer_settings').update(payload).eq('id', settingsId)
      : await supabase.from('printer_settings').insert(payload);
    if (!settingsId && !error) {
      const { data } = await supabase.from('printer_settings').select('id').eq('business_id', business.id).maybeSingle();
      if (data) setSettingsId(data.id);
    }
    localStorage.setItem(`ezo_auto_print_${business.id}`, autoPrint ? 'true' : 'false');
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else toast({ title: 'Saved!', description: 'Print settings updated.' });
    setSaving(false);
  };

  const handleConnect = async () => {
    setConnecting(true);
    const conn = await connectPrinter();
    setConnecting(false);
    if (conn.connected) toast({ title: 'Printer connected', description: conn.device?.name || 'Ready' });
    else toast({ title: 'Failed', description: 'Enable Bluetooth and try again.', variant: 'destructive' });
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex gap-3">
        <Printer className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">Receipt & Invoice Printing</p>
          <p className="text-xs text-muted-foreground mt-1">Configure paper size, branding and connect a Bluetooth thermal printer.</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Paper Size</p>
        <div className="grid md:grid-cols-3 gap-2">
          {PAPER_SIZES.map(p => (
            <button key={p.id} onClick={() => setPaperSize(p.id)}
              className={`p-3 rounded-xl border text-left transition-colors ${paperSize === p.id ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-muted/40'}`}>
              <p className="text-sm font-semibold text-foreground">{p.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{p.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {paperSize === 'a4' && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">A4 Orientation</p>
          <div className="flex gap-2">
            {(['portrait', 'landscape'] as const).map(o => (
              <button key={o} onClick={() => setOrientation(o)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${orientation === o ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                {o}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Header Text (optional)</label>
          <input value={headerText} onChange={e => setHeaderText(e.target.value)} placeholder="e.g. Welcome to Our Store"
            className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Footer Text</label>
          <input value={footerText} onChange={e => setFooterText(e.target.value)} placeholder="Thank You!"
            className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </div>

      <div className="space-y-2">
        {[
          { val: showLogo, set: setShowLogo, title: 'Show business logo on receipt', desc: 'Print your uploaded logo at the top' },
          { val: showBarcode, set: setShowBarcode, title: 'Show invoice barcode', desc: 'Scannable barcode for quick lookup' },
          { val: autoPrint, set: setAutoPrint, title: 'Auto-print after charge', desc: 'Send to printer immediately when invoice is created' },
        ].map((t, i) => (
          <label key={i} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border cursor-pointer">
            <div>
              <p className="text-sm font-semibold text-foreground">{t.title}</p>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
            </div>
            <input type="checkbox" checked={t.val} onChange={e => t.set(e.target.checked)}
              className="w-10 h-5 appearance-none bg-muted rounded-full relative checked:bg-primary transition-colors before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:left-[22px] before:transition-all" />
          </label>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleConnect} disabled={connecting}
          className="px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
          {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bluetooth className="w-4 h-4" />} Connect Bluetooth Printer
        </motion.button>
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving}
          className="ml-auto px-5 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
        </motion.button>
      </div>
    </div>
  );
};

export default PrintSettingsPanel;
