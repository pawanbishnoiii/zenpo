// AdminPlans — manage subscription_plans visible on landing page.
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Plus, Save, Trash2, Star, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const empty = { name: '', slug: '', tagline: '', monthly_price: 0, yearly_price: 0, badge: '', features: [] as string[], cta_label: 'Get Started', is_popular: false, is_active: true, sort_order: 0 };

const AdminPlans = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [featInput, setFeatInput] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('subscription_plans').select('*').order('sort_order');
    setPlans(data || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const payload = { ...editing, monthly_price: Number(editing.monthly_price) || 0, yearly_price: Number(editing.yearly_price) || 0 };
    const { error } = editing.id
      ? await supabase.from('subscription_plans').update(payload).eq('id', editing.id)
      : await supabase.from('subscription_plans').insert(payload);
    setSaving(false);
    if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
    toast({ title: 'Saved' }); setEditing(null); load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete plan?')) return;
    await supabase.from('subscription_plans').delete().eq('id', id);
    load();
  };

  const togglePopular = async (p: any) => {
    await supabase.from('subscription_plans').update({ is_popular: !p.is_popular }).eq('id', p.id); load();
  };
  const toggleActive = async (p: any) => {
    await supabase.from('subscription_plans').update({ is_active: !p.is_active }).eq('id', p.id); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Subscription Plans · Landing Page</h3>
        <button onClick={() => setEditing({ ...empty })} className="flex items-center gap-1.5 px-3 py-2 rounded-xl gradient-primary text-primary-foreground text-xs font-bold">
          <Plus className="w-3.5 h-3.5" /> Add Plan
        </button>
      </div>

      {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto my-8 text-primary" /> : (
        <div className="grid md:grid-cols-3 gap-3">
          {plans.map(p => (
            <motion.div key={p.id} layout className={`rounded-2xl glass-card p-4 border ${p.is_popular ? 'border-primary' : 'border-border'}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-foreground">{p.name}</h4>
                  <p className="text-[11px] text-muted-foreground">{p.tagline}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => togglePopular(p)} title="Popular"><Star className={`w-4 h-4 ${p.is_popular ? 'text-primary fill-primary' : 'text-muted-foreground'}`} /></button>
                  <button onClick={() => toggleActive(p)} title="Active">{p.is_active ? <ToggleRight className="w-5 h-5 text-success" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}</button>
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">₹{p.monthly_price}<span className="text-xs text-muted-foreground">/mo</span></p>
              <p className="text-[11px] text-muted-foreground mb-3">₹{p.yearly_price}/yr · {p.features?.length || 0} features</p>
              <div className="flex gap-2">
                <button onClick={() => setEditing({ ...p })} className="flex-1 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold">Edit</button>
                <button onClick={() => remove(p.id)} className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {editing && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-3" onClick={() => setEditing(null)}>
          <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="bg-card rounded-2xl p-5 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">{editing.id ? 'Edit Plan' : 'New Plan'}</h3>
            <div className="grid grid-cols-2 gap-2">
              <input className="rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Name" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
              <input className="rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Slug" value={editing.slug} onChange={e => setEditing({ ...editing, slug: e.target.value })} />
              <input className="rounded-lg border border-border bg-background px-3 py-2 text-sm col-span-2" placeholder="Tagline" value={editing.tagline || ''} onChange={e => setEditing({ ...editing, tagline: e.target.value })} />
              <input type="number" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Monthly ₹" value={editing.monthly_price} onChange={e => setEditing({ ...editing, monthly_price: e.target.value })} />
              <input type="number" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Yearly ₹" value={editing.yearly_price} onChange={e => setEditing({ ...editing, yearly_price: e.target.value })} />
              <input className="rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Badge" value={editing.badge || ''} onChange={e => setEditing({ ...editing, badge: e.target.value })} />
              <input className="rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="CTA label" value={editing.cta_label || ''} onChange={e => setEditing({ ...editing, cta_label: e.target.value })} />
              <input type="number" className="rounded-lg border border-border bg-background px-3 py-2 text-sm col-span-2" placeholder="Sort order" value={editing.sort_order || 0} onChange={e => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
            </div>

            <div className="mt-3">
              <label className="text-xs font-semibold text-muted-foreground">Features</label>
              <div className="flex gap-2 mt-1">
                <input className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Add feature" value={featInput} onChange={e => setFeatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (setEditing({ ...editing, features: [...(editing.features || []), featInput] }), setFeatInput(''))} />
                <button onClick={() => { setEditing({ ...editing, features: [...(editing.features || []), featInput] }); setFeatInput(''); }} className="px-3 rounded-lg bg-primary text-primary-foreground text-xs font-bold">Add</button>
              </div>
              <div className="space-y-1 mt-2 max-h-40 overflow-auto">
                {(editing.features || []).map((f: string, i: number) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-muted px-2 py-1 text-xs">
                    <span>{f}</span>
                    <button onClick={() => setEditing({ ...editing, features: editing.features.filter((_: any, j: number) => j !== i) })}><Trash2 className="w-3 h-3 text-destructive" /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-3">
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={editing.is_popular} onChange={e => setEditing({ ...editing, is_popular: e.target.checked })} /> Popular</label>
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={editing.is_active} onChange={e => setEditing({ ...editing, is_active: e.target.checked })} /> Active</label>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={() => setEditing(null)} className="flex-1 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-bold">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminPlans;
