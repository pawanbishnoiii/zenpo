import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Package, Loader2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GalleryPickerDialogProps {
  open: boolean;
  onClose: () => void;
  businessId?: string;
  onAdded?: () => void;
}

const generateSKU = () => `SKU-${Date.now().toString(36).toUpperCase()}`;
const generateBarcode = () => `${Math.floor(8900000000000 + Math.random() * 99999999999)}`;

const GalleryPickerDialog = ({ open, onClose, businessId, onAdded }: GalleryPickerDialogProps) => {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    supabase.from('gallery_products').select('*').order('name').then(({ data }) => {
      setItems(data || []);
      setLoading(false);
    });
  }, [open]);

  const handleAdd = async (item: any) => {
    if (!businessId) return;
    setAdding(item.id);
    try {
      const { error } = await supabase.from('products').insert({
        business_id: businessId,
        name: item.name,
        description: item.description || '',
        category: item.category,
        sku: generateSKU(),
        barcode_value: generateBarcode(),
        qr_value: generateBarcode(),
        price: item.price,
        discount_price: item.discount_price,
        tax_percent: item.tax_percent,
        stock: 100,
        image_url: item.image_url || '',
      });
      if (error) throw error;
      toast({ title: 'Added!', description: `${item.name} added to your workspace` });
      onAdded?.();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setAdding(null);
    }
  };

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end lg:items-center justify-center" onClick={onClose}>
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            onClick={e => e.stopPropagation()} className="w-full max-w-lg max-h-[85vh] bg-card rounded-t-3xl lg:rounded-3xl border border-border overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-bold font-display text-foreground">Product Gallery</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center"><X className="w-4 h-4 text-foreground" /></button>
            </div>
            <div className="px-4 pt-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Search gallery..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2">
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">{items.length === 0 ? 'Gallery is empty. Admin will add products here.' : 'No matching products.'}</p>
                </div>
              ) : filtered.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl glass-card">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.category} • ₹{item.discount_price || item.price}</p>
                  </div>
                  <motion.button whileTap={{ scale: 0.85 }} onClick={() => handleAdd(item)} disabled={adding === item.id}
                    className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shadow-soft disabled:opacity-50">
                    {adding === item.id ? <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" /> : <Plus className="w-4 h-4 text-primary-foreground" />}
                  </motion.button>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GalleryPickerDialog;
