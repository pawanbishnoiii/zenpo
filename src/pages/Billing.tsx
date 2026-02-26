import { motion } from 'framer-motion';
import { Search, ScanLine, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { mockProducts, categories } from '@/data/mockData';
import ProductCard from '@/components/products/ProductCard';
import CartPanel from '@/components/billing/CartPanel';
import { useAppStore } from '@/store/useAppStore';
import { useNavigate } from 'react-router-dom';

const Billing = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showCart, setShowCart] = useState(false);
  const { addToCart, cart } = useAppStore();
  const navigate = useNavigate();

  const filteredProducts = mockProducts.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="lg:pl-20 h-screen flex flex-col lg:flex-row">
      {/* Product Selection Side */}
      <div className={`flex-1 flex flex-col ${showCart ? 'hidden lg:flex' : 'flex'}`}>
        <div className="px-4 pt-4 space-y-3">
          {/* Header with back button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate('/')}
                className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 text-foreground" />
              </motion.button>
              <motion.h1
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold font-display text-foreground"
              >
                Billing
              </motion.h1>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-xs font-semibold"
            >
              <ScanLine className="w-4 h-4" />
              Scan
            </motion.button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text" placeholder="Search or scan barcode..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
            {categories.map((cat) => (
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
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={addToCart} />
            ))}
          </div>
        </div>

        {/* Mobile Cart Button */}
        {cart.length > 0 && (
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={() => setShowCart(true)}
            className="lg:hidden mx-4 mb-20 py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-bold glow-primary flex items-center justify-center gap-2"
          >
            View Cart ({cart.length} items) — ₹
            {cart.reduce((s, i) => s + i.product.discountPrice * i.quantity, 0).toFixed(0)}
          </motion.button>
        )}
      </div>

      {/* Cart Side */}
      <div className={`lg:w-96 lg:border-l border-border bg-card flex flex-col ${
        showCart ? 'fixed inset-0 z-50 lg:relative' : 'hidden lg:flex'
      }`}>
        {showCart && (
          <button onClick={() => setShowCart(false)} className="lg:hidden px-4 py-3 text-left text-sm font-semibold text-primary border-b border-border">
            ← Back to Products
          </button>
        )}
        <CartPanel />
      </div>
    </div>
  );
};

export default Billing;
