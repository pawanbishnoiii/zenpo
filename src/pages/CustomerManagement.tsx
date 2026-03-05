import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Phone, Mail, Car, Calendar, IndianRupee, Loader2, Pencil, Trash2, X, Save, MessageSquare } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { useBusiness } from '@/hooks/useBusiness';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import dayjs from 'dayjs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const CustomerManagement = () => {
  const { business } = useBusiness();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<any>(null);
  const [editForm, setEditForm] = useState({ full_name: '', phone: '', email: '', vehicle_number: '', notes: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchCustomers = async () => {
    if (!business) return;
    setLoading(true);
    const { data } = await supabase.from('customers').select('*').eq('business_id', business.id).order('updated_at', { ascending: false }).limit(200);
    setCustomers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCustomers(); }, [business?.id]);

  const filtered = customers.filter(c =>
    (c.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search) ||
    (c.vehicle_number || '').toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (c: any) => {
    setEditing(c);
    setEditForm({ full_name: c.full_name || '', phone: c.phone || '', email: c.email || '', vehicle_number: c.vehicle_number || '', notes: c.notes || '' });
  };

  const handleSave = async () => {
    if (!editing) return;
    setSavingEdit(true);
    const { error } = await supabase.from('customers').update({
      full_name: editForm.full_name.trim(),
      phone: editForm.phone.trim() || null,
      email: editForm.email.trim() || null,
      vehicle_number: editForm.vehicle_number.trim() || null,
      notes: editForm.notes.trim() || null,
    }).eq('id', editing.id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Customer updated!' }); setEditing(null); fetchCustomers(); }
    setSavingEdit(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Customer removed' }); fetchCustomers(); }
  };

  const topCustomers = [...customers].sort((a, b) => Number(b.total_spent || 0) - Number(a.total_spent || 0)).slice(0, 3);

  return (
    <div className="px-4 pt-4 lg:pl-24 max-w-3xl mx-auto space-y-4 pb-24">
      <PageHeader title="Customers" backTo="/dashboard" actions={
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">{customers.length} total</span>
      } />

      {/* Top Customers */}
      {topCustomers.length > 0 && !loading && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Top Customers</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
            {topCustomers.map((c, i) => (
              <div key={c.id} className="min-w-[140px] rounded-2xl glass-card shadow-soft p-3 space-y-1">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-warning/10 text-warning">#{i + 1}</span>
                </div>
                <p className="text-sm font-semibold text-foreground truncate">{c.full_name || 'Walk-in'}</p>
                <p className="text-xs text-primary font-bold">₹{Number(c.total_spent || 0).toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">{c.visit_count || 0} visits</p>
              </div>
            ))}
          </div>
        </div>
      )}

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
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{c.full_name || 'Walk-in Customer'}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {c.phone && <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>}
                    {c.email && <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>}
                    {c.vehicle_number && <span className="text-xs text-muted-foreground flex items-center gap-1"><Car className="w-3 h-3" />{c.vehicle_number}</span>}
                  </div>
                  {c.notes && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MessageSquare className="w-3 h-3" />{c.notes}</p>}
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className="text-sm font-bold text-foreground">₹{Number(c.total_spent || 0).toFixed(0)}</p>
                  <p className="text-[10px] text-muted-foreground">{c.visit_count || 0} visits</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                {c.last_visit_at && (
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Last visit: {dayjs(c.last_visit_at).format('DD MMM YYYY')}
                  </p>
                )}
                <div className="flex items-center gap-1.5">
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-muted"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={open => !open && setEditing(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle className="font-display">Edit Customer</DialogTitle><DialogDescription>Update customer details</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name</label>
              <input type="text" value={editForm.full_name} onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
                <input type="tel" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Vehicle #</label>
                <input type="text" value={editForm.vehicle_number} onChange={e => setEditForm(f => ({ ...f, vehicle_number: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
            </div>
            <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
              <input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
            <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
              <textarea value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" /></div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={savingEdit}
              className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
              {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerManagement;
