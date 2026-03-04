import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Tag, Trash2, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { useBusiness } from '@/hooks/useBusiness';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import dayjs from 'dayjs';

const OffersPage = () => {
  const { business } = useBusiness();
  const { toast } = useToast();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', discount_percent: '10' });

  const fetchOffers = async () => {
    if (!business) return;
    setLoading(true);
    const { data } = await supabase.from('business_offers').select('*').eq('business_id', business.id).order('created_at', { ascending: false });
    setOffers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchOffers(); }, [business?.id]);

  const handleCreate = async () => {
    if (!business || !form.title.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('business_offers').insert({
      business_id: business.id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      discount_percent: parseFloat(form.discount_percent) || 0,
    });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Offer created!' }); setShowForm(false); setForm({ title: '', description: '', discount_percent: '10' }); fetchOffers(); }
    setSaving(false);
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('business_offers').update({ is_active: !current }).eq('id', id);
    fetchOffers();
  };

  const deleteOffer = async (id: string) => {
    await supabase.from('business_offers').delete().eq('id', id);
    toast({ title: 'Offer deleted' });
    fetchOffers();
  };

  return (
    <div className="px-4 pt-4 lg:pl-24 max-w-3xl mx-auto space-y-4 pb-24">
      <PageHeader title="Offers" backTo="/settings" actions={
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-xs font-semibold">
          <Plus className="w-4 h-4" /> New Offer
        </motion.button>
      } />

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl glass-card shadow-soft p-4 space-y-3 border border-primary/20">
          <input type="text" placeholder="Offer Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <input type="text" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Discount %</label>
              <input type="number" value={form.discount_percent} onChange={e => setForm(f => ({ ...f, discount_percent: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <motion.button whileTap={{ scale: 0.95 }} disabled={saving || !form.title.trim()} onClick={handleCreate}
              className="px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 flex items-center gap-1">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save
            </motion.button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : offers.length === 0 ? (
        <div className="text-center py-12"><Tag className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" /><p className="text-sm text-muted-foreground">No offers yet. Create your first discount!</p></div>
      ) : (
        <div className="space-y-2">
          {offers.map(offer => (
            <motion.div key={offer.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl glass-card shadow-soft p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{offer.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${offer.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                      {offer.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {offer.description && <p className="text-xs text-muted-foreground mt-0.5">{offer.description}</p>}
                  <p className="text-xs text-primary font-bold mt-1">{offer.discount_percent}% OFF</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => toggleActive(offer.id, offer.is_active)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                    {offer.is_active ? <ToggleRight className="w-5 h-5 text-success" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                  </button>
                  <button onClick={() => deleteOffer(offer.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OffersPage;
