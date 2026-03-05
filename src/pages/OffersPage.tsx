import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Tag, Trash2, Loader2, ToggleLeft, ToggleRight, Copy, Pencil } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { useBusiness } from '@/hooks/useBusiness';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const OffersPage = () => {
  const { business } = useBusiness();
  const { toast } = useToast();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', discount_percent: '10', coupon_code: '' });

  const fetchOffers = async () => {
    if (!business) return;
    setLoading(true);
    const { data } = await supabase.from('business_offers').select('*').eq('business_id', business.id).order('created_at', { ascending: false });
    setOffers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchOffers(); }, [business?.id]);

  const handleSave = async () => {
    if (!business || !form.title.trim()) return;
    setSaving(true);
    const payload = {
      business_id: business.id, title: form.title.trim(), description: form.description.trim() || null,
      discount_percent: parseFloat(form.discount_percent) || 0, coupon_code: form.coupon_code.trim().toUpperCase() || null,
    };
    let error;
    if (editingOffer) {
      ({ error } = await supabase.from('business_offers').update(payload).eq('id', editingOffer.id));
    } else {
      ({ error } = await supabase.from('business_offers').insert(payload));
    }
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: editingOffer ? 'Updated!' : 'Offer created!' }); resetForm(); fetchOffers(); }
    setSaving(false);
  };

  const resetForm = () => {
    setShowForm(false); setEditingOffer(null);
    setForm({ title: '', description: '', discount_percent: '10', coupon_code: '' });
  };

  const openEdit = (offer: any) => {
    setEditingOffer(offer);
    setForm({ title: offer.title, description: offer.description || '', discount_percent: String(offer.discount_percent), coupon_code: offer.coupon_code || '' });
    setShowForm(true);
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('business_offers').update({ is_active: !current }).eq('id', id);
    fetchOffers();
  };

  const deleteOffer = async (id: string) => {
    await supabase.from('business_offers').delete().eq('id', id);
    toast({ title: 'Deleted' }); fetchOffers();
  };

  const generateCoupon = () => {
    const code = `ZEN${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setForm(f => ({ ...f, coupon_code: code }));
  };

  return (
    <div className="px-4 pt-4 lg:pl-24 max-w-3xl mx-auto space-y-4 pb-24">
      <PageHeader title="Offers & Coupons" backTo="/settings" actions={
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-xs font-semibold">
          <Plus className="w-4 h-4" /> New Offer
        </motion.button>
      } />

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl glass-card shadow-soft p-4 space-y-3 border border-primary/20">
          <input type="text" placeholder="Offer Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <input type="text" placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Discount %</label>
              <input type="number" value={form.discount_percent} onChange={e => setForm(f => ({ ...f, discount_percent: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Coupon Code</label>
              <div className="flex gap-1">
                <input type="text" placeholder="e.g. SAVE20" value={form.coupon_code} onChange={e => setForm(f => ({ ...f, coupon_code: e.target.value.toUpperCase() }))}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <button onClick={generateCoupon} className="px-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-medium">Auto</button>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={resetForm} className="flex-1 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold">Cancel</button>
            <motion.button whileTap={{ scale: 0.95 }} disabled={saving || !form.title.trim()} onClick={handleSave}
              className="flex-[2] py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-1">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} {editingOffer ? 'Update' : 'Create'}
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">{offer.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${offer.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                      {offer.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {offer.description && <p className="text-xs text-muted-foreground mt-0.5">{offer.description}</p>}
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-primary font-bold">{offer.discount_percent}% OFF</p>
                    {offer.coupon_code && (
                      <button onClick={() => { navigator.clipboard.writeText(offer.coupon_code); toast({ title: 'Coupon copied!' }); }}
                        className="flex items-center gap-1 text-xs font-mono bg-primary/5 text-primary px-2 py-0.5 rounded-md">
                        <Copy className="w-3 h-3" /> {offer.coupon_code}
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(offer)} className="p-1.5 rounded-lg hover:bg-muted"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                  <button onClick={() => toggleActive(offer.id, offer.is_active)} className="p-1.5 rounded-lg hover:bg-muted">
                    {offer.is_active ? <ToggleRight className="w-5 h-5 text-success" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                  </button>
                  <button onClick={() => deleteOffer(offer.id)} className="p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 className="w-4 h-4 text-destructive" /></button>
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
