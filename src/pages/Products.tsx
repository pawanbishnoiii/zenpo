import { motion } from 'framer-motion';
import { Search, Plus, Barcode, Database, Loader2, SlidersHorizontal } from 'lucide-react';
import { useState, useEffect } from 'react';
import ProductCard from '@/components/products/ProductCard';
import ProductFormDialog from '@/components/products/ProductFormDialog';
import BarcodeLabel from '@/components/products/BarcodeLabel';
import PageHeader from '@/components/layout/PageHeader';
import { useBusiness } from '@/hooks/useBusiness';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/store/useAppStore';
import { useToast } from '@/hooks/use-toast';

const Products = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [selectedBarcode, setSelectedBarcode] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const { business } = useBusiness();
  const { toast } = useToast();

  const fetchProducts = async () => {
    if (!business) return;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    if (data) {
      setProducts(
        data.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          category: p.category,
          sku: p.sku,
          barcode: p.barcode_value || '',
          price: Number(p.price),
          discountPrice: Number(p.discount_price),
          taxPercent: Number(p.tax_percent),
          stock: p.stock,
          imageUrl: p.image_url || '',
        }))
      );
    }
  };

  const handleSeedCatalog = async () => {
    if (!business?.id) return;
    setSeeding(true);

    const { data, error } = await supabase.rpc('seed_business_starter_catalog', { _business_id: business.id });
    if (error) {
      toast({ title: 'Seed failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Starter items added', description: `${Number(data || 0)} new items inserted.` });
      await fetchProducts();
    }

    setSeeding(false);
  };

  useEffect(() => {
    void fetchProducts();
  }, [business?.id]);

  const allCategories = ['All', ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="px-4 pt-4 lg:pl-24 max-w-5xl mx-auto space-y-4 pb-24">
      <PageHeader
        title="Management"
        backTo="/dashboard"
        actions={
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setAdvancedMode((v) => !v)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                advancedMode ? 'bg-accent/10 text-accent' : 'bg-secondary text-secondary-foreground'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> Advanced
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-xs font-semibold shadow-soft"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </motion.button>
          </div>
        }
      />

      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name, SKU, or barcode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </motion.div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
        {allCategories.map((cat) => (
          <motion.button
            key={cat}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeCategory === cat ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {cat}
          </motion.button>
        ))}
      </div>

      {advancedMode && (
        <div className="rounded-2xl glass-card p-3 border border-border/60 flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground">Starter Catalog</p>
            <p className="text-xs text-muted-foreground">Car wash / spare parts ke pre-built items auto add karein.</p>
          </div>
          <button
            onClick={() => void handleSeedCatalog()}
            disabled={seeding}
            className="px-3 py-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
          >
            {seeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />} Seed
          </button>
        </div>
      )}

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>{products.length} items</span>
        <span>•</span>
        <span>{products.filter((p) => p.stock < 20).length} low stock</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredProducts.map((product) => (
          <div key={product.id} className="relative group">
            <ProductCard product={product} />
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setSelectedBarcode(product)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-card/90 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-border"
            >
              <Barcode className="w-4 h-4 text-foreground" />
            </motion.button>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <p className="text-sm text-muted-foreground">
              {products.length === 0 ? 'No items yet. Add product/service to get started.' : 'No matching items found'}
            </p>
          </div>
        )}
      </div>

      <ProductFormDialog
        open={showForm}
        onClose={() => setShowForm(false)}
        onCreated={fetchProducts}
        businessId={business?.id}
        businessName={business?.business_name}
      />

      {selectedBarcode && (
        <BarcodeLabel
          open={!!selectedBarcode}
          onClose={() => setSelectedBarcode(null)}
          productName={selectedBarcode.name}
          barcode={selectedBarcode.barcode}
          price={selectedBarcode.discountPrice}
          sku={selectedBarcode.sku}
          businessName={business?.business_name}
        />
      )}
    </div>
  );
};

export default Products;
