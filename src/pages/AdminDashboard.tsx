import { motion } from 'framer-motion';
import { Users, Store, Package, Receipt, Shield, Plus, Loader2, Trash2, ImagePlus, Pencil, Tag, BarChart3, Settings, ArrowLeft, Globe, Database } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { BUSINESS_CATEGORIES } from '@/lib/categories';

const generateSKU = () => `GAL-${Date.now().toString(36).toUpperCase()}`;

type AdminTab = 'overview' | 'gallery' | 'users' | 'businesses' | 'offers';

const AdminDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState({ users: 0, businesses: 0, products: 0, invoices: 0, customers: 0, offers: 0 });
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [allBusinesses, setAllBusinesses] = useState<any[]>([]);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [galleryCategory, setGalleryCategory] = useState('All');
  const [form, setForm] = useState({ name: '', description: '', category: 'General', brand_name: '', price: '', discount_price: '', tax_percent: '18', sku: generateSKU() });

  useEffect(() => {
    const fetchAll = async () => {
      const [users, businesses, products, invoices, customers, offers] = await Promise.all([
        supabase.from('profiles').select('id, name, phone, created_at').order('created_at', { ascending: false }),
        supabase.from('businesses').select('id, business_name, category, owner_id, created_at, store_slug').order('created_at', { ascending: false }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('invoices').select('id', { count: 'exact', head: true }),
        supabase.from('customers').select('id', { count: 'exact', head: true }),
        supabase.from('business_offers').select('id', { count: 'exact', head: true }),
      ]);
      setStats({
        users: users.data?.length || 0, businesses: businesses.data?.length || 0,
        products: products.count || 0, invoices: invoices.count || 0,
        customers: customers.count || 0, offers: offers.count || 0,
      });
      setAllProfiles(users.data || []);
      setAllBusinesses(businesses.data || []);
    };
    fetchAll();
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    const { data } = await supabase.from('gallery_products').select('*').order('created_at', { ascending: false });
    setGalleryItems(data || []);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast({ title: 'Too large', description: 'Max 5MB', variant: 'destructive' }); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return '';
    const ext = imageFile.name.split('.').pop();
    const path = `gallery/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(path, imageFile, { cacheControl: '3600', upsert: false });
    if (error) { toast({ title: 'Upload failed', description: error.message, variant: 'destructive' }); return ''; }
    return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
  };

  const handleSaveGallery = async () => {
    setSaving(true);
    let imageUrl = editingItem?.image_url || '';
    if (imageFile) imageUrl = await uploadImage();
    const payload = {
      name: form.name, description: form.description, category: form.category, brand_name: form.brand_name,
      price: parseFloat(form.price) || 0, discount_price: parseFloat(form.discount_price) || parseFloat(form.price) || 0,
      tax_percent: parseFloat(form.tax_percent) || 18, sku: form.sku, image_url: imageUrl,
    };
    let error;
    if (editingItem) ({ error } = await supabase.from('gallery_products').update(payload).eq('id', editingItem.id));
    else ({ error } = await supabase.from('gallery_products').insert(payload));
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: editingItem ? 'Updated!' : 'Added!' }); closeForm(); fetchGallery(); }
    setSaving(false);
  };

  const closeForm = () => {
    setShowGalleryForm(false); setEditingItem(null);
    setForm({ name: '', description: '', category: 'General', brand_name: '', price: '', discount_price: '', tax_percent: '18', sku: generateSKU() });
    setImageFile(null); setImagePreview(null);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setForm({ name: item.name, description: item.description || '', category: item.category, brand_name: item.brand_name || '', price: String(item.price), discount_price: String(item.discount_price), tax_percent: String(item.tax_percent), sku: item.sku });
    setImagePreview(item.image_url || null); setImageFile(null); setShowGalleryForm(true);
  };

  const deleteGalleryItem = async (id: string) => {
    await supabase.from('gallery_products').delete().eq('id', id);
    toast({ title: 'Removed' }); fetchGallery();
  };

  const getImageSrc = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return supabase.storage.from('product-images').getPublicUrl(url).data.publicUrl;
  };

  const galleryCats = ['All', ...new Set(galleryItems.map(g => g.category))];
  const filteredGallery = galleryCategory === 'All' ? galleryItems : galleryItems.filter(g => g.category === galleryCategory);

  const allGalleryCategories = ['General', ...BUSINESS_CATEGORIES.flatMap(c => c.defaultCategories)];
  const uniqueGalleryCats = [...new Set(allGalleryCategories)];

  const statCards = [
    { title: 'Users', value: stats.users, icon: Users, color: 'text-primary' },
    { title: 'Businesses', value: stats.businesses, icon: Store, color: 'text-accent' },
    { title: 'Products', value: stats.products, icon: Package, color: 'text-success' },
    { title: 'Invoices', value: stats.invoices, icon: Receipt, color: 'text-warning' },
    { title: 'Customers', value: stats.customers, icon: Users, color: 'text-primary' },
    { title: 'Offers', value: stats.offers, icon: Tag, color: 'text-accent' },
  ];

  const tabs: { id: AdminTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'gallery', label: 'Gallery', icon: Package },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'businesses', label: 'Stores', icon: Store },
  ];

  return (
    <div className="px-4 pt-4 lg:pl-24 max-w-5xl mx-auto space-y-5 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/settings')} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </motion.button>
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">Platform management</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/10">
          <Shield className="w-3.5 h-3.5 text-destructive" /><span className="text-xs font-bold text-destructive">Admin</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${activeTab === tab.id ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div key={card.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="rounded-2xl glass-card shadow-soft p-4">
                  <div className="flex items-center gap-2 mb-2"><Icon className={`w-4 h-4 ${card.color}`} /><span className="text-xs text-muted-foreground font-medium">{card.title}</span></div>
                  <p className="text-2xl font-bold font-display text-foreground">{card.value}</p>
                </motion.div>
              );
            })}
          </div>
          <div className="rounded-2xl glass-card shadow-soft p-4 space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Recent Businesses</h3>
            {allBusinesses.slice(0, 5).map(b => (
              <div key={b.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div><p className="text-sm font-medium text-foreground">{b.business_name}</p><p className="text-xs text-muted-foreground">{b.category} {b.store_slug ? `• /store/${b.store_slug}` : ''}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gallery Tab */}
      {activeTab === 'gallery' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product Gallery ({galleryItems.length})</p>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => { closeForm(); setShowGalleryForm(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl gradient-primary text-primary-foreground text-xs font-semibold">
              <Plus className="w-3.5 h-3.5" /> Add Product
            </motion.button>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
            {galleryCats.map(cat => (
              <button key={cat} onClick={() => setGalleryCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${galleryCategory === cat ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredGallery.length === 0 ? (
              <div className="col-span-full p-8 text-center rounded-2xl glass-card"><Package className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" /><p className="text-sm text-muted-foreground">No products in gallery. Add products for store owners to quick-add.</p></div>
            ) : filteredGallery.map(item => {
              const imgSrc = getImageSrc(item.image_url || '');
              return (
                <div key={item.id} className="rounded-2xl glass-card shadow-soft overflow-hidden">
                  <div className="aspect-[3/1] bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
                    {imgSrc ? <img src={imgSrc} alt={item.name} className="w-full h-full object-cover" /> : <Package className="w-8 h-8 text-muted-foreground/30" />}
                  </div>
                  <div className="p-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category} {item.brand_name ? `• ${item.brand_name}` : ''} • ₹{item.discount_price || item.price}</p>
                    </div>
                    <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-muted"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                    <button onClick={() => deleteGalleryItem(item.id)} className="p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 className="w-4 h-4 text-destructive" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">All Users ({allProfiles.length})</p>
          {allProfiles.map(p => (
            <div key={p.id} className="rounded-2xl glass-card shadow-soft p-4 flex items-center justify-between">
              <div><p className="text-sm font-semibold text-foreground">{p.name || 'Unnamed'}</p><p className="text-xs text-muted-foreground">{p.phone || 'No phone'}</p></div>
              <p className="text-xs text-muted-foreground">{p.created_at ? new Date(p.created_at).toLocaleDateString() : ''}</p>
            </div>
          ))}
        </div>
      )}

      {/* Businesses Tab */}
      {activeTab === 'businesses' && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">All Businesses ({allBusinesses.length})</p>
          {allBusinesses.map(b => (
            <div key={b.id} className="rounded-2xl glass-card shadow-soft p-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-semibold text-foreground">{b.business_name}</p><p className="text-xs text-muted-foreground">{b.category} {b.store_slug ? `• /store/${b.store_slug}` : ''}</p></div>
                {b.store_slug && (
                  <button onClick={() => window.open(`/store/${b.store_slug}`, '_blank')} className="p-1.5 rounded-lg hover:bg-muted">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gallery Form Dialog */}
      <Dialog open={showGalleryForm} onOpenChange={open => { if (!open) closeForm(); }}>
        <DialogContent className="rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">{editingItem ? 'Edit Product' : 'Add Gallery Product'}</DialogTitle><DialogDescription>Products available for all store owners</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            {imagePreview ? (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-border">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive/90 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-destructive-foreground" /></button>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full h-24 rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors">
                <ImagePlus className="w-6 h-6" /><span className="text-xs">Upload image (max 5MB)</span>
              </button>
            )}
            <input type="text" placeholder="Product Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input type="text" placeholder="Brand Name" value={form.brand_name} onChange={e => setForm(f => ({ ...f, brand_name: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input type="text" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <div className="grid grid-cols-2 gap-3">
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                {uniqueGalleryCats.map(c => <option key={c}>{c}</option>)}
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
