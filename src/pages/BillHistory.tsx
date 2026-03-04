import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Receipt, Calendar, ChevronRight, Loader2 } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { useBusiness } from '@/hooks/useBusiness';
import { supabase } from '@/integrations/supabase/client';
import dayjs from 'dayjs';
import InvoiceDetailDialog from '@/components/billing/InvoiceDetailDialog';

const BillHistory = () => {
  const { business } = useBusiness();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    if (!business) return;
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase.from('invoices').select('*').eq('business_id', business.id).order('created_at', { ascending: false }).limit(100);
      setInvoices(data || []);
      setLoading(false);
    };
    fetch();
  }, [business?.id]);

  const filtered = invoices.filter(inv =>
    inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
    (inv.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (inv.customer_phone || '').includes(search)
  );

  return (
    <div className="px-4 pt-4 lg:pl-24 max-w-3xl mx-auto space-y-4 pb-24">
      <PageHeader title="Bill History" backTo="/dashboard" />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Search by invoice #, customer name or phone..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      <div className="text-xs text-muted-foreground">{invoices.length} invoices total</div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12"><Receipt className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" /><p className="text-sm text-muted-foreground">No invoices found</p></div>
      ) : (
        <div className="space-y-2">
          {filtered.map((inv, i) => (
            <motion.button key={inv.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
              onClick={() => setSelected(inv)}
              className="w-full flex items-center gap-3 p-4 rounded-2xl glass-card shadow-soft text-left hover:shadow-elevated transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Receipt className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{inv.invoice_number}</p>
                  <p className="text-sm font-bold text-foreground">₹{Number(inv.grand_total).toFixed(0)}</p>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-muted-foreground truncate">{inv.customer_name || 'Walk-in'} {inv.customer_phone ? `• ${inv.customer_phone}` : ''}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Calendar className="w-3 h-3" />
                    {dayjs(inv.created_at).format('DD MMM, h:mm A')}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </motion.button>
          ))}
        </div>
      )}

      {selected && <InvoiceDetailDialog open={!!selected} onClose={() => setSelected(null)} invoice={selected} businessName={business?.business_name} />}
    </div>
  );
};

export default BillHistory;
