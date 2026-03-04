import { motion } from 'framer-motion';
import { Users, Store, Package, Receipt, Shield, TrendingUp, Settings, Plus, Loader2, Image, Trash2 } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const generateSKU = () => `GAL-${Date.now().toString(36).toUpperCase()}`;

const AdminDashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState({ users: 0, businesses: 0, products: 0, invoices: 0 });
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', category: 'General', price: '', discount_price: '', tax_percent: '18', sku: generateSKU() });

  useEffect(() => {
    const fetchStats = async () => {
      const [users, businesses, products, invoices] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('businesses').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('invoices').select('id', { count: 'exact', head: true }),
      ]);
      setStats({ users: users.count || 0, businesses: businesses.count || 0, products: products.count || 0, invoices: invoices.count || 0 });
    };
    fetchStats();
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    const { data } = await supabase.from('gallery_products').select('*').order('created_at', { ascending: false });
    setGalleryItems(data || []);
  };

  const handleAddGallery = async () => {
    setSaving(true);
    const { error } = await supabase.from('gallery_products').insert({
      name: form.name, description: form.description, category: form.category,
      price: parseFloat(form.price) || 0, discount_price: parseFloat(form.discount_price) || parseFloat(form.price) || 0,
      tax_percent: parseFloat(form.tax_percent) || 18, sku: form.sku,
    });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Added to gallery!' }); setShowGalleryForm(false); setForm({ name: '', description: '', category: 'General', price: '', discount_price: '', tax_percent: '18', sku: generateSKU() }); fetchGallery(); }
    setSaving(false);
  };

  const deleteGalleryItem = async (id: string) => {
    await supabase.from('gallery_products').delete().eq('id', id);
    toast({ title: 'Removed from gallery' });
    fetchGallery();
  };

  const cards = [
    { title: 'Total Users', value: stats.users, icon: Users, color: 'text-primary' },
    { title: 'Businesses', value: stats.businesses, icon: Store, color: 'text-accent' },
    { title: 'Products', value: stats.products, icon: Package, color: 'text-success' },
    { title: 'Invoices', value: stats.invoices, icon: Receipt, color: 'text-warning' },
  ];

  return (
    <div className="px-4 pt-4 lg:pl-24 max-w-5xl mx-auto space-y-6 pb-24">
      <PageHeader title="Admin Panel" actions={
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/10">
          <Shield className="w-3.5 h-3.5 text-destructive" /><span className="text-xs font-bold text-destructive">Admin</span>
        </div>
      } />

      <div className="grid grid-cols-2 gap-3">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-2xl glass-card shadow-soft p-4">
              <div className="flex items-center gap-2 mb-2"><Icon className={`w-4 h-4 ${card.color}`} /><span className="text-xs text-muted-foreground font-medium">{card.title}</span></div>
              <p className="text-2xl font-bold font-display text-foreground">{card.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Product Gallery Management */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Product Gallery ({galleryItems.length})</p>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowGalleryForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl gradient-primary text-primary-foreground text-xs font-semibold">
            <Plus className="w-3.5 h-3.5" /> Add to Gallery
          </motion.button>
        </div>
        <div className="rounded-2xl glass-card shadow-soft overflow-hidden divide-y divide-border">
          {galleryItems.length === 0 ? (
            <div className="p-6 text-center"><Image className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" /><p className="text-sm text-muted-foreground">No gallery items. Add products for users to quick-add.</p></div>
          ) : galleryItems.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Package className="w-5 h-5 text-primary" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.category} • ₹{item.discount_price || item.price}</p>
              </div>
              <button onClick={() => deleteGalleryItem(item.id)} className="p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 className="w-4 h-4 text-destructive" /></button>
            </div>
          ))}
        </div>
      </motion.div>

      <Dialog open={showGalleryForm} onOpenChange={setShowGalleryForm}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle className="font-display">Add Gallery Product</DialogTitle><DialogDescription>Users can add these to their workspace</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <input type="text" placeholder="Product Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input type="text" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <div className="grid grid-cols-2 gap-3">
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                {['General', 'Car Wash', 'Spare Parts', 'Services', 'Accessories', 'Labour', 'Modification'].map(c => <option key={c}>{c}</option>)}
              </select>
              <input type="number" placeholder="Tax %" value={form.tax_percent} onChange={e => setForm(f => ({ ...f, tax_percent: e.target.value }))}
                className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" placeholder="Price ₹" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <input type="number" placeholder="Discount ₹" value={form.discount_price} onChange={e => setForm(f => ({ ...f, discount_price: e.target.value }))}
                className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleAddGallery} disabled={saving || !form.name.trim()}
              className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Add to Gallery
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
