import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Phone, MapPin, Package, Loader2, Star, ChevronLeft, ChevronRight, Send, X, ShoppingBag, Clock, Zap, Heart, MessageSquare, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const STORE_THEMES = {
  suspended: { hero: 'from-slate-900 to-slate-700', accent: 'bg-slate-800', btn: 'bg-white text-slate-900', card: 'bg-white', text: 'text-slate-900' },
  classic: { hero: 'from-zinc-900 via-zinc-800 to-zinc-900', accent: 'bg-zinc-800', btn: 'bg-amber-500 text-white', card: 'bg-zinc-50', text: 'text-zinc-900' },
  vibrant: { hero: 'from-violet-600 via-fuchsia-500 to-pink-500', accent: 'bg-violet-600', btn: 'bg-white text-violet-700', card: 'bg-white', text: 'text-violet-900' },
  nature: { hero: 'from-emerald-800 via-green-700 to-teal-600', accent: 'bg-emerald-700', btn: 'bg-amber-400 text-emerald-900', card: 'bg-emerald-50', text: 'text-emerald-900' },
  ocean: { hero: 'from-blue-900 via-cyan-800 to-sky-700', accent: 'bg-blue-800', btn: 'bg-sky-400 text-blue-900', card: 'bg-sky-50', text: 'text-blue-900' },
};

type StoreThemeKey = keyof typeof STORE_THEMES;

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

  const theme = STORE_THEMES[(business?.store_theme as StoreThemeKey) || 'suspended'] || STORE_THEMES.suspended;

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
      product_id: selectedProduct.id,
      business_id: business.id,
      reviewer_name: reviewForm.name.trim(),
      reviewer_email: reviewForm.email.trim() || null,
      rating: reviewForm.rating,
      review_text: reviewForm.text.trim() || null,
    });
    if (error) toast({ title: 'Error submitting review', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Review submitted!', description: 'It will appear after the owner approves it.' }); setShowReviewForm(false); setReviewForm({ name: '', email: '', rating: 5, text: '' }); }
    setSubmittingReview(false);
  };

  const productReviews = selectedProduct ? reviews.filter((r: any) => r.product_id === selectedProduct.id) : [];
  const avgRating = reviews.length > 0 ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!business) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-2">
      <Store className="w-10 h-10 text-muted-foreground/30" />
      <p className="text-muted-foreground">Store not found</p>
      <p className="text-xs text-muted-foreground">This store link may not exist.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className={`relative bg-gradient-to-br ${theme.hero} text-white overflow-hidden`}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-24 text-center space-y-4">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
            {business.logo_url ? (
              <img src={getImageSrc(business.logo_url)} alt={business.business_name} className="w-20 h-20 mx-auto rounded-2xl object-cover border-2 border-white/20 shadow-xl" />
            ) : (
              <div className="w-20 h-20 mx-auto rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
                <Store className="w-10 h-10 text-white/80" />
              </div>
            )}
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold font-display">{business.business_name}</motion.h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center justify-center gap-4 text-sm text-white/70">
            {business.address && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{business.address}</span>}
            {business.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{business.phone}</span>}
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex items-center justify-center gap-6 pt-2">
            <div className="text-center"><p className="text-2xl font-bold">{products.length}</p><p className="text-xs text-white/60">Products</p></div>
            {avgRating && <div className="text-center"><p className="text-2xl font-bold flex items-center gap-1"><Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />{avgRating}</p><p className="text-xs text-white/60">{reviews.length} Reviews</p></div>}
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Products Grid */}
      <section className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-primary" /> Our Products</h2>
          <span className="text-xs text-muted-foreground">{products.length} items</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {products.map((p: any, i: number) => {
            const imgSrc = getImageSrc(p.image_url || '');
            const images = p.images || [];
            const hasDiscount = p.discount_price < p.price;
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="rounded-2xl bg-card border border-border overflow-hidden group cursor-pointer hover:shadow-elevated transition-shadow"
                onClick={() => { setSelectedProduct(p); setActiveImgIdx(0); }}>
                <div className="aspect-square bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center relative overflow-hidden">
                  {imgSrc ? <img src={imgSrc} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <Package className="w-10 h-10 text-muted-foreground/20" />}
                  {hasDiscount && <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">{Math.round(((p.price - p.discount_price) / p.price) * 100)}% OFF</span>}
                  {images.length > 1 && <span className="absolute bottom-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/50 text-white">{images.length} pics</span>}
                </div>
                <div className="p-3 space-y-1">
                  <p className="text-sm font-semibold truncate text-foreground">{p.name}</p>
                  {p.brand_name && <p className="text-[10px] text-muted-foreground">{p.brand_name}</p>}
                  <div className="flex items-baseline gap-1.5">
                    <p className="text-base font-bold text-foreground">₹{p.discount_price || p.price}</p>
                    {hasDiscount && <p className="text-xs text-muted-foreground line-through">₹{p.price}</p>}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        {products.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No products listed yet</p>}
      </section>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 py-8 space-y-4">
          <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary" /> Customer Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {reviews.slice(0, 6).map((r: any) => (
              <div key={r.id} className="rounded-2xl bg-card border border-border p-4 space-y-2">
                <div className="flex items-center gap-1">{[...Array(5)].map((_, j) => <Star key={j} className={`w-3.5 h-3.5 ${j < r.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30'}`} />)}</div>
                {r.review_text && <p className="text-sm text-foreground italic">"{r.review_text}"</p>}
                <p className="text-xs text-muted-foreground">{r.reviewer_name} • {new Date(r.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center"><Zap className="w-3.5 h-3.5 text-primary" /></div>
            <span className="text-xs font-bold text-foreground">{business.business_name}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {business.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{business.phone}</span>}
            {business.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{business.address}</span>}
          </div>
          <p className="text-[10px] text-muted-foreground">Powered by ZEN POS</p>
        </div>
      </footer>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center" onClick={() => setSelectedProduct(null)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30 }}
              onClick={e => e.stopPropagation()} className="w-full max-w-lg max-h-[92vh] bg-card rounded-t-3xl md:rounded-3xl border border-border overflow-hidden">
              <div className="relative">
                {/* Image carousel */}
                <div className="relative aspect-square bg-gradient-to-br from-primary/5 to-accent/5">
                  {(() => {
                    const allImages = [selectedProduct.image_url, ...((selectedProduct.images || []).map((img: any) => img.image_url))].filter(Boolean);
                    const currentImg = getImageSrc(allImages[activeImgIdx] || '');
                    return <>
                      {currentImg ? <img src={currentImg} alt={selectedProduct.name} className="w-full h-full object-cover" /> : <Package className="w-16 h-16 text-muted-foreground/20 mx-auto mt-32" />}
                      {allImages.length > 1 && (
                        <>
                          <button onClick={e => { e.stopPropagation(); setActiveImgIdx(i => (i - 1 + allImages.length) % allImages.length); }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white"><ChevronLeft className="w-4 h-4" /></button>
                          <button onClick={e => { e.stopPropagation(); setActiveImgIdx(i => (i + 1) % allImages.length); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white"><ChevronRight className="w-4 h-4" /></button>
                          <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
                            {allImages.map((_: string, j: number) => <div key={j} className={`w-2 h-2 rounded-full ${j === activeImgIdx ? 'bg-white' : 'bg-white/40'}`} />)}
                          </div>
                        </>
                      )}
                    </>;
                  })()}
                </div>
                <button onClick={() => setSelectedProduct(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white"><X className="w-4 h-4" /></button>
              </div>

              <div className="p-5 space-y-4 overflow-y-auto max-h-[50vh]">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{selectedProduct.name}</h2>
                  {selectedProduct.brand_name && <p className="text-xs text-muted-foreground mt-0.5">{selectedProduct.brand_name}</p>}
                  <p className="text-sm text-muted-foreground mt-1">{selectedProduct.category}</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">₹{selectedProduct.discount_price || selectedProduct.price}</span>
                  {selectedProduct.discount_price < selectedProduct.price && <span className="text-sm text-muted-foreground line-through">₹{selectedProduct.price}</span>}
                </div>
                {selectedProduct.description && <p className="text-sm text-muted-foreground leading-relaxed">{selectedProduct.description}</p>}

                {/* Product Reviews */}
                {productReviews.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border">
                    <p className="text-sm font-semibold text-foreground">Reviews ({productReviews.length})</p>
                    {productReviews.map((r: any) => (
                      <div key={r.id} className="space-y-1">
                        <div className="flex items-center gap-1">{[...Array(5)].map((_, j) => <Star key={j} className={`w-3 h-3 ${j < r.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/20'}`} />)}</div>
                        {r.review_text && <p className="text-xs text-foreground italic">"{r.review_text}"</p>}
                        <p className="text-[10px] text-muted-foreground">{r.reviewer_name}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Review Form Toggle */}
                {!showReviewForm ? (
                  <button onClick={() => setShowReviewForm(true)} className="w-full py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Write a Review
                  </button>
                ) : (
                  <div className="space-y-2 pt-2 border-t border-border">
                    <p className="text-sm font-semibold text-foreground">Write a Review</p>
                    <input type="text" placeholder="Your Name *" value={reviewForm.name} onChange={e => setReviewForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <input type="email" placeholder="Email (optional)" value={reviewForm.email} onChange={e => setReviewForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} onClick={() => setReviewForm(f => ({ ...f, rating: n }))} className="p-1">
                          <Star className={`w-5 h-5 ${n <= reviewForm.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30'}`} />
                        </button>
                      ))}
                    </div>
                    <textarea placeholder="Your review..." value={reviewForm.text} onChange={e => setReviewForm(f => ({ ...f, text: e.target.value }))}
                      rows={2} className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <div className="flex gap-2">
                      <button onClick={() => setShowReviewForm(false)} className="flex-1 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold">Cancel</button>
                      <button onClick={handleSubmitReview} disabled={submittingReview}
                        className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50">
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
