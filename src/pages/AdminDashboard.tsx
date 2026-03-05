import { motion } from 'framer-motion';
import { Users, Store, Package, Receipt, Shield, Plus, Loader2, Trash2, ImagePlus, Pencil } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const generateSKU = () => `GAL-${Date.now().toString(36).toUpperCase()}`;

const AdminDashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState({ users: 0, businesses: 0, products: 0, invoices: 0 });
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast({ title: 'Too large', description: 'Image must be under 5MB', variant: 'destructive' }); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return '';
    try {
      const ext = imageFile.name.split('.').pop();
      const path = `gallery/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('product-images').upload(path, imageFile, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
      return '';
    }
  };

  const handleSaveGallery = async () => {
    setSaving(true);
    let imageUrl = editingItem?.image_url || '';
    if (imageFile) imageUrl = await uploadImage();

    const payload = {
      name: form.name, description: form.description, category: form.category,
      price: parseFloat(form.price) || 0, discount_price: parseFloat(form.discount_price) || parseFloat(form.price) || 0,
      tax_percent: parseFloat(form.tax_percent) || 18, sku: form.sku, image_url: imageUrl,
    };

    let error;
    if (editingItem) {
      ({ error } = await supabase.from('gallery_products').update(payload).eq('id', editingItem.id));
    } else {
      ({ error } = await supabase.from('gallery_products').insert(payload));
    }

    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else {
      toast({ title: editingItem ? 'Updated!' : 'Added to gallery!' });
      closeForm();
      fetchGallery();
    }
    setSaving(false);
  };

  const closeForm = () => {
    setShowGalleryForm(false);
    setEditingItem(null);
    setForm({ name: '', description: '', category: 'General', price: '', discount_price: '', tax_percent: '18', sku: generateSKU() });
    setImageFile(null);
    setImagePreview(null);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setForm({
      name: item.name, description: item.description || '', category: item.category,
      price: String(item.price), discount_price: String(item.discount_price), tax_percent: String(item.tax_percent), sku: item.sku,
    });
    setImagePreview(item.image_url || null);
    setImageFile(null);
    setShowGalleryForm(true);
  };

  const deleteGalleryItem = async (id: string) => {
    await supabase.from('gallery_products').delete().eq('id', id);
    toast({ title: 'Removed from gallery' });
    fetchGallery();
  };

  const getImageSrc = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return supabase.storage.from('product-images').getPublicUrl(url).data.publicUrl;
  };

  const cards = [
    { title: 'Total Users', value: stats.users, icon: Users, color: 'text-primary' },
    { title: 'Businesses', value: stats.businesses, icon: Store, color: 'text-accent' },
    { title: 'Products', value: stats.products, icon: Package, color: 'text-success' },
    { title: 'Invoices', value: stats.invoices, icon: Receipt, color: 'text-warning' },
  ];

  return (
    <div className="px-4 pt-4 lg:pl-24 max-w-5xl mx-auto space-y-6 pb-24">
      <PageHeader title="Admin Panel" backTo="/settings" actions={
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

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Product Gallery ({galleryItems.length})</p>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => { closeForm(); setShowGalleryForm(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl gradient-primary text-primary-foreground text-xs font-semibold">
            <Plus className="w-3.5 h-3.5" /> Add Product
          </motion.button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {galleryItems.length === 0 ? (
            <div className="col-span-full p-6 text-center rounded-2xl glass-card"><Package className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" /><p className="text-sm text-muted-foreground">No gallery products yet. Add products for owners to quick-add.</p></div>
          ) : galleryItems.map(item => {
            const imgSrc = getImageSrc(item.image_url || '');
            return (
              <div key={item.id} className="rounded-2xl glass-card shadow-soft overflow-hidden">
                <div className="aspect-[3/1] bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
                  {imgSrc ? <img src={imgSrc} alt={item.name} className="w-full h-full object-cover" /> : <Package className="w-8 h-8 text-muted-foreground/30" />}
                </div>
                <div className="p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.category} • ₹{item.discount_price || item.price}</p>
                  </div>
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-muted"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                  <button onClick={() => deleteGalleryItem(item.id)} className="p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 className="w-4 h-4 text-destructive" /></button>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <Dialog open={showGalleryForm} onOpenChange={open => { if (!open) closeForm(); }}>
        <DialogContent className="rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">{editingItem ? 'Edit Gallery Product' : 'Add Gallery Product'}</DialogTitle><DialogDescription>These products are available for all business owners to add</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            {imagePreview ? (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-border">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive/90 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-destructive-foreground" /></button>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full h-24 rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors">
                <ImagePlus className="w-6 h-6" /><span className="text-xs">Upload product image (max 5MB)</span>
              </button>
            )}
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
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleSaveGallery} disabled={saving || !form.name.trim()}
              className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} {editingItem ? 'Save Changes' : 'Add to Gallery'}
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
