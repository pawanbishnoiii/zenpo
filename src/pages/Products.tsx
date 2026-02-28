import { motion } from 'framer-motion';
import { Search, Plus, Barcode } from 'lucide-react';
import { useState, useEffect } from 'react';
import ProductCard from '@/components/products/ProductCard';
import ProductFormDialog from '@/components/products/ProductFormDialog';
import BarcodeLabel from '@/components/products/BarcodeLabel';
import PageHeader from '@/components/layout/PageHeader';
import { useBusiness } from '@/hooks/useBusiness';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/store/useAppStore';

const Products = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [selectedBarcode, setSelectedBarcode] = useState<any>(null);
  const { business } = useBusiness();
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    if (!business) return;
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false });
    if (data) {
      setProducts(data.map((p: any) => ({
        id: p.id, name: p.name, description: p.description || '', category: p.category,
        sku: p.sku, barcode: p.barcode_value || '', price: Number(p.price),
        discountPrice: Number(p.discount_price), taxPercent: Number(p.tax_percent),
        stock: p.stock, imageUrl: p.image_url || '',
      })));
    }
  };

  useEffect(() => { fetchProducts(); }, [business]);

  const allCategories = ['All', ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="px-4 pt-4 lg:pl-24 max-w-5xl mx-auto space-y-4 pb-24">
      <PageHeader
        title="Management"
        actions={
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-xs font-semibold shadow-soft"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </motion.button>
        }
      />

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text" placeholder="Search by name, SKU, or barcode..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </motion.div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
        {allCategories.map((cat) => (
          <motion.button
            key={cat} whileTap={{ scale: 0.95 }} onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeCategory === cat ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {cat}
          </motion.button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>{products.length} products</span>
        <span>•</span>
        <span>{products.filter(p => p.stock < 20).length} low stock</span>
      </div>

      {/* Grid */}
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
              {products.length === 0 ? 'No products yet. Click "Add Product" to get started!' : 'No matching products found'}
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
