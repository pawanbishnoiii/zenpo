import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Store, Phone, MapPin, Package, Loader2, Star, ChevronLeft, ChevronRight, Send, X, ShoppingBag, Heart, MessageSquare, Mail, ArrowUp, Menu, Instagram, Facebook, Twitter, Clock, Zap, Award, Sparkles, Eye, Shield, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Category-specific theme configurations
const CATEGORY_THEMES: Record<string, any> = {
  car_wash: {
    hero: 'from-blue-900 via-blue-800 to-cyan-900', accent: 'bg-blue-600', btn: 'bg-cyan-400 text-blue-900 hover:bg-cyan-300',
    card: 'bg-white', navBg: 'bg-blue-950/95', badge: 'bg-cyan-400/15 text-cyan-300', reviewBg: 'bg-blue-50',
    footerBg: 'bg-blue-950', footerText: 'text-blue-400', emoji: '🚗', tagline: 'Premium Car Care Services',
    pattern: 'radial-gradient(circle at 20% 80%, rgba(56,189,248,0.15) 0%, transparent 50%)',
  },
  spare_parts: {
    hero: 'from-amber-900 via-orange-800 to-yellow-900', accent: 'bg-orange-600', btn: 'bg-amber-400 text-orange-900 hover:bg-amber-300',
    card: 'bg-white', navBg: 'bg-orange-950/95', badge: 'bg-amber-400/15 text-amber-300', reviewBg: 'bg-orange-50',
    footerBg: 'bg-orange-950', footerText: 'text-orange-400', emoji: '🔧', tagline: 'Quality Auto Parts & Accessories',
    pattern: 'radial-gradient(circle at 80% 20%, rgba(251,191,36,0.15) 0%, transparent 50%)',
  },
  grocery: {
    hero: 'from-green-900 via-emerald-800 to-teal-800', accent: 'bg-emerald-600', btn: 'bg-emerald-400 text-green-900 hover:bg-emerald-300',
    card: 'bg-white', navBg: 'bg-green-950/95', badge: 'bg-emerald-400/15 text-emerald-300', reviewBg: 'bg-green-50',
    footerBg: 'bg-green-950', footerText: 'text-green-400', emoji: '🛒', tagline: 'Fresh Groceries Delivered Daily',
    pattern: 'radial-gradient(circle at 30% 70%, rgba(52,211,153,0.15) 0%, transparent 50%)',
  },
  medical: {
    hero: 'from-red-900 via-rose-800 to-pink-900', accent: 'bg-rose-600', btn: 'bg-white text-rose-700 hover:bg-rose-50',
    card: 'bg-white', navBg: 'bg-red-950/95', badge: 'bg-rose-400/15 text-rose-300', reviewBg: 'bg-rose-50',
    footerBg: 'bg-red-950', footerText: 'text-rose-400', emoji: '💊', tagline: 'Your Health, Our Priority',
    pattern: 'radial-gradient(circle at 70% 30%, rgba(251,113,133,0.15) 0%, transparent 50%)',
  },
  electronics: {
    hero: 'from-violet-900 via-purple-800 to-indigo-900', accent: 'bg-violet-600', btn: 'bg-violet-400 text-violet-900 hover:bg-violet-300',
    card: 'bg-white', navBg: 'bg-violet-950/95', badge: 'bg-violet-400/15 text-violet-300', reviewBg: 'bg-violet-50',
    footerBg: 'bg-violet-950', footerText: 'text-violet-400', emoji: '💻', tagline: 'Latest Tech & Gadgets',
    pattern: 'radial-gradient(circle at 50% 50%, rgba(167,139,250,0.15) 0%, transparent 50%)',
  },
  clothing: {
    hero: 'from-pink-900 via-fuchsia-800 to-rose-800', accent: 'bg-pink-600', btn: 'bg-white text-pink-700 hover:bg-pink-50',
    card: 'bg-white', navBg: 'bg-pink-950/95', badge: 'bg-pink-400/15 text-pink-300', reviewBg: 'bg-pink-50',
    footerBg: 'bg-pink-950', footerText: 'text-pink-400', emoji: '👗', tagline: 'Trending Fashion Collection',
    pattern: 'radial-gradient(circle at 60% 40%, rgba(244,114,182,0.15) 0%, transparent 50%)',
  },
  fruits_veg: {
    hero: 'from-lime-900 via-green-800 to-emerald-800', accent: 'bg-lime-600', btn: 'bg-lime-400 text-green-900 hover:bg-lime-300',
    card: 'bg-white', navBg: 'bg-green-950/95', badge: 'bg-lime-400/15 text-lime-300', reviewBg: 'bg-lime-50',
    footerBg: 'bg-green-950', footerText: 'text-lime-400', emoji: '🥬', tagline: 'Farm Fresh Every Day',
    pattern: 'radial-gradient(circle at 40% 60%, rgba(163,230,53,0.15) 0%, transparent 50%)',
  },
  restaurant: {
    hero: 'from-amber-900 via-orange-800 to-red-900', accent: 'bg-amber-600', btn: 'bg-amber-400 text-amber-900 hover:bg-amber-300',
    card: 'bg-white', navBg: 'bg-amber-950/95', badge: 'bg-amber-400/15 text-amber-300', reviewBg: 'bg-amber-50',
    footerBg: 'bg-amber-950', footerText: 'text-amber-400', emoji: '☕', tagline: 'Delicious Food & Beverages',
    pattern: 'radial-gradient(circle at 25% 75%, rgba(251,191,36,0.15) 0%, transparent 50%)',
  },
  salon: {
    hero: 'from-fuchsia-900 via-purple-800 to-pink-800', accent: 'bg-fuchsia-600', btn: 'bg-white text-fuchsia-700 hover:bg-fuchsia-50',
    card: 'bg-white', navBg: 'bg-fuchsia-950/95', badge: 'bg-fuchsia-400/15 text-fuchsia-300', reviewBg: 'bg-fuchsia-50',
    footerBg: 'bg-fuchsia-950', footerText: 'text-fuchsia-400', emoji: '✂️', tagline: 'Beauty & Wellness Studio',
    pattern: 'radial-gradient(circle at 75% 25%, rgba(232,121,249,0.15) 0%, transparent 50%)',
  },
  hardware: {
    hero: 'from-slate-900 via-gray-800 to-zinc-800', accent: 'bg-slate-600', btn: 'bg-amber-400 text-slate-900 hover:bg-amber-300',
    card: 'bg-white', navBg: 'bg-slate-950/95', badge: 'bg-amber-400/15 text-amber-300', reviewBg: 'bg-slate-50',
    footerBg: 'bg-slate-950', footerText: 'text-slate-400', emoji: '🔨', tagline: 'Tools & Building Supplies',
    pattern: 'radial-gradient(circle at 50% 80%, rgba(148,163,184,0.15) 0%, transparent 50%)',
  },
  stationery: {
    hero: 'from-cyan-900 via-teal-800 to-sky-800', accent: 'bg-cyan-600', btn: 'bg-cyan-400 text-cyan-900 hover:bg-cyan-300',
    card: 'bg-white', navBg: 'bg-cyan-950/95', badge: 'bg-cyan-400/15 text-cyan-300', reviewBg: 'bg-cyan-50',
    footerBg: 'bg-cyan-950', footerText: 'text-cyan-400', emoji: '📚', tagline: 'Stationery & Office Supplies',
    pattern: 'radial-gradient(circle at 30% 30%, rgba(34,211,238,0.15) 0%, transparent 50%)',
  },
  pet_store: {
    hero: 'from-rose-900 via-orange-800 to-amber-800', accent: 'bg-rose-600', btn: 'bg-rose-400 text-rose-900 hover:bg-rose-300',
    card: 'bg-white', navBg: 'bg-rose-950/95', badge: 'bg-rose-400/15 text-rose-300', reviewBg: 'bg-rose-50',
    footerBg: 'bg-rose-950', footerText: 'text-rose-400', emoji: '🐾', tagline: 'Everything Your Pet Needs',
    pattern: 'radial-gradient(circle at 60% 60%, rgba(251,113,133,0.15) 0%, transparent 50%)',
  },
  bakery: {
    hero: 'from-amber-900 via-yellow-800 to-orange-800', accent: 'bg-amber-600', btn: 'bg-amber-300 text-amber-900 hover:bg-amber-200',
    card: 'bg-white', navBg: 'bg-amber-950/95', badge: 'bg-amber-300/15 text-amber-300', reviewBg: 'bg-amber-50',
    footerBg: 'bg-amber-950', footerText: 'text-amber-400', emoji: '🧁', tagline: 'Fresh Baked With Love',
    pattern: 'radial-gradient(circle at 40% 40%, rgba(252,211,77,0.15) 0%, transparent 50%)',
  },
};

// Fallback for store_theme overrides
const STORE_THEMES: Record<string, any> = {
  suspended: { hero: 'from-slate-900 to-slate-800', accent: 'bg-slate-800', btn: 'bg-white text-slate-900 hover:bg-slate-100', card: 'bg-white', navBg: 'bg-slate-900/95', badge: 'bg-white/10 text-white', reviewBg: 'bg-slate-50', footerBg: 'bg-slate-900', footerText: 'text-slate-400', emoji: '⚡', tagline: 'Welcome to Our Store', pattern: '' },
  classic: { hero: 'from-zinc-900 via-zinc-800 to-zinc-900', accent: 'bg-zinc-800', btn: 'bg-amber-500 text-white hover:bg-amber-600', card: 'bg-zinc-50', navBg: 'bg-zinc-900/95', badge: 'bg-amber-500/10 text-amber-400', reviewBg: 'bg-amber-50', footerBg: 'bg-zinc-900', footerText: 'text-zinc-500', emoji: '✨', tagline: 'Elegance Redefined', pattern: '' },
  vibrant: { hero: 'from-violet-600 via-fuchsia-500 to-pink-500', accent: 'bg-violet-600', btn: 'bg-white text-violet-700 hover:bg-violet-50', card: 'bg-white', navBg: 'bg-violet-900/95', badge: 'bg-white/15 text-white', reviewBg: 'bg-violet-50', footerBg: 'bg-violet-900', footerText: 'text-violet-400', emoji: '🎨', tagline: 'Bold & Beautiful', pattern: '' },
  nature: { hero: 'from-emerald-800 via-green-700 to-teal-600', accent: 'bg-emerald-700', btn: 'bg-amber-400 text-emerald-900 hover:bg-amber-300', card: 'bg-emerald-50', navBg: 'bg-emerald-900/95', badge: 'bg-amber-400/15 text-amber-300', reviewBg: 'bg-emerald-50', footerBg: 'bg-emerald-900', footerText: 'text-emerald-400', emoji: '🌿', tagline: 'Natural & Fresh', pattern: '' },
  ocean: { hero: 'from-blue-900 via-cyan-800 to-sky-700', accent: 'bg-blue-800', btn: 'bg-sky-400 text-blue-900 hover:bg-sky-300', card: 'bg-sky-50', navBg: 'bg-blue-900/95', badge: 'bg-sky-400/15 text-sky-300', reviewBg: 'bg-sky-50', footerBg: 'bg-blue-900', footerText: 'text-blue-400', emoji: '🌊', tagline: 'Deep & Refreshing', pattern: '' },
};

const AnimSection = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }} className={className}>{children}</motion.div>;
};

const StorePage = () => {
  const { slug } = useParams();
  const { toast } = useToast();
  const [business, setBusiness] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', email: '', rating: 5, text: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [mobileNav, setMobileNav] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [filterCat, setFilterCat] = useState('All');

  useEffect(() => {
    if (!slug) return;
    const fetchStore = async () => {
      const { data, error } = await supabase.rpc('get_store_by_slug', { _slug: slug });
      if (data && !error) {
        const result = data as any;
        setBusiness(result.business);
        setProducts(result.products || []);
        setReviews(result.reviews || []);
      }
      setLoading(false);
    };
    fetchStore();
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Use category-specific theme, fallback to store_theme selection
  const getCatTheme = () => {
    const cat = business?.category;
    if (cat && CATEGORY_THEMES[cat]) return CATEGORY_THEMES[cat];
    const st = business?.store_theme;
    if (st && STORE_THEMES[st]) return STORE_THEMES[st];
    return STORE_THEMES.suspended;
  };
  const theme = getCatTheme();

  const getImageSrc = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return supabase.storage.from('product-images').getPublicUrl(url).data.publicUrl;
  };

  const handleSubmitReview = async () => {
    if (!reviewForm.name.trim()) { toast({ title: 'Please enter your name', variant: 'destructive' }); return; }
    if (!selectedProduct || !business) return;
    setSubmittingReview(true);
    const { error } = await supabase.from('product_reviews').insert({
      product_id: selectedProduct.id, business_id: business.id,
      reviewer_name: reviewForm.name.trim(), reviewer_email: reviewForm.email.trim() || null,
      rating: reviewForm.rating, review_text: reviewForm.text.trim() || null,
    });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Review submitted!', description: 'It will appear after approval.' }); setShowReviewForm(false); setReviewForm({ name: '', email: '', rating: 5, text: '' }); }
    setSubmittingReview(false);
  };

  const productReviews = selectedProduct ? reviews.filter((r: any) => r.product_id === selectedProduct.id) : [];
  const avgRating = reviews.length > 0 ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1) : null;
  const productCategories = ['All', ...new Set(products.map((p: any) => p.category))];
  const filteredProducts = filterCat === 'All' ? products : products.filter((p: any) => p.category === filterCat);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!business) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
      <Store className="w-12 h-12 text-muted-foreground/20" />
      <p className="text-lg font-semibold text-foreground">Store Not Found</p>
      <p className="text-sm text-muted-foreground">This store link may not exist or has been removed.</p>
    </div>
  );

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'products', label: 'Products' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Navigation */}
      <nav className={`sticky top-0 z-40 ${theme.navBg} backdrop-blur-xl border-b border-white/10`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {business.logo_url ? (
              <img src={getImageSrc(business.logo_url)} alt="" className="w-9 h-9 rounded-xl object-cover border border-white/20" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-lg">{theme.emoji}</div>
            )}
            <span className="text-sm font-bold text-white tracking-tight">{business.business_name}</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(l => (
              <a key={l.id} href={`#${l.id}`} onClick={() => setActiveSection(l.id)}
                className={`text-xs font-medium transition-colors ${activeSection === l.id ? 'text-white' : 'text-white/60 hover:text-white'}`}>{l.label}</a>
            ))}
          </div>
          <button onClick={() => setMobileNav(!mobileNav)} className="md:hidden p-2 rounded-lg bg-white/10">
            <Menu className="w-4 h-4 text-white" />
          </button>
        </div>
        <AnimatePresence>
          {mobileNav && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="md:hidden overflow-hidden border-t border-white/10">
              {navLinks.map(l => (
                <a key={l.id} href={`#${l.id}`} onClick={() => { setActiveSection(l.id); setMobileNav(false); }}
                  className="block px-6 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5">{l.label}</a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section id="home" className={`relative bg-gradient-to-br ${theme.hero} text-white overflow-hidden`}>
        <div className="absolute inset-0 opacity-20" style={{ background: theme.pattern }} />
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
        
        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-36 text-center space-y-6">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, type: 'spring' }}>
            {business.logo_url ? (
              <img src={getImageSrc(business.logo_url)} alt={business.business_name} className="w-28 h-28 mx-auto rounded-3xl object-cover border-4 border-white/20 shadow-2xl" />
            ) : (
              <div className="w-28 h-28 mx-auto rounded-3xl bg-white/10 backdrop-blur flex items-center justify-center border-2 border-white/20 text-5xl">
                {theme.emoji}
              </div>
            )}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">{business.business_name}</h1>
            <p className="text-lg text-white/60 font-medium">{theme.tagline}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-4 flex-wrap text-sm text-white/70">
            {business.address && <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full"><MapPin className="w-3.5 h-3.5" />{business.address}</span>}
            {business.phone && <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full"><Phone className="w-3.5 h-3.5" />{business.phone}</span>}
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-8 pt-3">
            <div className="text-center"><p className="text-3xl font-bold">{products.length}</p><p className="text-xs text-white/50">Products</p></div>
            {avgRating && <div className="text-center"><p className="text-3xl font-bold flex items-center gap-1"><Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />{avgRating}</p><p className="text-xs text-white/50">{reviews.length} Reviews</p></div>}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <a href="#products" className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl ${theme.btn} text-sm font-bold transition-all shadow-lg hover:shadow-xl`}>
              <ShoppingBag className="w-4 h-4" /> Browse Products
            </a>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Features / Highlights strip */}
      <AnimSection>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Sparkles, label: 'Quality Products', desc: 'Hand-picked items' },
              { icon: Shield, label: 'Trusted Store', desc: 'Verified seller' },
              { icon: Clock, label: 'Fast Service', desc: 'Quick & efficient' },
              { icon: Award, label: 'Best Prices', desc: 'Competitive rates' },
            ].map((f, i) => (
              <motion.div key={f.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }} className="text-center p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                <f.icon className="w-6 h-6 mx-auto text-gray-600" />
                <p className="text-sm font-bold text-gray-900">{f.label}</p>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimSection>

      {/* Products Section */}
      <AnimSection>
        <section id="products" className="max-w-6xl mx-auto px-4 py-12 md:py-16 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2"><ShoppingBag className="w-6 h-6 text-gray-600" /> Our Products</h2>
              <p className="text-sm text-gray-500 mt-1">{products.length} items available</p>
            </div>
          </div>

          {productCategories.length > 2 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
              {productCategories.map(cat => (
                <button key={cat} onClick={() => setFilterCat(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${filterCat === cat ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((p: any, i: number) => {
              const imgSrc = getImageSrc(p.image_url || '');
              const images = p.images || [];
              const hasDiscount = p.discount_price < p.price;
              return (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }} whileHover={{ y: -6, scale: 1.02 }}
                  className="rounded-2xl bg-white border border-gray-100 overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300"
                  onClick={() => { setSelectedProduct(p); setActiveImgIdx(0); }}>
                  <div className="aspect-square bg-gray-50 flex items-center justify-center relative overflow-hidden">
                    {imgSrc ? <img src={imgSrc} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <Package className="w-10 h-10 text-gray-300" />}
                    {hasDiscount && <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white shadow-md">{Math.round(((p.price - p.discount_price) / p.price) * 100)}% OFF</span>}
                    {images.length > 1 && <span className="absolute bottom-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/50 text-white">{images.length} pics</span>}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                  </div>
                  <div className="p-3 space-y-1">
                    <p className="text-sm font-semibold truncate text-gray-900">{p.name}</p>
                    {p.brand_name && <p className="text-[10px] text-gray-500 font-medium">{p.brand_name}</p>}
                    <div className="flex items-baseline gap-1.5">
                      <p className="text-base font-bold text-gray-900">₹{p.discount_price || p.price}</p>
                      {hasDiscount && <p className="text-xs text-gray-400 line-through">₹{p.price}</p>}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          {products.length === 0 && <p className="text-center text-sm text-gray-500 py-12">No products listed yet</p>}
        </section>
      </AnimSection>

      {/* Reviews Section */}
      <AnimSection>
        <section id="reviews" className={`max-w-6xl mx-auto px-4 py-12 md:py-16 space-y-6`}>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2"><MessageSquare className="w-6 h-6 text-gray-600" /> Customer Reviews</h2>
            {avgRating && <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-50 border border-yellow-200"><Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /><span className="text-sm font-bold text-gray-900">{avgRating}</span></div>}
          </div>
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews.slice(0, 9).map((r: any, i: number) => (
                <motion.div key={r.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className="rounded-2xl bg-gray-50 border border-gray-100 p-5 space-y-3">
                  <div className="flex items-center gap-1">{[...Array(5)].map((_, j) => <Star key={j} className={`w-4 h-4 ${j < r.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />)}</div>
                  {r.review_text && <p className="text-sm text-gray-700 italic leading-relaxed">"{r.review_text}"</p>}
                  <p className="text-xs text-gray-500 font-medium">{r.reviewer_name} • {new Date(r.created_at).toLocaleDateString()}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-2xl bg-gray-50 border border-gray-100">
              <MessageSquare className="w-8 h-8 mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">No reviews yet. Be the first to review!</p>
            </div>
          )}
        </section>
      </AnimSection>

      {/* Contact Section */}
      <AnimSection>
        <section id="contact" className="max-w-6xl mx-auto px-4 py-12 md:py-16 space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">Get in Touch</h2>
          <p className="text-center text-gray-500 text-sm">We'd love to hear from you</p>
          <div className="max-w-md mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
            {business.phone && (
              <a href={`tel:${business.phone}`} className="rounded-2xl bg-gray-50 border border-gray-100 p-6 text-center space-y-3 hover:shadow-lg transition-all hover:-translate-y-1">
                <Phone className="w-7 h-7 mx-auto text-gray-600" /><p className="text-sm font-bold text-gray-900">Call Us</p><p className="text-xs text-gray-500">{business.phone}</p>
              </a>
            )}
            {business.address && (
              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-6 text-center space-y-3">
                <MapPin className="w-7 h-7 mx-auto text-gray-600" /><p className="text-sm font-bold text-gray-900">Visit Us</p><p className="text-xs text-gray-500">{business.address}</p>
              </div>
            )}
          </div>
        </section>
      </AnimSection>

      {/* Footer */}
      <footer className={`${theme.footerBg} text-white py-12`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              {business.logo_url ? (
                <img src={getImageSrc(business.logo_url)} alt="" className="w-10 h-10 rounded-xl object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">{theme.emoji}</div>
              )}
              <div>
                <p className="text-sm font-bold">{business.business_name}</p>
                {business.address && <p className={`text-xs ${theme.footerText}`}>{business.address}</p>}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {navLinks.map(l => (
                <a key={l.id} href={`#${l.id}`} className={`text-xs ${theme.footerText} hover:text-white transition-colors`}>{l.label}</a>
              ))}
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className={`text-xs ${theme.footerText}`}>© {new Date().getFullYear()} {business.business_name}. All rights reserved.</p>
            <p className={`text-[10px] ${theme.footerText} flex items-center gap-1`}>Powered by <Zap className="w-3 h-3" /> ZEN POS</p>
          </div>
        </div>
      </footer>

      {/* Back to top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-2xl hover:bg-gray-800 transition-colors">
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center" onClick={() => setSelectedProduct(null)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30 }}
              onClick={e => e.stopPropagation()} className="w-full max-w-lg max-h-[92vh] bg-white rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl">
              <div className="relative">
                <div className="relative aspect-square bg-gray-50">
                  {(() => {
                    const allImages = [selectedProduct.image_url, ...((selectedProduct.images || []).map((img: any) => img.image_url))].filter(Boolean);
                    const currentImg = getImageSrc(allImages[activeImgIdx] || '');
                    return <>
                      {currentImg ? <img src={currentImg} alt={selectedProduct.name} className="w-full h-full object-cover" /> : <Package className="w-16 h-16 text-gray-300 mx-auto mt-32" />}
                      {allImages.length > 1 && (
                        <>
                          <button onClick={e => { e.stopPropagation(); setActiveImgIdx(ii => (ii - 1 + allImages.length) % allImages.length); }}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg"><ChevronLeft className="w-5 h-5 text-gray-700" /></button>
                          <button onClick={e => { e.stopPropagation(); setActiveImgIdx(ii => (ii + 1) % allImages.length); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg"><ChevronRight className="w-5 h-5 text-gray-700" /></button>
                          <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
                            {allImages.map((_: string, j: number) => <div key={j} className={`w-2.5 h-2.5 rounded-full transition-colors ${j === activeImgIdx ? 'bg-gray-900' : 'bg-gray-400'}`} />)}
                          </div>
                        </>
                      )}
                    </>;
                  })()}
                </div>
                <button onClick={() => setSelectedProduct(null)} className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg"><X className="w-5 h-5 text-gray-700" /></button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto max-h-[50vh]">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedProduct.name}</h2>
                  {selectedProduct.brand_name && <p className="text-xs text-gray-500 mt-0.5 font-medium">{selectedProduct.brand_name}</p>}
                  <p className="text-sm text-gray-500 mt-1">{selectedProduct.category}</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">₹{selectedProduct.discount_price || selectedProduct.price}</span>
                  {selectedProduct.discount_price < selectedProduct.price && <span className="text-sm text-gray-400 line-through">₹{selectedProduct.price}</span>}
                </div>
                {selectedProduct.description && <p className="text-sm text-gray-600 leading-relaxed">{selectedProduct.description}</p>}

                {productReviews.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">Reviews ({productReviews.length})</p>
                    {productReviews.map((r: any) => (
                      <div key={r.id} className="space-y-1 p-3 rounded-xl bg-gray-50">
                        <div className="flex items-center gap-1">{[...Array(5)].map((_, j) => <Star key={j} className={`w-3 h-3 ${j < r.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />)}</div>
                        {r.review_text && <p className="text-xs text-gray-700 italic">"{r.review_text}"</p>}
                        <p className="text-[10px] text-gray-500">{r.reviewer_name}</p>
                      </div>
                    ))}
                  </div>
                )}

                {!showReviewForm ? (
                  <button onClick={() => setShowReviewForm(true)} className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                    <MessageSquare className="w-4 h-4" /> Write a Review
                  </button>
                ) : (
                  <div className="space-y-3 pt-3 border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">Write a Review</p>
                    <input type="text" placeholder="Your Name *" value={reviewForm.name} onChange={e => setReviewForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
                    <input type="email" placeholder="Email (optional)" value={reviewForm.email} onChange={e => setReviewForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} onClick={() => setReviewForm(f => ({ ...f, rating: n }))} className="p-1">
                          <Star className={`w-6 h-6 ${n <= reviewForm.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                    <textarea placeholder="Your review..." value={reviewForm.text} onChange={e => setReviewForm(f => ({ ...f, text: e.target.value }))}
                      rows={3} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-300" />
                    <div className="flex gap-2">
                      <button onClick={() => setShowReviewForm(false)} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold">Cancel</button>
                      <button onClick={handleSubmitReview} disabled={submittingReview}
                        className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50">
                        {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Submit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StorePage;
