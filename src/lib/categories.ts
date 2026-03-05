import {
  Car, Wrench, ShoppingCart, Pill, Laptop, Shirt, Apple, Coffee,
  Scissors, Hammer, BookOpen, Heart, UtensilsCrossed, Cake, Store
} from 'lucide-react';

export interface BusinessCategory {
  id: string;
  name: string;
  icon: any;
  desc: string;
  theme: string;
  defaultCategories: string[];
}

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  { id: 'car_wash', name: 'Car Wash Center', icon: Car, desc: 'Wash, detailing, polish services', theme: 'car_wash', defaultCategories: ['Services', 'Accessories', 'Packages'] },
  { id: 'spare_parts', name: 'Spare Parts & Mods', icon: Wrench, desc: 'Parts, labour, modifications', theme: 'spare_parts', defaultCategories: ['Spare Parts', 'Accessories', 'Labour', 'Modification'] },
  { id: 'grocery', name: 'Grocery Store', icon: ShoppingCart, desc: 'Daily essentials, FMCG, packaged foods', theme: 'grocery', defaultCategories: ['Grocery', 'Dairy', 'Beverages', 'Snacks', 'Personal Care'] },
  { id: 'medical', name: 'Medical & Pharmacy', icon: Pill, desc: 'Medicines, health products', theme: 'medical', defaultCategories: ['Medicines', 'OTC', 'Health Devices', 'Personal Care'] },
  { id: 'electronics', name: 'Electronics Store', icon: Laptop, desc: 'Gadgets, accessories, repairs', theme: 'electronics', defaultCategories: ['Mobile', 'Accessories', 'Computers', 'Audio', 'Repair Services'] },
  { id: 'clothing', name: 'Clothing & Fashion', icon: Shirt, desc: 'Apparel, footwear, accessories', theme: 'clothing', defaultCategories: ['Men', 'Women', 'Kids', 'Footwear', 'Accessories'] },
  { id: 'fruits_veg', name: 'Fruits & Vegetables', icon: Apple, desc: 'Fresh produce, organic items', theme: 'fruits_veg', defaultCategories: ['Fruits', 'Vegetables', 'Herbs', 'Organic'] },
  { id: 'restaurant', name: 'Restaurant & Café', icon: Coffee, desc: 'Food, beverages, dine-in/takeaway', theme: 'restaurant', defaultCategories: ['Starters', 'Main Course', 'Beverages', 'Desserts'] },
  { id: 'bakery', name: 'Bakery & Sweets', icon: Cake, desc: 'Cakes, pastries, confectionery', theme: 'bakery', defaultCategories: ['Cakes', 'Pastries', 'Cookies', 'Sweets', 'Custom Orders'] },
  { id: 'salon', name: 'Beauty Salon & Spa', icon: Scissors, desc: 'Hair, skin, beauty services', theme: 'salon', defaultCategories: ['Haircut', 'Skin Care', 'Nail Art', 'Spa', 'Products'] },
  { id: 'hardware', name: 'Hardware & Tools', icon: Hammer, desc: 'Tools, paint, construction supplies', theme: 'hardware', defaultCategories: ['Tools', 'Paint', 'Electrical', 'Plumbing', 'Building Material'] },
  { id: 'stationery', name: 'Stationery & Books', icon: BookOpen, desc: 'Office supplies, books, art materials', theme: 'stationery', defaultCategories: ['Notebooks', 'Pens', 'Books', 'Art Supplies', 'Office'] },
  { id: 'pet_store', name: 'Pet Store', icon: Heart, desc: 'Pet food, accessories, grooming', theme: 'pet_store', defaultCategories: ['Dog', 'Cat', 'Fish', 'Bird', 'Grooming'] },
  { id: 'food_stall', name: 'Food Stall & Street Food', icon: UtensilsCrossed, desc: 'Quick bites, snacks, beverages', theme: 'food_stall', defaultCategories: ['Snacks', 'Beverages', 'Combos'] },
  { id: 'custom', name: 'Custom Business', icon: Store, desc: 'Start with a blank slate', theme: 'custom', defaultCategories: ['General', 'Products', 'Services'] },
];

export const getCategoryById = (id: string) => BUSINESS_CATEGORIES.find(c => c.id === id);
export const getCategoryName = (id: string) => getCategoryById(id)?.name || id;
export const getCategoryIcon = (id: string) => getCategoryById(id)?.icon || Store;
export const getCategoryDefaults = (id: string) => getCategoryById(id)?.defaultCategories || ['General'];

// Dashboard theme colors per category
export const THEME_PRESETS = {
  fire_orange: { primary: '24 95% 53%', accent: '4 90% 58%', label: 'Fire Orange' },
  ocean_blue: { primary: '210 90% 50%', accent: '195 85% 45%', label: 'Ocean Blue' },
  emerald: { primary: '152 69% 45%', accent: '165 70% 40%', label: 'Emerald Green' },
  royal_purple: { primary: '270 70% 55%', accent: '280 65% 50%', label: 'Royal Purple' },
} as const;

export type ThemePresetKey = keyof typeof THEME_PRESETS;
