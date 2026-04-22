import { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Download, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/hooks/useBusiness';
import { useToast } from '@/hooks/use-toast';

const DataBackupPanel = () => {
  const { business } = useBusiness();
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);
  const [purging, setPurging] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const downloadCsv = (filename: string, rows: any[]) => {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(','),
      ...rows.map(r => headers.map(h => {
        const v = r[h];
        const s = v == null ? '' : String(v).replace(/"/g, '""');
        return /[",\n]/.test(s) ? `"${s}"` : s;
      }).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAll = async () => {
    if (!business) return;
    setExporting(true);
    try {
      const [products, customers, invoices] = await Promise.all([
        supabase.from('products').select('*').eq('business_id', business.id),
        supabase.from('customers').select('*').eq('business_id', business.id),
        supabase.from('invoices').select('*').eq('business_id', business.id),
      ]);
      const stamp = new Date().toISOString().slice(0, 10);
      if (products.data?.length) downloadCsv(`ezo-products-${stamp}.csv`, products.data);
      if (customers.data?.length) downloadCsv(`ezo-customers-${stamp}.csv`, customers.data);
      if (invoices.data?.length) downloadCsv(`ezo-invoices-${stamp}.csv`, invoices.data);
      toast({ title: 'Export ready!', description: 'CSV files downloaded.' });
    } catch (e: any) {
      toast({ title: 'Export failed', description: e.message, variant: 'destructive' });
    } finally { setExporting(false); }
  };

  const handlePurgeOldInvoices = async () => {
    if (!business) return;
    setPurging(true);
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 6);
    // Note: invoices delete blocked by RLS — just report count
    const { count } = await supabase.from('invoices').select('id', { count: 'exact', head: true })
      .eq('business_id', business.id).lt('created_at', cutoff.toISOString());
    toast({ title: `${count || 0} invoices older than 6 months found`, description: 'Contact support to purge — invoices cannot be auto-deleted for compliance.' });
    setPurging(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex gap-3">
        <Database className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">Data & Backup</p>
          <p className="text-xs text-muted-foreground mt-1">Export your business data and manage retention.</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Export all data (CSV)</p>
          <p className="text-xs text-muted-foreground">Downloads products, customers and invoices as separate CSV files.</p>
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleExportAll} disabled={exporting}
          className="px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download Backup
        </motion.button>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Old invoice cleanup</p>
          <p className="text-xs text-muted-foreground">Find invoices older than 6 months.</p>
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={handlePurgeOldInvoices} disabled={purging}
          className="px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
          {purging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Scan Old Invoices
        </motion.button>
      </div>

      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-destructive">Danger Zone</p>
            <p className="text-xs text-muted-foreground">Permanently delete all business data. This cannot be undone.</p>
          </div>
        </div>
        <input value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder='Type "DELETE" to enable'
          className="w-full px-3 py-2 rounded-xl bg-background border border-destructive/30 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-destructive/30" />
        <button disabled={confirmText !== 'DELETE'} onClick={() => toast({ title: 'Contact support', description: 'For your safety, full data deletion requires support assistance.', variant: 'destructive' })}
          className="px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed">
          Delete All Data
        </button>
      </div>
    </div>
  );
};

export default DataBackupPanel;
