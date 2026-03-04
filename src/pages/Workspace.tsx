import { motion } from 'framer-motion';
import { Search, Plus, Barcode, Database, Loader2, SlidersHorizontal, Pencil, Trash2, Download, Package, Image } from 'lucide-react';
import { useState, useEffect } from 'react';
import ProductFormDialog from '@/components/products/ProductFormDialog';
import ProductEditDialog from '@/components/products/ProductEditDialog';
import BarcodeLabel from '@/components/products/BarcodeLabel';
import GalleryPickerDialog from '@/components/products/GalleryPickerDialog';
import PageHeader from '@/components/layout/PageHeader';
import { useBusiness } from '@/hooks/useBusiness';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/store/useAppStore';
import { useToast } from '@/hooks/use-toast';

const Workspace = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedBarcode, setSelectedBarcode] = useState<any>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const { business } = useBusiness();
  const { toast } = useToast();

  const fetchProducts = async () => {
    if (!business) return;
    const { data, error } = await supabase
      .from('products').select('*').eq('business_id', business.id).order('created_at', { ascending: false });
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    if (data) {
      setProducts(data.map((p: any) => ({
        id: p.id, name: p.name, description: p.description || '', category: p.category,
        sku: p.sku, barcode: p.barcode_value || '', price: Number(p.price),
        discountPrice: Number(p.discount_price), taxPercent: Number(p.tax_percent),
        stock: p.stock, imageUrl: p.image_url || '',
      })));
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Deleted' });
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleSeedCatalog = async () => {
    if (!business?.id) return;
    setSeeding(true);
    const { data, error } = await supabase.rpc('seed_business_starter_catalog', { _business_id: business.id });
    if (error) toast({ title: 'Seed failed', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Starter items added', description: `${Number(data || 0)} new items inserted.` }); await fetchProducts(); }
    setSeeding(false);
  };

  useEffect(() => { void fetchProducts(); }, [business?.id]);

  const allCategories = ['All', ...new Set(products.map((p) => p.category))];
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getImageSrc = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return supabase.storage.from('product-images').getPublicUrl(url).data.publicUrl;
  };

  return (
    <div className="px-4 pt-4 lg:pl-24 max-w-5xl mx-auto space-y-4 pb-24">
      <PageHeader title="Workspace" backTo="/dashboard" actions={
        <div className="flex items-center gap-2">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setAdvancedMode(v => !v)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${advancedMode ? 'bg-accent/10 text-accent' : 'bg-secondary text-secondary-foreground'}`}>
            <SlidersHorizontal className="w-3.5 h-3.5" /> Advanced
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowGallery(true)}
            className="px-3 py-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Gallery
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-xs font-semibold shadow-soft">
            <Plus className="w-4 h-4" /> Add
          </motion.button>
        </div>
      } />

      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Search by name, SKU, or barcode..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </motion.div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
        {allCategories.map((cat) => (
          <motion.button key={cat} whileTap={{ scale: 0.95 }} onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${activeCategory === cat ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
            {cat}
          </motion.button>
        ))}
      </div>

      {advancedMode && (
        <div className="rounded-2xl glass-card p-3 border border-border/60 flex items-center justify-between gap-2">
          <div><p className="text-sm font-semibold text-foreground">Starter Catalog</p><p className="text-xs text-muted-foreground">Pre-built items auto add</p></div>
          <button onClick={() => void handleSeedCatalog()} disabled={seeding}
            className="px-3 py-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50">
            {seeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />} Seed
          </button>
        </div>
      )}

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>{products.length} items</span><span>•</span><span>{products.filter(p => p.stock < 20).length} low stock</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredProducts.map((product) => {
          const imgSrc = getImageSrc(product.imageUrl);
          const hasDiscount = product.discountPrice < product.price;
          return (
            <motion.div key={product.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl glass-card shadow-soft overflow-hidden group">
              <div className="aspect-[2/1] bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center relative overflow-hidden">
                {imgSrc ? <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" /> : <Package className="w-8 h-8 text-muted-foreground/30" />}
                {hasDiscount && <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground">{Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF</span>}
                {product.stock < 20 && <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-warning text-warning-foreground">Low Stock</span>}
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category} • SKU: {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">₹{product.discountPrice}</p>
                    {hasDiscount && <p className="text-xs text-muted-foreground line-through">₹{product.price}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <motion.button whileTap={{ scale: 0.85 }} onClick={() => setEditProduct(product)}
                    className="flex-1 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold flex items-center justify-center gap-1"><Pencil className="w-3 h-3" /> Edit</motion.button>
                  <motion.button whileTap={{ scale: 0.85 }} onClick={() => setSelectedBarcode(product)}
                    className="py-1.5 px-2.5 rounded-lg bg-secondary text-secondary-foreground"><Barcode className="w-3.5 h-3.5" /></motion.button>
                  <motion.button whileTap={{ scale: 0.85 }} onClick={() => handleDelete(product.id)}
                    className="py-1.5 px-2.5 rounded-lg bg-destructive/10 text-destructive"><Trash2 className="w-3.5 h-3.5" /></motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <p className="text-sm text-muted-foreground">{products.length === 0 ? 'No items yet. Add product or pick from Gallery.' : 'No matching items found'}</p>
          </div>
        )}
      </div>

      <ProductFormDialog open={showForm} onClose={() => setShowForm(false)} onCreated={fetchProducts} businessId={business?.id} businessName={business?.business_name} />
      <GalleryPickerDialog open={showGallery} onClose={() => setShowGallery(false)} businessId={business?.id} onAdded={fetchProducts} />
      {editProduct && <ProductEditDialog open={!!editProduct} onClose={() => setEditProduct(null)} product={editProduct} onUpdated={fetchProducts} />}
      {selectedBarcode && <BarcodeLabel open={!!selectedBarcode} onClose={() => setSelectedBarcode(null)} productName={selectedBarcode.name} barcode={selectedBarcode.barcode} price={selectedBarcode.discountPrice} sku={selectedBarcode.sku} businessName={business?.business_name} />}
    </div>
  );
};

export default Workspace;
