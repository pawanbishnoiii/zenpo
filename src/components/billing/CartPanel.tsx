import { motion } from 'framer-motion';
import { useAppStore, CartItem } from '@/store/useAppStore';
import { Minus, Plus, Trash2, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { useState } from 'react';

const CartPanel = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useAppStore();
  const [paymentMethod, setPaymentMethod] = useState('cash');

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

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-display text-foreground">Cart</h2>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
            {cart.length} items
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Banknote className="w-12 h-12 mb-2 opacity-30" />
            <p className="text-sm">Cart is empty</p>
            <p className="text-xs">Add products to get started</p>
          </div>
        ) : (
          cart.map((item: CartItem) => (
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
              <p className="text-sm font-bold w-16 text-right text-foreground">
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
          ))
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
              className="flex-[2] py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-bold glow-primary"
            >
              Charge ₹{grandTotal.toFixed(0)}
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPanel;
