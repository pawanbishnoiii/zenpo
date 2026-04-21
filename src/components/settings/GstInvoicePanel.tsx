import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Save, Receipt, Percent } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/hooks/useBusiness';
import { useToast } from '@/hooks/use-toast';

const GstInvoicePanel = () => {
  const { business, refetch } = useBusiness();
  const { toast } = useToast();
  const [gstNumber, setGstNumber] = useState('');
  const [gstEnabled, setGstEnabled] = useState(true);
  const [defaultTax, setDefaultTax] = useState(18);
  const [invoicePrefix, setInvoicePrefix] = useState('INV');
  const [footer, setFooter] = useState('Thank you for your business!');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (business) {
      setGstNumber(business.gst_number || '');
      setGstEnabled((business as any).gst_enabled !== false);
      setDefaultTax(Number((business as any).default_tax_percent ?? 18));
      setInvoicePrefix((business as any).invoice_prefix || 'INV');
      setFooter((business as any).invoice_footer || 'Thank you for your business!');
    }
  }, [business]);

  const handleSave = async () => {
    if (!business) return;
    setSaving(true);
    const { error } = await supabase.from('businesses').update({
      gst_number: gstNumber.trim() || null,
      gst_enabled: gstEnabled,
      default_tax_percent: defaultTax,
      invoice_prefix: invoicePrefix.trim().toUpperCase() || 'INV',
      invoice_footer: footer.trim() || 'Thank you!',
    } as any).eq('id', business.id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Saved!' }); refetch(); }
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex gap-3">
        <Receipt className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">GST & Invoice Setup</p>
          <p className="text-xs text-muted-foreground mt-1">Configure GST number, default tax rate, invoice numbering and footer text shown on every receipt.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">GSTIN</label>
          <input value={gstNumber} onChange={e => setGstNumber(e.target.value.toUpperCase())} placeholder="22AAAAA0000A1Z5" maxLength={15}
            className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Default Tax % (GST)</label>
          <div className="relative">
            <input type="number" value={defaultTax} onChange={e => setDefaultTax(Number(e.target.value) || 0)} min={0} max={50}
              className="w-full px-3 py-2.5 pr-9 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Invoice Number Prefix</label>
          <input value={invoicePrefix} onChange={e => setInvoicePrefix(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))} placeholder="INV"
            className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Invoice Footer Message</label>
          <textarea value={footer} onChange={e => setFooter(e.target.value)} rows={2} maxLength={200}
            className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
        </div>
      </div>

      <label className="flex items-center justify-between p-3 rounded-xl bg-card border border-border cursor-pointer">
        <div>
          <p className="text-sm font-semibold text-foreground">Show GST breakup on bills</p>
          <p className="text-xs text-muted-foreground">Display tax separately on invoices and printed receipts</p>
        </div>
        <input type="checkbox" checked={gstEnabled} onChange={e => setGstEnabled(e.target.checked)}
          className="w-10 h-5 appearance-none bg-muted rounded-full relative checked:bg-primary transition-colors before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:left-[22px] before:transition-all" />
      </label>

      <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving}
        className="px-5 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2 disabled:opacity-50">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save GST & Invoice Settings
      </motion.button>
    </div>
  );
};

export default GstInvoicePanel;
