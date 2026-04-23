// GST & Accounts (Hisab Kitab) — full ledger tables: GST collected, credit log, invoices.
// Shown inside Settings → "GST & Accounts" panel and standalone via /accounts route.
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Receipt, Wallet, Calculator, FileText, IndianRupee, TrendingUp, Loader2, Download, Filter, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/hooks/useBusiness';
import dayjs from 'dayjs';

type TabKey = 'summary' | 'invoices' | 'credit' | 'gst';

const GstAccountsPanel = () => {
  const { business } = useBusiness();
  const [tab, setTab] = useState<TabKey>('summary');
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [creditLog, setCreditLog] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  const periodStart = useMemo(() => {
    if (period === 'today') return dayjs().startOf('day');
    if (period === 'week') return dayjs().subtract(7, 'day');
    if (period === 'month') return dayjs().startOf('month');
    return dayjs('2000-01-01');
  }, [period]);

  useEffect(() => {
    if (!business) return;
    setLoading(true);
    (async () => {
      const [{ data: invs }, { data: log }, { data: custs }] = await Promise.all([
        supabase.from('invoices').select('*').eq('business_id', business.id)
          .gte('created_at', periodStart.toISOString()).order('created_at', { ascending: false }).limit(500),
        supabase.from('customer_credit_log').select('*, customers(full_name, phone)').eq('business_id', business.id)
          .gte('created_at', periodStart.toISOString()).order('created_at', { ascending: false }).limit(500),
        supabase.from('customers').select('id, full_name, phone, credit_balance, total_spent, visit_count')
          .eq('business_id', business.id).gt('credit_balance', 0).order('credit_balance', { ascending: false }),
      ]);
      setInvoices(invs || []);
      setCreditLog(log || []);
      setCustomers(custs || []);
      setLoading(false);
    })();
  }, [business?.id, period]);

  const totals = useMemo(() => {
    const gross = invoices.reduce((s, i) => s + Number(i.grand_total || 0), 0);
    const tax = invoices.reduce((s, i) => s + Number(i.tax_total || 0), 0);
    const discount = invoices.reduce((s, i) => s + Number(i.discount_total || 0), 0);
    const cash = invoices.filter(i => i.payment_method === 'cash').reduce((s, i) => s + Number(i.grand_total || 0), 0);
    const upi = invoices.filter(i => i.payment_method === 'upi').reduce((s, i) => s + Number(i.grand_total || 0), 0);
    const online = invoices.filter(i => i.payment_method === 'razorpay').reduce((s, i) => s + Number(i.grand_total || 0), 0);
    const credit = invoices.filter(i => i.payment_method === 'credit').reduce((s, i) => s + Number(i.grand_total || 0), 0);
    const cod = invoices.filter(i => i.payment_method === 'cod').reduce((s, i) => s + Number(i.grand_total || 0), 0);
    const outstandingCredit = customers.reduce((s, c) => s + Number(c.credit_balance || 0), 0);
    return { gross, tax, discount, cash, upi, online, credit, cod, outstandingCredit, count: invoices.length };
  }, [invoices, customers]);

  const exportCsv = (rows: any[], cols: { key: string; label: string; fn?: (r: any) => any }[], filename: string) => {
    const header = cols.map(c => c.label).join(',');
    const body = rows.map(r => cols.map(c => `"${String(c.fn ? c.fn(r) : r[c.key] ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([header + '\n' + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
  };

  if (!business) return <div className="p-6 text-sm text-muted-foreground">No business selected.</div>;

  const tabs: { id: TabKey; label: string; icon: any }[] = [
    { id: 'summary', label: 'Summary', icon: Calculator },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'gst', label: 'GST', icon: Receipt },
    { id: 'credit', label: 'Credit Ledger', icon: Wallet },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-base font-bold font-display text-foreground flex items-center gap-2">
            <Calculator className="w-4 h-4 text-primary" /> GST & Accounts (Hisab Kitab)
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">{business.business_name} • GSTIN {business.gst_number || '—'}</p>
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-muted/50 p-1">
          {(['today', 'week', 'month', 'all'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold capitalize ${period === p ? 'bg-card text-foreground shadow-soft' : 'text-muted-foreground'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Tab pills */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap ${tab === t.id ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
              <Icon className="w-3 h-3" /> {t.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : tab === 'summary' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Revenue', value: totals.gross, icon: TrendingUp, color: 'text-success' },
            { label: 'GST Collected', value: totals.tax, icon: Receipt, color: 'text-primary' },
            { label: 'Discount Given', value: totals.discount, icon: IndianRupee, color: 'text-warning' },
            { label: 'Outstanding Credit', value: totals.outstandingCredit, icon: Wallet, color: 'text-destructive' },
            { label: 'Cash', value: totals.cash, icon: IndianRupee, color: 'text-foreground' },
            { label: 'UPI', value: totals.upi, icon: IndianRupee, color: 'text-foreground' },
            { label: 'Online (Razorpay)', value: totals.online, icon: IndianRupee, color: 'text-foreground' },
            { label: 'Credit (Khaata)', value: totals.credit, icon: IndianRupee, color: 'text-foreground' },
          ].map(c => {
            const Icon = c.icon;
            return (
              <motion.div key={c.label} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl glass-card p-3">
                <div className="flex items-center gap-1.5 mb-1"><Icon className={`w-3 h-3 ${c.color}`} /><span className="text-[10px] text-muted-foreground uppercase font-semibold">{c.label}</span></div>
                <p className="text-lg font-bold font-display text-foreground">₹{Number(c.value).toLocaleString('en-IN')}</p>
              </motion.div>
            );
          })}
        </div>
      ) : tab === 'invoices' ? (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">{invoices.length} invoices • ₹{totals.gross.toLocaleString('en-IN')} total</p>
            <button onClick={() => exportCsv(invoices, [
              { key: 'invoice_number', label: 'Invoice' },
              { key: 'created_at', label: 'Date', fn: r => dayjs(r.created_at).format('YYYY-MM-DD HH:mm') },
              { key: 'customer_name', label: 'Customer' },
              { key: 'customer_phone', label: 'Phone' },
              { key: 'subtotal', label: 'Subtotal' },
              { key: 'tax_total', label: 'GST' },
              { key: 'discount_total', label: 'Discount' },
              { key: 'grand_total', label: 'Total' },
              { key: 'payment_method', label: 'Method' },
            ], `invoices_${dayjs().format('YYYYMMDD')}.csv`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[11px] font-semibold">
              <Download className="w-3 h-3" /> Export CSV
            </button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="px-3 py-2 font-semibold text-muted-foreground">Invoice</th>
                  <th className="px-3 py-2 font-semibold text-muted-foreground">Date</th>
                  <th className="px-3 py-2 font-semibold text-muted-foreground">Customer</th>
                  <th className="px-3 py-2 font-semibold text-muted-foreground text-right">GST</th>
                  <th className="px-3 py-2 font-semibold text-muted-foreground text-right">Total</th>
                  <th className="px-3 py-2 font-semibold text-muted-foreground">Method</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No invoices in this period</td></tr>
                ) : invoices.map(i => (
                  <tr key={i.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-3 py-2 font-mono text-foreground">{i.invoice_number}</td>
                    <td className="px-3 py-2 text-muted-foreground">{dayjs(i.created_at).format('D MMM, h:mm A')}</td>
                    <td className="px-3 py-2 text-foreground truncate max-w-[140px]">{i.customer_name || '—'}</td>
                    <td className="px-3 py-2 text-right text-warning font-medium">₹{Number(i.tax_total || 0).toFixed(0)}</td>
                    <td className="px-3 py-2 text-right text-foreground font-bold">₹{Number(i.grand_total || 0).toFixed(0)}</td>
                    <td className="px-3 py-2"><span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-semibold uppercase">{i.payment_method || 'cash'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : tab === 'gst' ? (
        <div className="space-y-3">
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 grid grid-cols-3 gap-4 text-center">
            <div><p className="text-[10px] text-muted-foreground uppercase">Taxable Sales</p><p className="text-lg font-bold text-foreground">₹{(totals.gross - totals.tax).toLocaleString('en-IN')}</p></div>
            <div><p className="text-[10px] text-muted-foreground uppercase">GST Collected</p><p className="text-lg font-bold text-primary">₹{totals.tax.toLocaleString('en-IN')}</p></div>
            <div><p className="text-[10px] text-muted-foreground uppercase">Total Sales</p><p className="text-lg font-bold text-foreground">₹{totals.gross.toLocaleString('en-IN')}</p></div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="px-3 py-2 font-semibold text-muted-foreground">Invoice</th>
                  <th className="px-3 py-2 font-semibold text-muted-foreground">Date</th>
                  <th className="px-3 py-2 font-semibold text-muted-foreground text-right">Taxable</th>
                  <th className="px-3 py-2 font-semibold text-muted-foreground text-right">CGST</th>
                  <th className="px-3 py-2 font-semibold text-muted-foreground text-right">SGST</th>
                  <th className="px-3 py-2 font-semibold text-muted-foreground text-right">Total GST</th>
                </tr>
              </thead>
              <tbody>
                {invoices.filter(i => Number(i.tax_total || 0) > 0).length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No taxable invoices</td></tr>
                ) : invoices.filter(i => Number(i.tax_total || 0) > 0).map(i => {
                  const tax = Number(i.tax_total || 0);
                  return (
                    <tr key={i.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-3 py-2 font-mono text-foreground">{i.invoice_number}</td>
                      <td className="px-3 py-2 text-muted-foreground">{dayjs(i.created_at).format('D MMM')}</td>
                      <td className="px-3 py-2 text-right text-foreground">₹{(Number(i.subtotal || 0) - Number(i.discount_total || 0)).toFixed(0)}</td>
                      <td className="px-3 py-2 text-right text-foreground">₹{(tax / 2).toFixed(2)}</td>
                      <td className="px-3 py-2 text-right text-foreground">₹{(tax / 2).toFixed(2)}</td>
                      <td className="px-3 py-2 text-right text-primary font-bold">₹{tax.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Credit Ledger
        <div className="space-y-3">
          <div className="rounded-xl bg-warning/5 border border-warning/20 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Outstanding Credit</p>
              <p className="text-2xl font-bold font-display text-warning">₹{totals.outstandingCredit.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{customers.length} customers owe money</p>
            </div>
            <Wallet className="w-8 h-8 text-warning/40" />
          </div>

          <p className="text-xs font-semibold text-muted-foreground uppercase">Customers with Outstanding Credit</p>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="px-3 py-2 font-semibold text-muted-foreground">Customer</th>
                  <th className="px-3 py-2 font-semibold text-muted-foreground">Phone</th>
                  <th className="px-3 py-2 font-semibold text-muted-foreground text-right">Visits</th>
                  <th className="px-3 py-2 font-semibold text-muted-foreground text-right">Total Spent</th>
                  <th className="px-3 py-2 font-semibold text-muted-foreground text-right">Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">All customers are settled ✓</td></tr>
                ) : customers.map(c => (
                  <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-3 py-2 text-foreground font-medium">{c.full_name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{c.phone}</td>
                    <td className="px-3 py-2 text-right text-foreground">{c.visit_count}</td>
                    <td className="px-3 py-2 text-right text-foreground">₹{Number(c.total_spent || 0).toFixed(0)}</td>
                    <td className="px-3 py-2 text-right text-warning font-bold">₹{Number(c.credit_balance || 0).toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs font-semibold text-muted-foreground uppercase pt-2">Recent Credit Transactions</p>
          <div className="overflow-x-auto rounded-xl border border-border max-h-72">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 sticky top-0">
                <tr className="text-left">
                  <th className="px-3 py-2 font-semibold text-muted-foreground">Date</th>
                  <th className="px-3 py-2 font-semibold text-muted-foreground">Customer</th>
                  <th className="px-3 py-2 font-semibold text-muted-foreground">Reason</th>
                  <th className="px-3 py-2 font-semibold text-muted-foreground text-right">Change</th>
                </tr>
              </thead>
              <tbody>
                {creditLog.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">No credit movements yet</td></tr>
                ) : creditLog.map(l => (
                  <tr key={l.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{dayjs(l.created_at).format('D MMM, h:mm A')}</td>
                    <td className="px-3 py-2 text-foreground">{l.customers?.full_name || '—'}</td>
                    <td className="px-3 py-2 text-muted-foreground italic truncate max-w-[160px]">{l.reason}</td>
                    <td className={`px-3 py-2 text-right font-bold ${Number(l.amount) > 0 ? 'text-warning' : 'text-success'}`}>
                      {Number(l.amount) > 0 ? '+' : ''}₹{Math.abs(Number(l.amount)).toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default GstAccountsPanel;
