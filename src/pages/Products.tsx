import { motion } from 'framer-motion';
import { Search, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { mockProducts, categories } from '@/data/mockData';
import ProductCard from '@/components/products/ProductCard';
import ProductFormDialog from '@/components/products/ProductFormDialog';
import PageHeader from '@/components/layout/PageHeader';
import { useBusiness } from '@/hooks/useBusiness';
import { supabase } from '@/integrations/supabase/client';

const Products = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const { business } = useBusiness();
  const [dbProducts, setDbProducts] = useState<any[]>([]);

  const fetchProducts = async () => {
    if (!business) return;
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false });
    if (data) setDbProducts(data);
  };

  useEffect(() => { fetchProducts(); }, [business]);

  // Use DB products if available, fall back to mock
  const products = dbProducts.length > 0
    ? dbProducts.map((p: any) => ({
        id: p.id, name: p.name, description: p.description, category: p.category,
        sku: p.sku, barcode: p.barcode_value, price: Number(p.price),
        discountPrice: Number(p.discount_price), taxPercent: Number(p.tax_percent),
        stock: p.stock, imageUrl: p.image_url || '',
      }))
    : mockProducts;

  const allCategories = ['All', ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="px-4 pt-4 lg:pl-24 max-w-5xl mx-auto space-y-4">
      <PageHeader
        title="Products"
        actions={
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-soft"
          >
            <Plus className="w-5 h-5 text-primary-foreground" />
          </motion.button>
        }
      />

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
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

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pb-4">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <p className="text-sm text-muted-foreground">No products found</p>
          </div>
        )}
      </div>

      <ProductFormDialog
        open={showForm}
        onClose={() => setShowForm(false)}
        onCreated={fetchProducts}
        businessId={business?.id}
      />
    </div>
  );
};

export default Products;
