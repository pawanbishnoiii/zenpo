import { motion, AnimatePresence } from 'framer-motion';
import { Search, ScanLine, ArrowLeft, ShoppingCart, X, Keyboard, Package } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import ProductCard from '@/components/products/ProductCard';
import CartPanel from '@/components/billing/CartPanel';
import BarcodeScanner from '@/components/billing/BarcodeScanner';
import { useAppStore, Product } from '@/store/useAppStore';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '@/hooks/useBusiness';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { getCategoryConfig } from '@/lib/categoryConfig';

const Billing = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showCart, setShowCart] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const { addToCart, cart, clearCart } = useAppStore();
  const navigate = useNavigate();
  const { business } = useBusiness();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const searchRef = useRef<HTMLInputElement>(null);

  const categoryConfig = business ? getCategoryConfig(business.category) : null;

  useEffect(() => {
    const fetchProducts = async () => {
      if (!business) return;
      const { data } = await supabase.from('products').select('*').eq('business_id', business.id).order('name');
      if (data) {
        setProducts(data.map((p: any) => ({
          id: p.id, name: p.name, description: p.description || '', category: p.category,
          sku: p.sku, barcode: p.barcode_value || '', price: Number(p.price),
          discountPrice: Number(p.discount_price), taxPercent: Number(p.tax_percent),
          stock: p.stock, imageUrl: p.image_url || '',
        })));
      }
    };
    fetchProducts();
  }, [business]);

  // Desktop keyboard shortcuts: F2 search, F4 charge, Esc clear cart / close suggestions
  useEffect(() => {
    if (isMobile) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      const isTextField = tag === 'input' || tag === 'textarea';

      if (e.key === 'F2') {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
        setShowSearchSuggestions(true);
      }
      if (e.key === 'F4') {
        e.preventDefault();
        // Trigger Charge button programmatically
        const chargeBtn = document.getElementById('billing-charge-btn') as HTMLButtonElement | null;
        if (chargeBtn && !chargeBtn.disabled) chargeBtn.click();
        else toast({ title: 'Cart is empty', description: 'Add items to cart first.' });
      }
      if (e.key === 'Escape') {
        if (showSearchSuggestions) { setShowSearchSuggestions(false); return; }
        if (isTextField) return;
        if (cart.length > 0) {
          clearCart();
          toast({ title: 'Cart cleared' });
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMobile, cart.length, showSearchSuggestions, clearCart, toast]);

  const allCategories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBarcodeScan = (code: string) => {
    const found = products.find(p => p.barcode === code || p.sku === code);
    if (found) {
      addToCart(found);
      toast({ title: 'Added to Cart', description: found.name });
    } else {
      toast({ title: 'Not Found', description: `No product with barcode: ${code}`, variant: 'destructive' });
    }
  };

  const cartTotal = cart.reduce((s, i) => s + i.product.discountPrice * i.quantity, 0);

  // Mobile layout: Cart on top, products below
  if (isMobile) {
    return (
      <div className="h-screen flex flex-col">
        {/* Mobile Header */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/dashboard')} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </motion.button>
            <h1 className="text-xl font-bold font-display text-foreground">{categoryConfig?.navLabel.billing || 'Billing'}</h1>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowScanner(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl gradient-primary text-primary-foreground text-xs font-semibold glow-primary">
            <ScanLine className="w-4 h-4" /> Scan
          </motion.button>
        </div>

        {/* Mobile Cart Summary (Always visible on top) */}
        {cart.length > 0 && !showCart && (
          <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="mx-4 mb-2 rounded-xl glass-card shadow-soft border border-primary/20 overflow-hidden">
            <button onClick={() => setShowCart(true)} className="w-full p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-foreground">{cart.length} items</p>
                  <p className="text-xs text-muted-foreground">Tap to view cart</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold gradient-primary-text">₹{cartTotal.toFixed(0)}</p>
              </div>
            </button>
            {/* Quick cart items preview */}
            <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
              {cart.slice(0, 5).map(item => (
                <span key={item.product.id} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium whitespace-nowrap">
                  {item.product.name} ×{item.quantity}
                </span>
              ))}
              {cart.length > 5 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">+{cart.length - 5}</span>}
            </div>
          </motion.div>
        )}

        {/* Full Cart View (slides over) */}
        {showCart && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-0 z-50 bg-card flex flex-col">
            <div className="px-4 py-3 flex items-center justify-between border-b border-border">
              <h2 className="text-lg font-bold font-display text-foreground">Cart</h2>
              <button onClick={() => setShowCart(false)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                <X className="w-4 h-4 text-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <CartPanel />
            </div>
          </motion.div>
        )}

        {/* Search & Categories */}
        <div className="px-4 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search product or scan barcode..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
            {allCategories.map((cat) => (
              <motion.button key={cat} whileTap={{ scale: 0.95 }} onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${activeCategory === cat ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                {cat}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Products Grid - optimized for touch */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <p className="text-sm">No products found</p>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/workspace')}
                className="mt-3 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-xs font-semibold">
                Add Products
              </motion.button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAdd={addToCart} />
              ))}
            </div>
          )}
        </div>

        <BarcodeScanner open={showScanner} onClose={() => setShowScanner(false)} onScan={handleBarcodeScan} />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DESKTOP LAYOUT — POS terminal style: 60% products / 40% cart
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-row bg-background">
      {/* LEFT — Products / Services selector (60%) */}
      <div className="flex-1 flex flex-col min-w-0" style={{ flex: '1 1 60%' }}>
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-6 lg:pl-24 pt-5 pb-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/dashboard')} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
                <ArrowLeft className="w-4 h-4 text-foreground" />
              </motion.button>
              <div>
                <motion.h1 initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold font-display text-foreground">
                  Ezo POS — {categoryConfig?.navLabel.billing || 'Billing'}
                </motion.h1>
                <p className="text-xs text-muted-foreground hidden lg:flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1"><Keyboard className="w-3 h-3" /> Shortcuts:</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">F2</kbd> Search
                  <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">F4</kbd> Charge
                  <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">Esc</kbd> Clear
                </p>
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }} onClick={() => setShowScanner(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold glow-primary cursor-pointer">
              <ScanLine className="w-4 h-4" /> Scan Barcode
            </motion.button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="billing-search"
              ref={searchRef}
              type="text"
              placeholder="Search by name, SKU, or barcode...  (F2)"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowSearchSuggestions(true); }}
              onFocus={() => search && setShowSearchSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {search && <button onClick={() => { setSearch(''); searchRef.current?.focus(); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>}

            {/* Live suggestions dropdown */}
            <AnimatePresence>
              {showSearchSuggestions && search.trim().length > 0 && filteredProducts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute z-30 top-full left-0 right-0 mt-2 max-h-80 overflow-y-auto rounded-xl bg-card border border-border shadow-elevated"
                >
                  {filteredProducts.slice(0, 8).map((p) => (
                    <button
                      key={p.id}
                      onMouseDown={(e) => { e.preventDefault(); addToCart(p); setSearch(''); setShowSearchSuggestions(false); searchRef.current?.focus(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/60 border-b border-border last:border-0 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                        {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> : <Package className="w-4 h-4 text-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{p.category} • SKU {p.sku}{p.barcode ? ` • ${p.barcode}` : ''}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold gradient-primary-text">₹{p.discountPrice}</p>
                        {p.price > p.discountPrice && <p className="text-[10px] text-muted-foreground line-through">₹{p.price}</p>}
                      </div>
                    </button>
                  ))}
                  {filteredProducts.length > 8 && (
                    <p className="px-4 py-2 text-[11px] text-muted-foreground text-center bg-muted/30">{filteredProducts.length - 8} more results — keep typing</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {allCategories.map((cat) => (
              <motion.button key={cat} whileTap={{ scale: 0.95 }} onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${activeCategory === cat ? 'gradient-primary text-primary-foreground shadow-soft' : 'bg-secondary text-secondary-foreground hover:bg-muted'}`}>
                {cat}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 lg:pl-24">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <p className="text-sm">No products found</p>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/workspace')}
                className="mt-4 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-xs font-semibold cursor-pointer">
                Add Products
              </motion.button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <motion.div key={product.id} whileHover={{ scale: 1.02, y: -2 }} transition={{ type: 'spring', stiffness: 300 }} className="cursor-pointer">
                  <ProductCard product={product} onAdd={addToCart} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer counter */}
        <div className="px-6 lg:pl-24 py-2 border-t border-border bg-card/50 text-xs text-muted-foreground flex items-center justify-between">
          <span>{filteredProducts.length} of {products.length} items shown</span>
          <span className="font-mono">Ezo POS Terminal</span>
        </div>
      </div>

      {/* RIGHT — Cart & Checkout (40%) */}
      <div className="border-l border-border bg-muted/30 flex flex-col shadow-elevated" style={{ flex: '1 1 40%', maxWidth: '480px', minWidth: '380px' }}>
        <CartPanel />
      </div>

      <BarcodeScanner open={showScanner} onClose={() => setShowScanner(false)} onScan={handleBarcodeScan} />
    </div>
  );
};

export default Billing;
