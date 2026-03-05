import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Loader2, Barcode, QrCode, ImagePlus, Trash2, ScanLine } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import BarcodeLabel from './BarcodeLabel';
import { useBusiness } from '@/hooks/useBusiness';
import { getCategoryDefaults } from '@/lib/categories';

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  businessId?: string;
  businessName?: string;
  initialBarcode?: string | null;
}

const generateSKU = () => `SKU-${Date.now().toString(36).toUpperCase()}`;
const generateBarcode = () => `${Math.floor(8900000000000 + Math.random() * 99999999999)}`;

const ProductFormDialog = ({ open, onClose, onCreated, businessId, businessName, initialBarcode }: ProductFormDialogProps) => {
  const { toast } = useToast();
  const { business } = useBusiness();
  const [loading, setLoading] = useState(false);
  const [showBarcode, setShowBarcode] = useState(false);
  const [lastCreated, setLastCreated] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [brandSuggestions, setBrandSuggestions] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categoryDefaults = business ? getCategoryDefaults(business.category) : ['General'];

  const [form, setForm] = useState({
    name: '', description: '', category: categoryDefaults[0] || 'General', brand_name: '', sku: generateSKU(),
    barcode_value: generateBarcode(), price: '', discount_price: '', tax_percent: '18', stock: '', image_url: '',
  });

  useEffect(() => {
    if (open && initialBarcode) {
      setForm(f => ({ ...f, barcode_value: initialBarcode, sku: generateSKU() }));
    } else if (open && !initialBarcode) {
      setForm(f => ({ ...f, barcode_value: generateBarcode(), sku: generateSKU() }));
    }
  }, [open, initialBarcode]);

  // Fetch brand suggestions
  useEffect(() => {
    if (!businessId || form.brand_name.length < 2) { setBrandSuggestions([]); return; }
    const timer = setTimeout(async () => {
      const { data } = await supabase.from('products').select('brand_name').eq('business_id', businessId)
        .ilike('brand_name', `%${form.brand_name}%`).limit(5);
      const unique = [...new Set((data || []).map(d => d.brand_name).filter(Boolean))] as string[];
      setBrandSuggestions(unique);
    }, 300);
    return () => clearTimeout(timer);
  }, [form.brand_name, businessId]);

  const handleChange = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const resetForm = () => {
    setForm({ name: '', description: '', category: categoryDefaults[0] || 'General', brand_name: '', sku: generateSKU(), barcode_value: generateBarcode(), price: '', discount_price: '', tax_percent: '18', stock: '', image_url: '' });
    setImageFile(null); setImagePreview(null); setBrandSuggestions([]);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast({ title: 'Too large', description: 'Max 5MB', variant: 'destructive' }); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile || !businessId) return '';
    setUploadingImage(true);
    try {
      const ext = imageFile.name.split('.').pop();
      const path = `${businessId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('product-images').upload(path, imageFile, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
    } catch (err: any) { toast({ title: 'Upload failed', description: err.message, variant: 'destructive' }); return ''; }
    finally { setUploadingImage(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) { toast({ title: 'Error', description: 'No business found.', variant: 'destructive' }); return; }
    setLoading(true);
    try {
      let imageUrl = form.image_url;
      if (imageFile) imageUrl = await uploadImage();
      const { error } = await supabase.from('products').insert({
        business_id: businessId, name: form.name, description: form.description, category: form.category,
        brand_name: form.brand_name, sku: form.sku, barcode_value: form.barcode_value, qr_value: form.barcode_value,
        price: parseFloat(form.price) || 0, discount_price: parseFloat(form.discount_price) || parseFloat(form.price) || 0,
        tax_percent: parseFloat(form.tax_percent) || 18, stock: parseInt(form.stock) || 0, image_url: imageUrl,
      });
      if (error) throw error;
      setLastCreated({ name: form.name, barcode: form.barcode_value, price: parseFloat(form.discount_price) || parseFloat(form.price) || 0, sku: form.sku });
      toast({ title: 'Product created!', description: `${form.name} added.` });
      setShowBarcode(true); onCreated?.(); resetForm();
    } catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
    finally { setLoading(false); }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end lg:items-center justify-center" onClick={onClose}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              onClick={e => e.stopPropagation()} className="w-full max-w-lg max-h-[90vh] bg-card rounded-t-3xl lg:rounded-3xl border border-border overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2"><Package className="w-5 h-5 text-primary" /><h2 className="text-lg font-bold font-display text-foreground">Add Product</h2></div>
                <button onClick={onClose} className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center"><X className="w-4 h-4 text-foreground" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto max-h-[70vh] no-scrollbar">
                {/* Image */}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                {imagePreview ? (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border border-border">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive/90 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-destructive-foreground" /></button>
                  </div>
                ) : (
                  <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => fileInputRef.current?.click()}
                    className="w-full h-24 rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors">
                    <ImagePlus className="w-6 h-6" /><span className="text-xs">Upload image (max 5MB)</span>
                  </motion.button>
                )}

                <input type="text" required value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="Product Name *"
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />

                {/* Brand Name with suggestions */}
                <div className="relative">
                  <input type="text" value={form.brand_name} onChange={e => handleChange('brand_name', e.target.value)} placeholder="Brand Name (optional)"
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  {brandSuggestions.length > 0 && (
                    <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-elevated overflow-hidden">
                      {brandSuggestions.map(b => (
                        <button key={b} type="button" onClick={() => { handleChange('brand_name', b); setBrandSuggestions([]); }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 text-foreground">{b}</button>
                      ))}
                    </div>
                  )}
                </div>

                <textarea value={form.description} onChange={e => handleChange('description', e.target.value)} placeholder="Description" rows={2}
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
                    <select value={form.category} onChange={e => handleChange('category', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                      {categoryDefaults.map(c => <option key={c} value={c}>{c}</option>)}
                      <option value="Other">Other</option>
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
                    <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <Barcode className="w-3 h-3" /> Barcode {initialBarcode ? <span className="text-primary">(scanned)</span> : ''}
                    </label>
                    <input type="text" value={form.barcode_value} onChange={e => handleChange('barcode_value', e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-xl border border-border text-sm ${initialBarcode ? 'bg-primary/5 text-foreground font-semibold' : 'bg-background text-foreground'} focus:outline-none focus:ring-2 focus:ring-primary/30`} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Price ₹ *</label>
                    <input type="number" required value={form.price} onChange={e => handleChange('price', e.target.value)} placeholder="499"
                      className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
                  <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Discount ₹</label>
                    <input type="number" value={form.discount_price} onChange={e => handleChange('discount_price', e.target.value)} placeholder="449"
                      className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
                  <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Stock *</label>
                    <input type="number" required value={form.stock} onChange={e => handleChange('stock', e.target.value)} placeholder="100"
                      className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
                </div>

                <motion.button type="submit" disabled={loading || uploadingImage} whileTap={{ scale: 0.97 }}
                  className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-sm glow-primary flex items-center justify-center gap-2 disabled:opacity-50">
                  {(loading || uploadingImage) ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {uploadingImage ? 'Uploading...' : loading ? 'Creating...' : 'Add Product'}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {lastCreated && <BarcodeLabel open={showBarcode} onClose={() => { setShowBarcode(false); onClose(); }} productName={lastCreated.name} barcode={lastCreated.barcode} price={lastCreated.price} sku={lastCreated.sku} businessName={businessName} />}
    </>
  );
};

export default ProductFormDialog;
