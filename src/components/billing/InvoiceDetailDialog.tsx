import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Receipt, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import dayjs from 'dayjs';

interface InvoiceDetailDialogProps {
  open: boolean;
  onClose: () => void;
  invoice: any;
  businessName?: string;
}

const InvoiceDetailDialog = ({ open, onClose, invoice, businessName }: InvoiceDetailDialogProps) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !invoice) return;
    supabase.from('invoice_items').select('*').eq('invoice_id', invoice.id).then(({ data }) => {
      setItems(data || []);
      setLoading(false);
    });
  }, [open, invoice?.id]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end lg:items-center justify-center" onClick={onClose}>
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            onClick={e => e.stopPropagation()} className="w-full max-w-md max-h-[85vh] bg-card rounded-t-3xl lg:rounded-3xl border border-border overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2"><Receipt className="w-5 h-5 text-primary" /><h2 className="text-lg font-bold font-display text-foreground">{invoice.invoice_number}</h2></div>
              <button onClick={onClose} className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center"><X className="w-4 h-4 text-foreground" /></button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh] no-scrollbar">
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Business: <span className="text-foreground font-semibold">{businessName || 'ZEN POS'}</span></p>
                <p className="text-muted-foreground">Date: <span className="text-foreground">{dayjs(invoice.created_at).format('DD MMM YYYY, h:mm A')}</span></p>
                {invoice.customer_name && <p className="text-muted-foreground">Customer: <span className="text-foreground">{invoice.customer_name}</span></p>}
                {invoice.customer_phone && <p className="text-muted-foreground">Phone: <span className="text-foreground">{invoice.customer_phone}</span></p>}
                <p className="text-muted-foreground">Payment: <span className="text-foreground uppercase">{invoice.payment_method}</span></p>
              </div>

              {loading ? <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div> : (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Items</p>
                  {items.map(item => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div><p className="text-sm font-semibold text-foreground">{item.product_name}</p><p className="text-xs text-muted-foreground">₹{item.price} × {item.quantity}</p></div>
                      <p className="text-sm font-bold text-foreground">₹{Number(item.total).toFixed(0)}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-1 text-sm border-t border-border pt-3">
                <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>₹{Number(invoice.subtotal).toFixed(0)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Tax</span><span>₹{Number(invoice.tax_total).toFixed(0)}</span></div>
                {Number(invoice.discount_total) > 0 && <div className="flex justify-between text-muted-foreground"><span>Discount</span><span>-₹{Number(invoice.discount_total).toFixed(0)}</span></div>}
                <div className="flex justify-between text-base font-bold text-foreground pt-1"><span>Total</span><span className="gradient-primary-text">₹{Number(invoice.grand_total).toFixed(0)}</span></div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InvoiceDetailDialog;
