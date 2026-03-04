import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/store/useAppStore';

interface ProductEditDialogProps {
  open: boolean;
  onClose: () => void;
  product: Product;
  onUpdated?: () => void;
}

const defaultCategories = ['Car Wash', 'Spare Parts', 'Accessories', 'Services', 'Labour', 'Modification', 'General'];

const ProductEditDialog = ({ open, onClose, product, onUpdated }: ProductEditDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: product.name,
    description: product.description,
    category: product.category,
    price: String(product.price),
    discount_price: String(product.discountPrice),
    tax_percent: String(product.taxPercent),
    stock: String(product.stock),
    barcode_value: product.barcode,
    sku: product.sku,
  });

  const handleChange = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('products').update({
        name: form.name,
        description: form.description,
        category: form.category,
        price: parseFloat(form.price) || 0,
        discount_price: parseFloat(form.discount_price) || parseFloat(form.price) || 0,
        tax_percent: parseFloat(form.tax_percent) || 18,
        stock: parseInt(form.stock) || 0,
        barcode_value: form.barcode_value,
        sku: form.sku,
      }).eq('id', product.id);

      if (error) throw error;
      toast({ title: 'Updated!', description: `${form.name} saved.` });
      onUpdated?.();
      onClose();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end lg:items-center justify-center" onClick={onClose}>
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            onClick={e => e.stopPropagation()} className="w-full max-w-lg max-h-[90vh] bg-card rounded-t-3xl lg:rounded-3xl border border-border overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2"><Package className="w-5 h-5 text-primary" /><h2 className="text-lg font-bold font-display text-foreground">Edit Product</h2></div>
              <button onClick={onClose} className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center"><X className="w-4 h-4 text-foreground" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto max-h-[70vh] no-scrollbar">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Name *</label>
                <input type="text" required value={form.name} onChange={e => handleChange('name', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => handleChange('description', e.target.value)} rows={2}
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
                  <select value={form.category} onChange={e => handleChange('category', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {defaultCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Tax %</label>
                  <input type="number" value={form.tax_percent} onChange={e => handleChange('tax_percent', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">SKU</label>
                  <input type="text" value={form.sku} onChange={e => handleChange('sku', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Barcode</label>
                  <input type="text" value={form.barcode_value} onChange={e => handleChange('barcode_value', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Price ₹</label>
                  <input type="number" value={form.price} onChange={e => handleChange('price', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Discount ₹</label>
                  <input type="number" value={form.discount_price} onChange={e => handleChange('discount_price', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Stock</label>
                  <input type="number" value={form.stock} onChange={e => handleChange('stock', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
                className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-sm glow-primary flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save Changes
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductEditDialog;
