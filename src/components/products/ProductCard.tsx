import { motion } from 'framer-motion';
import { Product } from '@/store/useAppStore';
import { Plus, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProductCardProps {
  product: Product;
  onAdd?: (product: Product) => void;
  compact?: boolean;
}

const getImageSrc = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return supabase.storage.from('product-images').getPublicUrl(url).data.publicUrl;
};

const ProductCard = ({ product, onAdd, compact }: ProductCardProps) => {
  const hasDiscount = product.discountPrice < product.price;
  const imgSrc = getImageSrc(product.imageUrl);

  if (compact) {
    return (
      <motion.button whileTap={{ scale: 0.97 }} onClick={() => onAdd?.(product)}
        className="flex items-center gap-3 p-3 rounded-xl glass-card shadow-soft w-full text-left hover:shadow-elevated transition-shadow">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
          {imgSrc ? <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-primary" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate text-foreground">{product.name}</p>
          <p className="text-xs text-muted-foreground">{product.category}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-foreground">₹{product.discountPrice}</p>
          {hasDiscount && <p className="text-xs text-muted-foreground line-through">₹{product.price}</p>}
        </div>
      </motion.button>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ y: -2 }}
      className="rounded-2xl glass-card shadow-soft overflow-hidden group">
      <div className="aspect-square bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center relative overflow-hidden">
        {imgSrc ? <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" /> : <Package className="w-10 h-10 text-muted-foreground/40" />}
        {hasDiscount && (
          <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground">
            {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
          </span>
        )}
        {product.stock < 20 && (
          <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-warning text-warning-foreground">Low Stock</span>
        )}
      </div>
      <div className="p-3 space-y-1">
        <p className="text-sm font-semibold truncate text-foreground">{product.name}</p>
        <p className="text-xs text-muted-foreground truncate">{product.category}</p>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold text-foreground">₹{product.discountPrice}</span>
            {hasDiscount && <span className="text-xs text-muted-foreground line-through">₹{product.price}</span>}
          </div>
          {onAdd && (
            <motion.button whileTap={{ scale: 0.85 }} onClick={() => onAdd(product)}
              className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shadow-soft">
              <Plus className="w-4 h-4 text-primary-foreground" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
