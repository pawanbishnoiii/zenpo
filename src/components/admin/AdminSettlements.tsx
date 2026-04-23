// Admin Settlements view — pending/processed payouts with manual approve.
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Check, IndianRupee, Calendar, Building2, RefreshCw, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import dayjs from 'dayjs';

const AdminSettlements = () => {
  const { toast } = useToast();
  const [settlements, setSettlements] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('pending');
  const [running, setRunning] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: setts }, { data: bizs }] = await Promise.all([
      supabase.from('settlements').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('businesses').select('id, business_name'),
    ]);
    setSettlements(setts || []);
    setBusinesses(Object.fromEntries((bizs || []).map(b => [b.id, b.business_name])));
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleApprove = async (id: string) => {
    const ref = prompt('Razorpay payout reference ID (or "manual"):');
    if (ref === null) return;
    setApproving(id);
    const { error } = await supabase.from('settlements').update({
      status: 'paid',
      processed_at: new Date().toISOString(),
      razorpay_payout_id: ref || 'manual',
      payout_method: ref && ref !== 'manual' ? 'razorpay_x' : 'manual',
    }).eq('id', id);
    if (error) toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Settlement approved', description: 'Marked as paid.' }); fetchAll(); }
    setApproving(null);
  };

  const handleRunCron = async () => {
    setRunning(true);
    const { data, error } = await supabase.functions.invoke('run-daily-settlement', { body: {} });
    if (error) toast({ title: 'Cron failed', description: error.message, variant: 'destructive' });
    else toast({ title: 'Settlement run complete', description: `${data?.created || 0} new settlement(s) created` });
    setRunning(false);
    fetchAll();
  };

  const filtered = settlements.filter(s => filter === 'all' || s.status === filter);
  const totals = filtered.reduce((acc, s) => ({
    gross: acc.gross + Number(s.gross_amount || 0),
    commission: acc.commission + Number(s.commission_amount || 0),
    net: acc.net + Number(s.net_amount || 0),
  }), { gross: 0, commission: 0, net: 0 });

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold font-display text-foreground">Settlements</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Daily payouts to store owners. Cron runs automatically at 04:30 IST.</p>
        </div>
        <button onClick={handleRunCron} disabled={running}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold disabled:opacity-50">
          {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Run Now
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl glass-card p-3"><p className="text-[10px] text-muted-foreground uppercase">Gross</p><p className="text-lg font-bold text-foreground">₹{totals.gross.toFixed(0)}</p></div>
        <div className="rounded-xl glass-card p-3"><p className="text-[10px] text-muted-foreground uppercase">Commission</p><p className="text-lg font-bold text-warning">₹{totals.commission.toFixed(0)}</p></div>
        <div className="rounded-xl glass-card p-3"><p className="text-[10px] text-muted-foreground uppercase">Net Payable</p><p className="text-lg font-bold text-success">₹{totals.net.toFixed(0)}</p></div>
      </div>

      <div className="flex gap-2">
        {(['pending', 'paid', 'all'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize ${filter === f ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">No settlements in this view.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(s => {
            const isPaid = s.status === 'paid';
            return (
              <motion.div key={s.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl glass-card p-4 flex items-center gap-3 flex-wrap">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPaid ? 'bg-success/10' : 'bg-warning/10'}`}>
                  <Building2 className={`w-5 h-5 ${isPaid ? 'text-success' : 'text-warning'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{businesses[s.business_id] || 'Unknown business'}</p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                    <Calendar className="w-3 h-3" /> {dayjs(s.period_start).format('D MMM')} – {dayjs(s.period_end).format('D MMM')}
                    <span>• {s.txn_count} txn</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">Net</p>
                  <p className="text-base font-bold text-success">₹{Number(s.net_amount).toFixed(0)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">Commission</p>
                  <p className="text-sm font-semibold text-warning">₹{Number(s.commission_amount).toFixed(0)}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${isPaid ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}>
                  {s.status.toUpperCase()}
                </span>
                {!isPaid ? (
                  <button onClick={() => handleApprove(s.id)} disabled={approving === s.id}
                    className="px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground text-xs font-bold flex items-center gap-1 disabled:opacity-50">
                    {approving === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Approve
                  </button>
                ) : (
                  <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[120px]" title={s.razorpay_payout_id}>
                    {s.razorpay_payout_id}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminSettlements;
