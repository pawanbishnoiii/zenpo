import { motion } from 'framer-motion';
import { useAppStore, CartItem } from '@/store/useAppStore';
import { Minus, Plus, Trash2, CreditCard, Banknote, Smartphone, Printer, FileText, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { useBusiness } from '@/hooks/useBusiness';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import InvoicePreview from './InvoicePreview';
import { connectPrinter, sendToPrinter, buildReceiptData, PrinterConnection } from '@/lib/ezoPrinter';

const CartPanel = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useAppStore();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [printer, setPrinter] = useState<PrinterConnection>({ device: null, characteristic: null, connected: false });
  const invoiceRef = useRef<HTMLDivElement>(null);
  const { business } = useBusiness();
  const { toast } = useToast();

  const subtotal = cart.reduce((sum, item) => sum + item.product.discountPrice * item.quantity, 0);
  const taxTotal = cart.reduce(
    (sum, item) => sum + (item.product.discountPrice * item.quantity * item.product.taxPercent) / 100,
    0
  );
  const grandTotal = subtotal + taxTotal;

  const paymentMethods = [
    { id: 'cash', label: 'Cash', icon: Banknote },
    { id: 'card', label: 'Card', icon: CreditCard },
    { id: 'upi', label: 'UPI', icon: Smartphone },
  ];

  const generateInvoiceNumber = () => {
    const prefix = business?.category === 'car_wash' ? 'CW' : 'SP';
    return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
  };

  const handleCharge = async () => {
    if (!business) {
      toast({ title: 'Error', description: 'Please set up your business first', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const invNum = generateInvoiceNumber();
    setInvoiceNumber(invNum);

    try {
      // Create invoice
      const { data: invoice, error: invError } = await supabase.from('invoices').insert({
        business_id: business.id,
        invoice_number: invNum,
        customer_name: customerName || null,
        customer_phone: customerPhone || null,
        subtotal,
        discount_total: cart.reduce((s, i) => s + (i.product.price - i.product.discountPrice) * i.quantity, 0),
        tax_total: taxTotal,
        grand_total: grandTotal,
        payment_method: paymentMethod,
      }).select().single();

      if (invError) throw invError;

      // Create invoice items
      const items = cart.map((item) => ({
        invoice_id: invoice.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.product.discountPrice,
        total: item.product.discountPrice * item.quantity,
      }));
      const { error: itemsError } = await supabase.from('invoice_items').insert(items);
      if (itemsError) throw itemsError;

      // Reduce stock
      for (const item of cart) {
        await supabase.from('products').update({
          stock: Math.max(0, item.product.stock - item.quantity)
        }).eq('id', item.product.id);
      }

      setShowInvoice(true);
      toast({ title: 'Invoice Created!', description: `Invoice ${invNum} saved successfully.` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleConnectPrinter = async () => {
    const conn = await connectPrinter();
    setPrinter(conn);
    if (conn.connected) {
      toast({ title: 'Printer Connected!', description: conn.device?.name || 'Ezo Printer' });
    } else {
      toast({ title: 'Connection Failed', description: 'Could not connect to printer', variant: 'destructive' });
    }
  };

  const handlePrint = async () => {
    if (!printer.connected || !printer.characteristic) {
      toast({ title: 'No printer', description: 'Please connect a printer first', variant: 'destructive' });
      return;
    }

    const receiptData = buildReceiptData({
      businessName: business?.business_name || 'ZEN POS',
      businessAddress: business?.address || '',
      businessPhone: business?.phone || '',
      businessGst: business?.gst_number || '',
      invoiceNumber,
      customerName,
      customerPhone,
      items: cart.map(i => ({
        name: i.product.name,
        qty: i.quantity,
        price: i.product.discountPrice,
        total: i.product.discountPrice * i.quantity,
      })),
      subtotal,
      tax: taxTotal,
      total: grandTotal,
      paymentMethod,
    });

    try {
      await sendToPrinter(printer.characteristic, receiptData);
      toast({ title: 'Printed!', description: 'Receipt sent to printer' });
    } catch (err: any) {
      toast({ title: 'Print Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDone = () => {
    setShowInvoice(false);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    clearCart();
  };

  // Invoice View
  if (showInvoice) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-bold font-display text-foreground">Invoice</h2>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleConnectPrinter}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                printer.connected ? 'bg-success/10 text-success' : 'bg-secondary text-secondary-foreground'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              {printer.connected ? 'Connected' : 'Connect'}
            </motion.button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-4 flex justify-center">
          <InvoicePreview
            ref={invoiceRef}
            cart={cart}
            customerName={customerName}
            customerPhone={customerPhone}
            customerEmail={customerEmail}
            paymentMethod={paymentMethod}
            invoiceNumber={invoiceNumber}
            businessName={business?.business_name || 'ZEN POS'}
            businessAddress={business?.address}
            businessPhone={business?.phone}
            businessGst={business?.gst_number}
            subtotal={subtotal}
            taxTotal={taxTotal}
            grandTotal={grandTotal}
          />
        </div>

        <div className="border-t border-border p-4 space-y-2">
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handlePrint}
              disabled={!printer.connected}
              className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Printer className="w-4 h-4" />
              Print
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleDone}
              className="flex-[2] py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-bold glow-primary"
            >
              Done — New Bill
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-display text-foreground">Cart</h2>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleConnectPrinter}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 ${
                printer.connected ? 'bg-success/10 text-success' : 'bg-secondary text-secondary-foreground'
              }`}
            >
              <Printer className="w-3 h-3" />
              {printer.connected ? '✓' : 'Ezo'}
            </motion.button>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
              {cart.length} items
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Banknote className="w-12 h-12 mb-2 opacity-30" />
            <p className="text-sm">Cart is empty</p>
            <p className="text-xs">Scan or add products to get started</p>
          </div>
        ) : (
          <>
            {cart.map((item: CartItem) => (
              <motion.div
                key={item.product.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3 p-3 rounded-xl glass-card"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-foreground">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">₹{item.product.discountPrice} × {item.quantity}</p>
                </div>
                <div className="flex items-center gap-1">
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center"
                  >
                    <Minus className="w-3 h-3 text-secondary-foreground" />
                  </motion.button>
                  <span className="w-8 text-center text-sm font-bold text-foreground">{item.quantity}</span>
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center"
                  >
                    <Plus className="w-3 h-3 text-secondary-foreground" />
                  </motion.button>
                </div>
                <p className="text-sm font-bold w-14 text-right text-foreground">
                  ₹{(item.product.discountPrice * item.quantity).toFixed(0)}
                </p>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => removeFromCart(item.product.id)}
                  className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center"
                >
                  <Trash2 className="w-3 h-3 text-destructive" />
                </motion.button>
              </motion.div>
            ))}

            {/* Customer Details */}
            <div className="space-y-2 pt-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer (Optional)</p>
              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <div className="flex gap-2">
                <input
                  type="tel"
                  placeholder="Phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {cart.length > 0 && (
        <div className="border-t border-border p-4 space-y-3">
          {/* Payment Methods */}
          <div className="flex gap-2">
            {paymentMethods.map((pm) => {
              const Icon = pm.icon;
              return (
                <motion.button
                  key={pm.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                    paymentMethod === pm.id
                      ? 'gradient-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {pm.label}
                </motion.button>
              );
            })}
          </div>

          {/* Totals */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax</span>
              <span>₹{taxTotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-1 border-t border-border text-foreground">
              <span>Total</span>
              <span className="gradient-primary-text">₹{grandTotal.toFixed(0)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={clearCart}
              className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold"
            >
              Clear
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCharge}
              disabled={saving}
              className="flex-[2] py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-bold glow-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Charge ₹{grandTotal.toFixed(0)}
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPanel;
