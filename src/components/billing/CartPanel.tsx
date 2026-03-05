import { motion } from 'framer-motion';
import { useAppStore, CartItem } from '@/store/useAppStore';
import { Minus, Plus, Trash2, Banknote, Smartphone, Printer, FileText, Loader2, UserCheck, Share2, Tag } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useBusiness } from '@/hooks/useBusiness';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import InvoicePreview from './InvoicePreview';
import { connectPrinter, sendToPrinter, buildReceiptData, PrinterConnection } from '@/lib/ezoPrinter';

const VEHICLE_TYPES = ['Car', 'Bike', 'Scooter', 'Auto', 'SUV', 'Truck', 'Other'];

const CartPanel = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useAppStore();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [printer, setPrinter] = useState<PrinterConnection>({ device: null, characteristic: null, connected: false });
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const { business } = useBusiness();
  const { toast } = useToast();

  const subtotal = cart.reduce((sum, item) => sum + item.product.discountPrice * item.quantity, 0);
  const taxTotal = cart.reduce((sum, item) => sum + (item.product.discountPrice * item.quantity * item.product.taxPercent) / 100, 0);
  const couponAmount = couponDiscount > 0 ? (subtotal * couponDiscount) / 100 : 0;
  const grandTotal = subtotal + taxTotal - couponAmount;

  const paymentMethods = [
    { id: 'cash', label: 'Cash', icon: Banknote },
    { id: 'cod', label: 'COD', icon: FileText },
    { id: 'upi', label: 'UPI', icon: Smartphone },
  ];

  // Customer search
  useEffect(() => {
    if (!business || customerPhone.length < 3) { setSuggestions([]); return; }
    const timer = setTimeout(async () => {
      const { data } = await supabase.from('customers').select('full_name, phone, email, vehicle_number, vehicle_type')
        .eq('business_id', business.id).or(`phone.ilike.%${customerPhone}%,full_name.ilike.%${customerPhone}%`).limit(5);
      setSuggestions(data || []);
      setShowSuggestions((data || []).length > 0);
    }, 300);
    return () => clearTimeout(timer);
  }, [customerPhone, business?.id]);

  const selectCustomer = (c: any) => {
    setCustomerName(c.full_name || '');
    setCustomerPhone(c.phone || '');
    setCustomerEmail(c.email || '');
    setVehicleNumber(c.vehicle_number || '');
    setVehicleType(c.vehicle_type || '');
    setShowSuggestions(false);
  };

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!business || !couponCode.trim()) return;
    const { data } = await supabase.from('business_offers').select('discount_percent, title')
      .eq('business_id', business.id).eq('coupon_code', couponCode.trim().toUpperCase()).eq('is_active', true).maybeSingle();
    if (data) {
      setCouponDiscount(data.discount_percent);
      toast({ title: 'Coupon Applied!', description: `${data.title} — ${data.discount_percent}% off` });
    } else {
      setCouponDiscount(0);
      toast({ title: 'Invalid Coupon', description: 'This code is not valid or expired.', variant: 'destructive' });
    }
  };

  const generateInvoiceNumber = () => {
    const prefix = (business?.category || 'ZP').substring(0, 2).toUpperCase();
    return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
  };

  const handleCharge = async () => {
    if (!business) { toast({ title: 'Error', description: 'Set up business first', variant: 'destructive' }); return; }
    setSaving(true);
    const invNum = generateInvoiceNumber();
    setInvoiceNumber(invNum);
    try {
      let customerId: string | null = null;
      const hasDetails = [customerName, customerPhone, customerEmail, vehicleNumber].some(v => v.trim().length > 0);
      if (hasDetails) {
        const { data: uid, error: ce } = await supabase.rpc('upsert_customer_for_invoice', {
          _business_id: business.id, _full_name: customerName, _phone: customerPhone, _email: customerEmail, _vehicle_number: vehicleNumber,
        });
        if (ce) throw ce;
        customerId = uid as string;
      }
      const discountTotal = cart.reduce((s, i) => s + (i.product.price - i.product.discountPrice) * i.quantity, 0) + couponAmount;
      const { data: invoice, error: invError } = await supabase.from('invoices').insert({
        business_id: business.id, invoice_number: invNum, customer_id: customerId,
        customer_name: customerName || null, customer_phone: customerPhone || null,
        subtotal, discount_total: discountTotal, tax_total: taxTotal, grand_total: grandTotal, payment_method: paymentMethod,
      }).select().single();
      if (invError) throw invError;

      const items = cart.map(item => ({
        invoice_id: invoice.id, product_id: item.product.id, product_name: item.product.name,
        quantity: item.quantity, price: item.product.discountPrice, total: item.product.discountPrice * item.quantity,
      }));
      const { error: ie } = await supabase.from('invoice_items').insert(items);
      if (ie) throw ie;

      for (const item of cart) {
        await supabase.from('products').update({ stock: Math.max(0, item.product.stock - item.quantity) }).eq('id', item.product.id);
      }

      if (customerId) {
        const { data: cs } = await supabase.from('customers').select('visit_count,total_spent').eq('id', customerId).maybeSingle();
        if (cs) {
          await supabase.from('customers').update({
            visit_count: Number(cs.visit_count || 0) + 1, total_spent: Number(cs.total_spent || 0) + grandTotal,
            last_visit_at: new Date().toISOString(), vehicle_type: vehicleType || undefined,
          }).eq('id', customerId);
        }
      }

      setShowInvoice(true);
      toast({ title: 'Invoice Created!', description: `${invNum} saved.` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const handleConnectPrinter = async () => {
    const conn = await connectPrinter();
    setPrinter(conn);
    if (conn.connected) toast({ title: 'Printer Connected!' });
    else toast({ title: 'Failed', variant: 'destructive' });
  };

  const handlePrint = async () => {
    if (!printer.connected || !printer.characteristic) return;
    const receiptData = buildReceiptData({
      businessName: business?.business_name || 'ZEN POS', businessAddress: business?.address || '',
      businessPhone: business?.phone || '', businessGst: business?.gst_number || '',
      invoiceNumber, customerName, customerPhone,
      items: cart.map(i => ({ name: i.product.name, qty: i.quantity, price: i.product.discountPrice, total: i.product.discountPrice * i.quantity })),
      subtotal, tax: taxTotal, total: grandTotal, paymentMethod,
    });
    try { await sendToPrinter(printer.characteristic, receiptData); toast({ title: 'Printed!' }); }
    catch (err: any) { toast({ title: 'Print Error', description: err.message, variant: 'destructive' }); }
  };

  const handleShareWhatsApp = () => {
    const itemsList = cart.map(i => `• ${i.product.name} x${i.quantity} = ₹${(i.product.discountPrice * i.quantity).toFixed(0)}`).join('\n');
    const storeUrl = business?.store_slug ? `${window.location.origin}/store/${business.store_slug}` : '';
    const msg = `*Invoice: ${invoiceNumber}*\n${business?.business_name || 'ZEN POS'}\n\n${itemsList}\n\nSubtotal: ₹${subtotal.toFixed(0)}\nTax: ₹${taxTotal.toFixed(0)}${couponAmount > 0 ? `\nCoupon: -₹${couponAmount.toFixed(0)}` : ''}\n*Total: ₹${grandTotal.toFixed(0)}*\nPayment: ${paymentMethod.toUpperCase()}${storeUrl ? `\n\nVisit: ${storeUrl}` : ''}\n\nThank you!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleDone = () => { setShowInvoice(false); setCustomerName(''); setCustomerPhone(''); setVehicleNumber(''); setVehicleType(''); setCustomerEmail(''); setCouponCode(''); setCouponDiscount(0); clearCart(); };

  if (showInvoice) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-bold font-display text-foreground">Invoice</h2>
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleConnectPrinter}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${printer.connected ? 'bg-success/10 text-success' : 'bg-secondary text-secondary-foreground'}`}>
            <Printer className="w-3.5 h-3.5" />{printer.connected ? 'Connected' : 'Connect'}
          </motion.button>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 flex justify-center">
          <InvoicePreview ref={invoiceRef} cart={cart} customerName={customerName} customerPhone={customerPhone} customerEmail={customerEmail}
            paymentMethod={paymentMethod} invoiceNumber={invoiceNumber} businessName={business?.business_name || 'ZEN POS'}
            businessAddress={business?.address} businessPhone={business?.phone} businessGst={business?.gst_number}
            subtotal={subtotal} taxTotal={taxTotal} grandTotal={grandTotal}
            storeUrl={business?.store_slug ? `${window.location.origin}/store/${business.store_slug}` : undefined} />
        </div>
        <div className="border-t border-border p-4 space-y-2">
          <div className="flex gap-2">
            <motion.button whileTap={{ scale: 0.95 }} onClick={handlePrint} disabled={!printer.connected}
              className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40">
              <Printer className="w-4 h-4" /> Print
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleShareWhatsApp}
              className="flex-1 py-3 rounded-xl bg-success/10 text-success text-sm font-semibold flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" /> WhatsApp
            </motion.button>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleDone} className="w-full py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-bold glow-primary">
            Done — New Bill
          </motion.button>
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
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleConnectPrinter}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 ${printer.connected ? 'bg-success/10 text-success' : 'bg-secondary text-secondary-foreground'}`}>
              <Printer className="w-3 h-3" />{printer.connected ? '✓' : 'Ezo'}
            </motion.button>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">{cart.length} items</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Banknote className="w-12 h-12 mb-2 opacity-30" /><p className="text-sm">Cart is empty</p><p className="text-xs">Scan or add products</p>
          </div>
        ) : (
          <>
            {cart.map((item: CartItem) => (
              <motion.div key={item.product.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 p-3 rounded-xl glass-card">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-foreground">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">₹{item.product.discountPrice} × {item.quantity}</p>
                </div>
                <div className="flex items-center gap-1">
                  <motion.button whileTap={{ scale: 0.85 }} onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center"><Minus className="w-3 h-3 text-secondary-foreground" /></motion.button>
                  <span className="w-8 text-center text-sm font-bold text-foreground">{item.quantity}</span>
                  <motion.button whileTap={{ scale: 0.85 }} onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center"><Plus className="w-3 h-3 text-secondary-foreground" /></motion.button>
                </div>
                <p className="text-sm font-bold w-14 text-right text-foreground">₹{(item.product.discountPrice * item.quantity).toFixed(0)}</p>
                <motion.button whileTap={{ scale: 0.85 }} onClick={() => removeFromCart(item.product.id)} className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center"><Trash2 className="w-3 h-3 text-destructive" /></motion.button>
              </motion.div>
            ))}

            {/* Customer Section */}
            <div className="space-y-2 pt-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer (Optional)</p>
              <div className="relative">
                <input type="text" placeholder="Search by name or phone..." value={customerPhone || customerName}
                  onChange={e => { const v = e.target.value; if (/^\d/.test(v)) setCustomerPhone(v); else { setCustomerName(v); setCustomerPhone(''); } }}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-elevated overflow-hidden">
                    {suggestions.map((s, i) => (
                      <button key={i} onClick={() => selectCustomer(s)} className="w-full flex items-center gap-2 p-2.5 text-left hover:bg-muted/50 text-sm">
                        <UserCheck className="w-4 h-4 text-primary shrink-0" />
                        <div className="min-w-0"><p className="font-semibold text-foreground truncate">{s.full_name}</p><p className="text-xs text-muted-foreground">{s.phone} {s.vehicle_number ? `• ${s.vehicle_number}` : ''}</p></div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {(customerPhone || customerName) && (
                <>
                  <input type="text" placeholder="Customer Name" value={customerName} onChange={e => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <div className="flex gap-2">
                    <input type="tel" placeholder="Phone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <input type="text" placeholder="Vehicle #" value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <select value={vehicleType} onChange={e => setVehicleType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="">Vehicle Type (optional)</option>
                    {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </>
              )}
            </div>

            {/* Coupon */}
            <div className="space-y-2 pt-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Tag className="w-3 h-3" /> Coupon Code</p>
              <div className="flex gap-2">
                <input type="text" placeholder="Enter coupon..." value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <button onClick={handleApplyCoupon} className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold">Apply</button>
              </div>
              {couponDiscount > 0 && <p className="text-xs text-success font-medium">Coupon applied: {couponDiscount}% off (−₹{couponAmount.toFixed(0)})</p>}
            </div>
          </>
        )}
      </div>

      {cart.length > 0 && (
        <div className="border-t border-border p-4 space-y-3">
          <div className="flex gap-2">
            {paymentMethods.map(pm => {
              const Icon = pm.icon;
              return (
                <motion.button key={pm.id} whileTap={{ scale: 0.95 }} onClick={() => setPaymentMethod(pm.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-colors ${paymentMethod === pm.id ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                  <Icon className="w-3.5 h-3.5" />{pm.label}
                </motion.button>
              );
            })}
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Tax</span><span>₹{taxTotal.toFixed(0)}</span></div>
            {couponAmount > 0 && <div className="flex justify-between text-success"><span>Coupon</span><span>−₹{couponAmount.toFixed(0)}</span></div>}
            <div className="flex justify-between text-base font-bold pt-1 border-t border-border text-foreground"><span>Total</span><span className="gradient-primary-text">₹{grandTotal.toFixed(0)}</span></div>
          </div>
          <div className="flex gap-2">
            <motion.button whileTap={{ scale: 0.95 }} onClick={clearCart} className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold">Clear</motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleCharge} disabled={saving}
              className="flex-[2] py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-bold glow-primary flex items-center justify-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} Charge ₹{grandTotal.toFixed(0)}
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPanel;
