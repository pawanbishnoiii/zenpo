// AdminBackup — JSON import/export of business data.
import { useState } from 'react';
import { Download, Upload, Loader2, Database, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const BACKUP_TABLES = ['businesses', 'products', 'customers', 'invoices', 'invoice_items', 'business_offers', 'gallery_products', 'subscription_plans', 'app_releases', 'admin_payment_settings', 'smtp_settings'];

const AdminBackup = () => {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');

  const exportAll = async () => {
    setBusy(true);
    const out: Record<string, any[]> = {};
    for (const t of BACKUP_TABLES) {
      setProgress(`Exporting ${t}…`);
      const { data } = await (supabase as any).from(t).select('*');
      out[t] = data || [];
    }
    const json = JSON.stringify({ version: 1, exported_at: new Date().toISOString(), tables: out }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `ezo-backup-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url);
    setBusy(false); setProgress('');
    toast({ title: 'Backup downloaded' });
  };

  const importJson = async (file: File) => {
    setBusy(true);
    try {
      const txt = await file.text();
      const parsed = JSON.parse(txt);
      if (!parsed.tables) throw new Error('Invalid backup file');
      let inserted = 0;
      for (const [t, rows] of Object.entries(parsed.tables) as [string, any[]][]) {
        if (!Array.isArray(rows) || rows.length === 0) continue;
        setProgress(`Importing ${rows.length} into ${t}…`);
        const { error } = await (supabase as any).from(t).upsert(rows, { onConflict: 'id' });
        if (!error) inserted += rows.length;
      }
      toast({ title: 'Imported', description: `${inserted} rows restored` });
    } catch (e: any) {
      toast({ title: 'Import failed', description: e.message, variant: 'destructive' });
    }
    setBusy(false); setProgress('');
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl glass-card p-5">
        <div className="flex items-center gap-2 mb-2"><Database className="w-5 h-5 text-primary" /><h3 className="font-bold">Backup & Restore</h3></div>
        <p className="text-xs text-muted-foreground mb-4">Export all platform data as JSON, or restore from a previous backup file. Existing rows with matching IDs will be updated.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <button onClick={exportAll} disabled={busy}
            className="flex items-center justify-center gap-2 py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-sm">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Export Backup (.json)
          </button>
          <label className="flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-secondary-foreground font-bold text-sm cursor-pointer">
            <Upload className="w-4 h-4" /> Import Backup
            <input type="file" accept="application/json" hidden onChange={e => e.target.files?.[0] && importJson(e.target.files[0])} disabled={busy} />
          </label>
        </div>
        {progress && <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> {progress}</p>}
      </div>

      <div className="rounded-2xl bg-warning/5 border border-warning/30 p-4 flex gap-2 text-xs text-foreground">
        <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
        <div><strong>Warning:</strong> Importing will overwrite rows by ID. Always export a fresh backup before restoring.</div>
      </div>

      <div className="rounded-2xl glass-card p-4">
        <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Tables included</p>
        <div className="flex flex-wrap gap-1.5">
          {BACKUP_TABLES.map(t => (
            <span key={t} className="px-2 py-1 rounded-lg bg-muted text-[10px] font-mono text-foreground flex items-center gap-1">
              <CheckCircle className="w-2.5 h-2.5 text-success" /> {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminBackup;
