import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, Phone, MapPin, Package, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const StorePage = () => {
  const { slug } = useParams();
  const [business, setBusiness] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const fetch = async () => {
      const { data: biz } = await supabase.from('businesses').select('*').eq('store_slug', slug).maybeSingle();
      if (biz) {
        setBusiness(biz);
        const { data: prods } = await supabase.from('products').select('*').eq('business_id', biz.id).order('name');
        setProducts(prods || []);
      }
      setLoading(false);
    };
    fetch();
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!business) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Store not found</p></div>;

  const getImageSrc = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return supabase.storage.from('product-images').getPublicUrl(url).data.publicUrl;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center"><Store className="w-8 h-8 text-primary-foreground" /></div>
          <h1 className="text-2xl font-bold font-display text-foreground">{business.business_name}</h1>
          {business.address && <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><MapPin className="w-3 h-3" />{business.address}</p>}
          {business.phone && <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Phone className="w-3 h-3" />{business.phone}</p>}
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {products.map(p => {
            const imgSrc = getImageSrc(p.image_url || '');
            return (
              <motion.div key={p.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl glass-card shadow-soft overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
                  {imgSrc ? <img src={imgSrc} alt={p.name} className="w-full h-full object-cover" /> : <Package className="w-8 h-8 text-muted-foreground/30" />}
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold truncate text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.category}</p>
                  <p className="text-base font-bold text-foreground mt-1">₹{p.discount_price || p.price}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
        {products.length === 0 && <p className="text-center text-sm text-muted-foreground">No products listed yet</p>}
        <p className="text-center text-[10px] text-muted-foreground pt-4">Powered by ZEN POS</p>
      </div>
    </div>
  );
};

export default StorePage;
