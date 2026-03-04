import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Phone, Mail, Car, Calendar, IndianRupee, Loader2 } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { useBusiness } from '@/hooks/useBusiness';
import { supabase } from '@/integrations/supabase/client';
import dayjs from 'dayjs';

const CustomerManagement = () => {
  const { business } = useBusiness();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!business) return;
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase.from('customers').select('*').eq('business_id', business.id).order('updated_at', { ascending: false }).limit(200);
      setCustomers(data || []);
      setLoading(false);
    };
    fetch();
  }, [business?.id]);

  const filtered = customers.filter(c =>
    (c.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search) ||
    (c.vehicle_number || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 pt-4 lg:pl-24 max-w-3xl mx-auto space-y-4 pb-24">
      <PageHeader title="Customers" backTo="/dashboard" actions={
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">{customers.length} total</span>
      } />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Search by name, phone or vehicle..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12"><Users className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" /><p className="text-sm text-muted-foreground">No customers found. Customers are auto-saved during billing.</p></div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
              className="rounded-2xl glass-card shadow-soft p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{c.full_name || 'Walk-in Customer'}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {c.phone && <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>}
                    {c.email && <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>}
                    {c.vehicle_number && <span className="text-xs text-muted-foreground flex items-center gap-1"><Car className="w-3 h-3" />{c.vehicle_number}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">₹{Number(c.total_spent || 0).toFixed(0)}</p>
                  <p className="text-[10px] text-muted-foreground">{c.visit_count || 0} visits</p>
                </div>
              </div>
              {c.last_visit_at && (
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Last visit: {dayjs(c.last_visit_at).format('DD MMM YYYY')}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
