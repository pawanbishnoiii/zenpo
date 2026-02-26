import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  sku: string;
  barcode: string;
  price: number;
  discountPrice: number;
  taxPercent: number;
  stock: number;
  imageUrl: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

interface AppState {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  cart: [],
  addToCart: (product) =>
    set((state) => {
      const existing = state.cart.find((i) => i.product.id === product.id);
      if (existing) {
        return {
          cart: state.cart.map((i) =>
            i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { cart: [...state.cart, { product, quantity: 1 }] };
    }),
  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((i) => i.product.id !== productId),
    })),
  updateQuantity: (productId, quantity) =>
    set((state) => ({
      cart: state.cart.map((i) =>
        i.product.id === productId ? { ...i, quantity: Math.max(0, quantity) } : i
      ).filter((i) => i.quantity > 0),
    })),
  clearCart: () => set({ cart: [] }),
  activeCategory: 'All',
  setActiveCategory: (cat) => set({ activeCategory: cat }),
}));
