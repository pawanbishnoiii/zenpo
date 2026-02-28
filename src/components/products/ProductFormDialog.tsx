import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Loader2, Barcode, QrCode } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import BarcodeLabel from './BarcodeLabel';

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  businessId?: string;
  businessName?: string;
}

const generateSKU = () => `SKU-${Date.now().toString(36).toUpperCase()}`;
const generateBarcode = () => `${Math.floor(8900000000000 + Math.random() * 99999999999)}`;

const defaultCategories = ['Car Wash', 'Spare Parts', 'Accessories', 'Services', 'Labour', 'Modification'];

const ProductFormDialog = ({ open, onClose, onCreated, businessId, businessName }: ProductFormDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showBarcode, setShowBarcode] = useState(false);
  const [lastCreated, setLastCreated] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'Car Wash',
    sku: generateSKU(),
    barcode_value: generateBarcode(),
    price: '',
    discount_price: '',
    tax_percent: '18',
    stock: '',
    image_url: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const resetForm = () => {
    setForm({
      name: '', description: '', category: 'Car Wash', sku: generateSKU(),
      barcode_value: generateBarcode(), price: '', discount_price: '', tax_percent: '18', stock: '', image_url: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) {
      toast({ title: 'Error', description: 'No business found. Please set up your business first.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const productData = {
        business_id: businessId,
        name: form.name,
        description: form.description,
        category: form.category,
        sku: form.sku,
        barcode_value: form.barcode_value,
        qr_value: form.barcode_value,
        price: parseFloat(form.price) || 0,
        discount_price: parseFloat(form.discount_price) || parseFloat(form.price) || 0,
        tax_percent: parseFloat(form.tax_percent) || 18,
        stock: parseInt(form.stock) || 0,
        image_url: form.image_url,
      };

      const { error } = await supabase.from('products').insert(productData);
      if (error) throw error;

      setLastCreated({
        name: form.name,
        barcode: form.barcode_value,
        price: parseFloat(form.discount_price) || parseFloat(form.price) || 0,
        sku: form.sku,
      });

      toast({ title: 'Product created!', description: `${form.name} added successfully.` });
      setShowBarcode(true);
      onCreated?.();
      resetForm();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end lg:items-center justify-center"
            onClick={onClose}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[90vh] bg-card rounded-t-3xl lg:rounded-3xl border border-border overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold font-display text-foreground">Add Product</h2>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
                  <X className="w-4 h-4 text-foreground" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto max-h-[70vh] no-scrollbar">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Product Name *</label>
                  <input
                    type="text" required value={form.name} onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g. Premium Car Wash"
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                  <textarea
                    value={form.description} onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Short description..."
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
                    <select
                      value={form.category} onChange={(e) => handleChange('category', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {defaultCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Tax %</label>
                    <input
                      type="number" value={form.tax_percent} onChange={(e) => handleChange('tax_percent', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <Barcode className="w-3 h-3" /> SKU (auto)
                    </label>
                    <input
                      type="text" value={form.sku} readOnly
                      className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm text-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <QrCode className="w-3 h-3" /> Barcode (auto)
                    </label>
                    <input
                      type="text" value={form.barcode_value} readOnly
                      className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm text-muted-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Price ₹ *</label>
                    <input
                      type="number" required value={form.price} onChange={(e) => handleChange('price', e.target.value)}
                      placeholder="499"
                      className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Discount ₹</label>
                    <input
                      type="number" value={form.discount_price} onChange={(e) => handleChange('discount_price', e.target.value)}
                      placeholder="449"
                      className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Stock *</label>
                    <input
                      type="number" required value={form.stock} onChange={(e) => handleChange('stock', e.target.value)}
                      placeholder="100"
                      className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-sm glow-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Add Product
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barcode Label after creation */}
      {lastCreated && (
        <BarcodeLabel
          open={showBarcode}
          onClose={() => { setShowBarcode(false); onClose(); }}
          productName={lastCreated.name}
          barcode={lastCreated.barcode}
          price={lastCreated.price}
          sku={lastCreated.sku}
          businessName={businessName}
        />
      )}
    </>
  );
};

export default ProductFormDialog;
