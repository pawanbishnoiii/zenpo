import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Package, ImagePlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/store/useAppStore';
import { useBusiness } from '@/hooks/useBusiness';
import { getCategoryDefaults } from '@/lib/categories';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface ProductEditDialogProps {
  open: boolean;
  onClose: () => void;
  product: Product;
  onUpdated?: () => void;
}

const ProductEditDialog = ({ open, onClose, product, onUpdated }: ProductEditDialogProps) => {
  const { toast } = useToast();
  const { business } = useBusiness();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product.imageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categoryDefaults = business ? [...getCategoryDefaults(business.category), 'Other'] : ['General'];

  const [form, setForm] = useState({
    name: product.name, description: product.description, category: product.category,
    brand_name: (product as any).brandName || '', price: String(product.price), discount_price: String(product.discountPrice),
    tax_percent: String(product.taxPercent), stock: String(product.stock), barcode_value: product.barcode, sku: product.sku,
  });

  const handleChange = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = product.imageUrl;
      if (imageFile && business) {
        const ext = imageFile.name.split('.').pop();
        const path = `${business.id}/${Date.now()}.${ext}`;
        const { error: ue } = await supabase.storage.from('product-images').upload(path, imageFile, { cacheControl: '3600', upsert: false });
        if (!ue) imageUrl = supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
      }

      const { error } = await supabase.from('products').update({
        name: form.name, description: form.description, category: form.category, brand_name: form.brand_name,
        price: parseFloat(form.price) || 0, discount_price: parseFloat(form.discount_price) || parseFloat(form.price) || 0,
        tax_percent: parseFloat(form.tax_percent) || 18, stock: parseInt(form.stock) || 0,
        barcode_value: form.barcode_value, sku: form.sku, image_url: imageUrl,
      }).eq('id', product.id);

      if (error) throw error;
      toast({ title: 'Updated!', description: `${form.name} saved.` });
      onUpdated?.(); onClose();
    } catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
    finally { setLoading(false); }
  };

  const getImageSrc = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return supabase.storage.from('product-images').getPublicUrl(url).data.publicUrl;
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="rounded-2xl max-h-[90vh] overflow-y-auto max-w-lg p-0">
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2 font-display"><Package className="w-5 h-5 text-primary" /> Edit Product</DialogTitle>
          <DialogDescription>Update product details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Image */}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          {imagePreview ? (
            <div className="relative w-full h-32 rounded-xl overflow-hidden border border-border">
              <img src={getImageSrc(imagePreview)} alt="Preview" className="w-full h-full object-cover" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-card/90 text-xs font-medium text-foreground"><ImagePlus className="w-3 h-3 inline mr-1" />Change</button>
            </div>
          ) : (
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="w-full h-24 rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground">
              <ImagePlus className="w-6 h-6" /><span className="text-xs">Upload image</span>
            </button>
          )}

          <input type="text" required value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="Name *"
            className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />

          <input type="text" value={form.brand_name} onChange={e => handleChange('brand_name', e.target.value)} placeholder="Brand Name"
            className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />

          <textarea value={form.description} onChange={e => handleChange('description', e.target.value)} placeholder="Description" rows={2}
            className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />

          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
              <select value={form.category} onChange={e => handleChange('category', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                {categoryDefaults.map(c => <option key={c} value={c}>{c}</option>)}
              </select></div>
            <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Tax %</label>
              <input type="number" value={form.tax_percent} onChange={e => handleChange('tax_percent', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-muted-foreground mb-1 block">SKU</label>
              <input type="text" value={form.sku} onChange={e => handleChange('sku', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
            <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Barcode</label>
              <input type="text" value={form.barcode_value} onChange={e => handleChange('barcode_value', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Price ₹</label>
              <input type="number" value={form.price} onChange={e => handleChange('price', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
            <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Discount ₹</label>
              <input type="number" value={form.discount_price} onChange={e => handleChange('discount_price', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
            <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Stock</label>
              <input type="number" value={form.stock} onChange={e => handleChange('stock', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
          </div>

          <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
            className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-sm glow-primary flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save Changes
          </motion.button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductEditDialog;
