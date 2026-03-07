import { motion } from 'framer-motion';
import { Search, Plus, Barcode, Loader2, Pencil, Trash2, Package, ScanLine, Share2, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import ProductFormDialog from '@/components/products/ProductFormDialog';
import ProductEditDialog from '@/components/products/ProductEditDialog';
import BarcodeLabel from '@/components/products/BarcodeLabel';
import GalleryPickerDialog from '@/components/products/GalleryPickerDialog';
import BarcodeScanner from '@/components/billing/BarcodeScanner';
import PageHeader from '@/components/layout/PageHeader';
import { useBusiness } from '@/hooks/useBusiness';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/store/useAppStore';
import { useToast } from '@/hooks/use-toast';
import { getCategoryConfig } from '@/lib/categoryConfig';

const Workspace = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [selectedBarcode, setSelectedBarcode] = useState<any>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const { business } = useBusiness();
  const { toast } = useToast();

  const categoryConfig = business ? getCategoryConfig(business.category) : null;

  const fetchProducts = async () => {
    if (!business) return;
    const { data, error } = await supabase.from('products').select('*').eq('business_id', business.id).order('created_at', { ascending: false });
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    if (data) {
      setProducts(data.map((p: any) => ({
        id: p.id, name: p.name, description: p.description || '', category: p.category,
        sku: p.sku, barcode: p.barcode_value || '', price: Number(p.price),
        discountPrice: Number(p.discount_price), taxPercent: Number(p.tax_percent),
        stock: p.stock, imageUrl: p.image_url || '', brandName: p.brand_name || '',
      })));
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Deleted' }); setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleBarcodeScan = (code: string) => {
    const existing = products.find(p => p.barcode === code);
    if (existing) {
      toast({ title: 'Product found', description: `${existing.name} has this barcode.` });
      setEditProduct(existing);
    } else {
      toast({ title: 'New barcode scanned', description: `Barcode: ${code}. Fill product details.` });
      setShowScanner(false);
      setScannedBarcode(code);
      setShowForm(true);
    }
  };

  const handleShareStore = () => {
    if (!business?.store_slug) { toast({ title: 'No store link', description: 'Set up your store link in Settings.', variant: 'destructive' }); return; }
    const url = `${window.location.origin}/store/${business.store_slug}`;
    if (navigator.share) navigator.share({ title: business.business_name, url });
    else { navigator.clipboard.writeText(url); toast({ title: 'Link copied!' }); }
  };

  useEffect(() => { void fetchProducts(); }, [business?.id]);

  const allCategories = ['All', ...new Set(products.map(p => p.category))];
  const filteredProducts = products.filter(p => {
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
      <PageHeader title={categoryConfig?.navLabel.workspace || 'Workspace'} backTo="/dashboard" actions={
        <div className="flex items-center gap-1.5 flex-wrap">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowScanner(true)}
            className="px-2.5 py-1.5 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold flex items-center gap-1">
            <ScanLine className="w-3.5 h-3.5" /> Scan
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowGallery(true)}
            className="px-2.5 py-1.5 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold flex items-center gap-1">
            <Download className="w-3.5 h-3.5" /> Gallery
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setScannedBarcode(null); setShowForm(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl gradient-primary text-primary-foreground text-xs font-semibold shadow-soft">
            <Plus className="w-3.5 h-3.5" /> Add
          </motion.button>
        </div>
      } />

      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Search by name, SKU, or barcode..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </motion.div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
        {allCategories.map(cat => (
          <motion.button key={cat} whileTap={{ scale: 0.95 }} onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${activeCategory === cat ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
            {cat}
          </motion.button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{products.length} items</span><span>•</span><span>{products.filter(p => p.stock < 20).length} low stock</span>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleShareStore}
          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 bg-secondary text-secondary-foreground">
          <Share2 className="w-3.5 h-3.5" /> Share
        </motion.button>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredProducts.map(product => {
          const imgSrc = getImageSrc(product.imageUrl);
          const hasDiscount = product.discountPrice < product.price;
          return (
            <motion.div key={product.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl glass-card shadow-soft overflow-hidden group">
              <div className="aspect-[2.5/1] bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center relative overflow-hidden">
                {imgSrc ? <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" /> : <Package className="w-8 h-8 text-muted-foreground/30" />}
                {hasDiscount && <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground">{Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF</span>}
                {product.stock < 20 && <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-warning text-warning-foreground">Low Stock</span>}
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category} • {product.sku}</p>
                    {(product as any).brandName && <p className="text-[10px] text-muted-foreground">{(product as any).brandName}</p>}
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
            <Package className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">{products.length === 0 ? 'No items yet. Add a product or pick from Gallery.' : 'No matching items'}</p>
          </div>
        )}
      </div>

      <ProductFormDialog open={showForm} onClose={() => { setShowForm(false); setScannedBarcode(null); }} onCreated={fetchProducts} businessId={business?.id} businessName={business?.business_name} initialBarcode={scannedBarcode} />
      <GalleryPickerDialog open={showGallery} onClose={() => setShowGallery(false)} businessId={business?.id} onAdded={fetchProducts} />
      {editProduct && <ProductEditDialog open={!!editProduct} onClose={() => setEditProduct(null)} product={editProduct} onUpdated={fetchProducts} />}
      {selectedBarcode && <BarcodeLabel open={!!selectedBarcode} onClose={() => setSelectedBarcode(null)} productName={selectedBarcode.name} barcode={selectedBarcode.barcode} price={selectedBarcode.discountPrice} sku={selectedBarcode.sku} businessName={business?.business_name} />}
      <BarcodeScanner open={showScanner} onClose={() => setShowScanner(false)} onScan={handleBarcodeScan} />
    </div>
  );
};

export default Workspace;
