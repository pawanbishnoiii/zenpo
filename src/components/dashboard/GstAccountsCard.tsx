import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Receipt, TrendingUp, AlertCircle, Wallet, Calculator, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/hooks/useBusiness';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

interface Stats {
  monthRevenue: number;
  monthTax: number;
  outstandingCredit: number;
  taxableInvoiceCount: number;
  topCustomerName: string | null;
  topCustomerAmount: number;
}

const GstAccountsCard = () => {
  const { business } = useBusiness();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    monthRevenue: 0, monthTax: 0, outstandingCredit: 0, taxableInvoiceCount: 0, topCustomerName: null, topCustomerAmount: 0,
  });

  useEffect(() => {
    if (!business) return;
    const load = async () => {
      const monthStart = dayjs().startOf('month').toISOString();
      const [{ data: invs }, { data: cust }] = await Promise.all([
        supabase.from('invoices').select('grand_total, tax_total, customer_name').eq('business_id', business.id).gte('created_at', monthStart),
        supabase.from('customers').select('full_name, credit_balance, total_spent').eq('business_id', business.id).order('total_spent', { ascending: false }).limit(1),
      ]);
      const monthRevenue = (invs || []).reduce((s, i) => s + Number(i.grand_total || 0), 0);
      const monthTax = (invs || []).reduce((s, i) => s + Number(i.tax_total || 0), 0);
      const taxableInvoiceCount = (invs || []).filter(i => Number(i.tax_total || 0) > 0).length;
      const { data: udhar } = await supabase.from('customers').select('credit_balance').eq('business_id', business.id).gt('credit_balance', 0);
      const outstandingCredit = (udhar || []).reduce((s, c) => s + Number(c.credit_balance || 0), 0);
      const top = cust?.[0];
      setStats({
        monthRevenue, monthTax, outstandingCredit, taxableInvoiceCount,
        topCustomerName: top?.full_name || null, topCustomerAmount: Number(top?.total_spent || 0),
      });
    };
    load();
  }, [business?.id]);

  const gstEnabled = (business as any)?.gst_enabled !== false;
  const gstNumber = business?.gst_number || '';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl glass-card shadow-soft overflow-hidden">
      <div className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center"><Calculator className="w-4 h-4 text-primary" /></div>
          <div>
            <p className="text-sm font-bold text-foreground">GST & Accounts</p>
            <p className="text-[11px] text-muted-foreground">{gstEnabled ? `GST ${gstNumber || 'enabled'} · ${dayjs().format('MMMM YYYY')}` : 'GST disabled'}</p>
          </div>
        </div>
        <button onClick={() => navigate('/reports')} className="text-[11px] text-primary font-semibold flex items-center gap-0.5 hover:underline">
          View <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-2 divide-x divide-border">
        <div className="p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            <TrendingUp className="w-3 h-3" /> Revenue
          </div>
          <p className="text-xl font-bold font-display text-foreground">₹{stats.monthRevenue.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-muted-foreground">This month</p>
        </div>
        <div className="p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            <Receipt className="w-3 h-3" /> GST Collected
          </div>
          <p className="text-xl font-bold font-display gradient-primary-text">₹{stats.monthTax.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-muted-foreground">{stats.taxableInvoiceCount} taxable bills</p>
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-border border-t border-border">
        <div className="p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            <Wallet className="w-3 h-3" /> Outstanding Credit
          </div>
          <p className={`text-xl font-bold font-display ${stats.outstandingCredit > 0 ? 'text-warning' : 'text-foreground'}`}>₹{stats.outstandingCredit.toLocaleString('en-IN')}</p>
          <button onClick={() => navigate('/customers')} className="text-[10px] text-primary hover:underline">View customers</button>
        </div>
        <div className="p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            <AlertCircle className="w-3 h-3" /> Top Customer
          </div>
          <p className="text-sm font-bold text-foreground truncate">{stats.topCustomerName || '—'}</p>
          {stats.topCustomerAmount > 0 && <p className="text-[10px] text-muted-foreground">₹{stats.topCustomerAmount.toLocaleString('en-IN')} lifetime</p>}
        </div>
      </div>
    </motion.div>
  );
};

export default GstAccountsCard;
