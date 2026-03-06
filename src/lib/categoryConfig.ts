import {
  Car, Wrench, ShoppingCart, Pill, Laptop, Shirt, Apple, Coffee,
  Scissors, Hammer, BookOpen, Heart, UtensilsCrossed, Cake, Store,
  Droplets, Timer, Clock, Truck, Package, Scale, Thermometer,
  Smartphone, Monitor, Watch, Tag, Layers, Palette, Footprints,
  Leaf, Sun, CookingPot, IceCream, Sparkles, Brush, PaintBucket,
  Ruler, Lightbulb, PenTool, FileText, Dog, Fish, Bird, ShoppingBag
} from 'lucide-react';

export interface CategoryFeature {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface CategoryProductField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'toggle';
  options?: string[];
  placeholder?: string;
}

export interface CategoryConfig {
  id: string;
  name: string;
  icon: any;
  description: string;
  color: string;
  // Navigation customization
  navLabel: { home: string; workspace: string; billing: string; customers: string; settings: string };
  // Product-specific fields
  productFields: CategoryProductField[];
  // Customer-specific fields  
  customerFields: CategoryProductField[];
  // Billing features
  billingFeatures: {
    vehicleType: boolean;
    tableOrder: boolean;
    appointmentBooking: boolean;
    weightBased: boolean;
    serviceQueue: boolean;
    prescription: boolean;
    warranty: boolean;
    sizeVariants: boolean;
    comboMeals: boolean;
  };
  // Default product categories
  defaultCategories: string[];
  // Dashboard widgets
  dashboardWidgets: string[];
  // Vehicle types (if applicable)
  vehicleTypes?: string[];
  // Features list
  features: CategoryFeature[];
}

const BASE_FEATURES: CategoryFeature[] = [
  { id: 'billing', label: 'POS Billing', description: 'Point of sale system', enabled: true },
  { id: 'inventory', label: 'Inventory', description: 'Stock management', enabled: true },
  { id: 'customers', label: 'Customer CRM', description: 'Customer management', enabled: true },
  { id: 'offers', label: 'Offers & Coupons', description: 'Discount campaigns', enabled: true },
  { id: 'reports', label: 'Analytics', description: 'Revenue reports', enabled: true },
  { id: 'store', label: 'Online Store', description: 'Public store page', enabled: true },
];

export const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  car_wash: {
    id: 'car_wash', name: 'Car Wash Center', icon: Car, description: 'Wash, detailing, polish services',
    color: '210 90% 50%',
    navLabel: { home: 'Dashboard', workspace: 'Services', billing: 'Billing', customers: 'Customers', settings: 'Settings' },
    productFields: [
      { key: 'service_duration', label: 'Duration (min)', type: 'number', placeholder: '30' },
      { key: 'vehicle_category', label: 'Vehicle Category', type: 'select', options: ['All', 'Bike', 'Car', 'SUV', 'Truck'] },
    ],
    customerFields: [
      { key: 'vehicle_number', label: 'Vehicle Number', type: 'text', placeholder: 'MH01AB1234' },
      { key: 'vehicle_type', label: 'Vehicle Type', type: 'select', options: ['Car', 'Bike', 'Scooter', 'Auto', 'SUV', 'Truck'] },
    ],
    billingFeatures: { vehicleType: true, tableOrder: false, appointmentBooking: false, weightBased: false, serviceQueue: true, prescription: false, warranty: false, sizeVariants: false, comboMeals: false },
    defaultCategories: ['Services', 'Packages', 'Accessories', 'Detailing'],
    dashboardWidgets: ['todaySales', 'vehiclesServiced', 'popularService', 'serviceQueue'],
    vehicleTypes: ['Car', 'Bike', 'Scooter', 'Auto', 'SUV', 'Truck', 'Bus', 'Van'],
    features: [...BASE_FEATURES, { id: 'serviceQueue', label: 'Service Queue', description: 'Track washing queue', enabled: true }, { id: 'vehicleHistory', label: 'Vehicle History', description: 'Track vehicle service history', enabled: true }],
  },
  spare_parts: {
    id: 'spare_parts', name: 'Auto Parts & Mods', icon: Wrench, description: 'Parts, labour, modifications',
    color: '38 92% 50%',
    navLabel: { home: 'Dashboard', workspace: 'Parts', billing: 'Billing', customers: 'Customers', settings: 'Settings' },
    productFields: [
      { key: 'part_number', label: 'Part Number', type: 'text', placeholder: 'OEM-12345' },
      { key: 'compatibility', label: 'Vehicle Compatibility', type: 'text', placeholder: 'Honda Civic 2020+' },
      { key: 'warranty_months', label: 'Warranty (months)', type: 'number', placeholder: '6' },
    ],
    customerFields: [
      { key: 'vehicle_number', label: 'Vehicle Number', type: 'text', placeholder: 'MH01AB1234' },
      { key: 'vehicle_type', label: 'Vehicle Type', type: 'select', options: ['Car', 'Bike', 'Scooter', 'Auto', 'SUV', 'Truck'] },
    ],
    billingFeatures: { vehicleType: true, tableOrder: false, appointmentBooking: false, weightBased: false, serviceQueue: false, prescription: false, warranty: true, sizeVariants: false, comboMeals: false },
    defaultCategories: ['Spare Parts', 'Accessories', 'Labour', 'Modification', 'Oils & Fluids'],
    dashboardWidgets: ['todaySales', 'lowStock', 'topProducts', 'warrantyAlerts'],
    vehicleTypes: ['Car', 'Bike', 'Scooter', 'Auto', 'SUV', 'Truck'],
    features: [...BASE_FEATURES, { id: 'warranty', label: 'Warranty Tracking', description: 'Track part warranties', enabled: true }],
  },
  grocery: {
    id: 'grocery', name: 'Grocery Store', icon: ShoppingCart, description: 'Daily essentials, FMCG, packaged foods',
    color: '152 69% 45%',
    navLabel: { home: 'Dashboard', workspace: 'Products', billing: 'POS', customers: 'Customers', settings: 'Settings' },
    productFields: [
      { key: 'weight_unit', label: 'Weight Unit', type: 'select', options: ['kg', 'g', 'L', 'ml', 'pcs'] },
      { key: 'expiry_alert', label: 'Expiry Alert', type: 'toggle' },
    ],
    customerFields: [],
    billingFeatures: { vehicleType: false, tableOrder: false, appointmentBooking: false, weightBased: true, serviceQueue: false, prescription: false, warranty: false, sizeVariants: false, comboMeals: false },
    defaultCategories: ['Grocery', 'Dairy', 'Beverages', 'Snacks', 'Personal Care', 'Household', 'Frozen'],
    dashboardWidgets: ['todaySales', 'lowStock', 'expiryAlerts', 'topProducts'],
    features: [...BASE_FEATURES, { id: 'expiryTracking', label: 'Expiry Tracking', description: 'Track product expiry dates', enabled: true }],
  },
  medical: {
    id: 'medical', name: 'Medical & Pharmacy', icon: Pill, description: 'Medicines, health products',
    color: '0 84% 60%',
    navLabel: { home: 'Dashboard', workspace: 'Medicines', billing: 'POS', customers: 'Patients', settings: 'Settings' },
    productFields: [
      { key: 'batch_number', label: 'Batch Number', type: 'text', placeholder: 'BATCH-001' },
      { key: 'expiry_date', label: 'Expiry Date', type: 'text', placeholder: 'MM/YYYY' },
      { key: 'manufacturer', label: 'Manufacturer', type: 'text', placeholder: 'Cipla' },
      { key: 'drug_type', label: 'Drug Type', type: 'select', options: ['OTC', 'Prescription', 'Schedule H', 'Schedule H1', 'Ayurvedic'] },
    ],
    customerFields: [
      { key: 'prescription_ref', label: 'Prescription Ref', type: 'text', placeholder: 'DR-001' },
    ],
    billingFeatures: { vehicleType: false, tableOrder: false, appointmentBooking: false, weightBased: false, serviceQueue: false, prescription: true, warranty: false, sizeVariants: false, comboMeals: false },
    defaultCategories: ['Medicines', 'OTC', 'Health Devices', 'Personal Care', 'Ayurvedic', 'Surgical'],
    dashboardWidgets: ['todaySales', 'lowStock', 'expiryAlerts', 'prescriptionCount'],
    features: [...BASE_FEATURES, { id: 'expiryTracking', label: 'Expiry Tracking', description: 'Track medicine expiry', enabled: true }, { id: 'prescription', label: 'Prescriptions', description: 'Link prescriptions to sales', enabled: true }],
  },
  electronics: {
    id: 'electronics', name: 'Electronics Store', icon: Laptop, description: 'Gadgets, accessories, repairs',
    color: '270 70% 55%',
    navLabel: { home: 'Dashboard', workspace: 'Products', billing: 'POS', customers: 'Customers', settings: 'Settings' },
    productFields: [
      { key: 'serial_number', label: 'Serial Number', type: 'text', placeholder: 'SN-12345' },
      { key: 'warranty_months', label: 'Warranty (months)', type: 'number', placeholder: '12' },
      { key: 'model_number', label: 'Model', type: 'text', placeholder: 'iPhone 15 Pro' },
    ],
    customerFields: [],
    billingFeatures: { vehicleType: false, tableOrder: false, appointmentBooking: false, weightBased: false, serviceQueue: false, prescription: false, warranty: true, sizeVariants: false, comboMeals: false },
    defaultCategories: ['Mobile', 'Accessories', 'Computers', 'Audio', 'Repair Services', 'TV & Display'],
    dashboardWidgets: ['todaySales', 'lowStock', 'warrantyAlerts', 'topProducts'],
    features: [...BASE_FEATURES, { id: 'warranty', label: 'Warranty Management', description: 'Track product warranties', enabled: true }, { id: 'imei', label: 'IMEI Tracking', description: 'Track phone IMEI numbers', enabled: true }],
  },
  clothing: {
    id: 'clothing', name: 'Fashion & Clothing', icon: Shirt, description: 'Apparel, footwear, accessories',
    color: '330 70% 55%',
    navLabel: { home: 'Dashboard', workspace: 'Collection', billing: 'POS', customers: 'Customers', settings: 'Settings' },
    productFields: [
      { key: 'sizes', label: 'Available Sizes', type: 'text', placeholder: 'S, M, L, XL, XXL' },
      { key: 'colors', label: 'Colors', type: 'text', placeholder: 'Red, Blue, Black' },
      { key: 'material', label: 'Material', type: 'text', placeholder: 'Cotton' },
    ],
    customerFields: [],
    billingFeatures: { vehicleType: false, tableOrder: false, appointmentBooking: false, weightBased: false, serviceQueue: false, prescription: false, warranty: false, sizeVariants: true, comboMeals: false },
    defaultCategories: ['Men', 'Women', 'Kids', 'Footwear', 'Accessories', 'Ethnic'],
    dashboardWidgets: ['todaySales', 'lowStock', 'topProducts', 'seasonalTrends'],
    features: [...BASE_FEATURES, { id: 'sizeVariants', label: 'Size & Color Variants', description: 'Manage product variants', enabled: true }],
  },
  fruits_veg: {
    id: 'fruits_veg', name: 'Fruits & Vegetables', icon: Apple, description: 'Fresh produce, organic items',
    color: '120 60% 45%',
    navLabel: { home: 'Dashboard', workspace: 'Produce', billing: 'POS', customers: 'Customers', settings: 'Settings' },
    productFields: [
      { key: 'weight_unit', label: 'Unit', type: 'select', options: ['kg', 'g', 'dozen', 'pcs', 'bunch'] },
      { key: 'is_organic', label: 'Organic', type: 'toggle' },
    ],
    customerFields: [],
    billingFeatures: { vehicleType: false, tableOrder: false, appointmentBooking: false, weightBased: true, serviceQueue: false, prescription: false, warranty: false, sizeVariants: false, comboMeals: false },
    defaultCategories: ['Fruits', 'Vegetables', 'Herbs', 'Organic', 'Seasonal'],
    dashboardWidgets: ['todaySales', 'lowStock', 'dailyPricing', 'topProducts'],
    features: [...BASE_FEATURES, { id: 'dailyPricing', label: 'Daily Pricing', description: 'Update prices daily', enabled: true }],
  },
  restaurant: {
    id: 'restaurant', name: 'Restaurant & Café', icon: Coffee, description: 'Food, beverages, dine-in/takeaway',
    color: '25 85% 55%',
    navLabel: { home: 'Dashboard', workspace: 'Menu', billing: 'Orders', customers: 'Customers', settings: 'Settings' },
    productFields: [
      { key: 'prep_time', label: 'Prep Time (min)', type: 'number', placeholder: '15' },
      { key: 'is_veg', label: 'Veg/Non-Veg', type: 'select', options: ['Veg', 'Non-Veg', 'Egg'] },
      { key: 'spice_level', label: 'Spice Level', type: 'select', options: ['Mild', 'Medium', 'Spicy', 'Extra Spicy'] },
    ],
    customerFields: [
      { key: 'table_number', label: 'Table Number', type: 'text', placeholder: 'T-01' },
    ],
    billingFeatures: { vehicleType: false, tableOrder: true, appointmentBooking: false, weightBased: false, serviceQueue: false, prescription: false, warranty: false, sizeVariants: false, comboMeals: true },
    defaultCategories: ['Starters', 'Main Course', 'Beverages', 'Desserts', 'Combos', 'Snacks'],
    dashboardWidgets: ['todaySales', 'activeOrders', 'popularItems', 'tableStatus'],
    features: [...BASE_FEATURES, { id: 'tableOrder', label: 'Table Orders', description: 'Table-based ordering', enabled: true }, { id: 'kot', label: 'Kitchen Display', description: 'Kitchen order tickets', enabled: true }],
  },
  bakery: {
    id: 'bakery', name: 'Bakery & Sweets', icon: Cake, description: 'Cakes, pastries, confectionery',
    color: '340 75% 55%',
    navLabel: { home: 'Dashboard', workspace: 'Products', billing: 'POS', customers: 'Customers', settings: 'Settings' },
    productFields: [
      { key: 'weight_unit', label: 'Unit', type: 'select', options: ['kg', 'g', 'pcs', 'box'] },
      { key: 'is_eggless', label: 'Eggless', type: 'toggle' },
    ],
    customerFields: [],
    billingFeatures: { vehicleType: false, tableOrder: false, appointmentBooking: false, weightBased: true, serviceQueue: false, prescription: false, warranty: false, sizeVariants: false, comboMeals: false },
    defaultCategories: ['Cakes', 'Pastries', 'Cookies', 'Sweets', 'Custom Orders', 'Bread'],
    dashboardWidgets: ['todaySales', 'lowStock', 'customOrders', 'topProducts'],
    features: [...BASE_FEATURES, { id: 'customOrders', label: 'Custom Orders', description: 'Manage cake orders', enabled: true }],
  },
  salon: {
    id: 'salon', name: 'Beauty Salon & Spa', icon: Scissors, description: 'Hair, skin, beauty services',
    color: '300 60% 55%',
    navLabel: { home: 'Dashboard', workspace: 'Services', billing: 'Billing', customers: 'Clients', settings: 'Settings' },
    productFields: [
      { key: 'duration_min', label: 'Duration (min)', type: 'number', placeholder: '30' },
      { key: 'staff_required', label: 'Staff Required', type: 'text', placeholder: 'Stylist' },
    ],
    customerFields: [
      { key: 'preferred_stylist', label: 'Preferred Stylist', type: 'text', placeholder: 'Priya' },
    ],
    billingFeatures: { vehicleType: false, tableOrder: false, appointmentBooking: true, weightBased: false, serviceQueue: true, prescription: false, warranty: false, sizeVariants: false, comboMeals: false },
    defaultCategories: ['Haircut', 'Skin Care', 'Nail Art', 'Spa', 'Makeup', 'Products'],
    dashboardWidgets: ['todaySales', 'todayAppointments', 'popularServices', 'clientRetention'],
    features: [...BASE_FEATURES, { id: 'appointments', label: 'Appointments', description: 'Booking management', enabled: true }],
  },
  hardware: {
    id: 'hardware', name: 'Hardware & Tools', icon: Hammer, description: 'Tools, paint, construction supplies',
    color: '200 70% 50%',
    navLabel: { home: 'Dashboard', workspace: 'Products', billing: 'POS', customers: 'Customers', settings: 'Settings' },
    productFields: [
      { key: 'unit', label: 'Unit', type: 'select', options: ['pcs', 'kg', 'meter', 'feet', 'liter', 'bag', 'box'] },
    ],
    customerFields: [],
    billingFeatures: { vehicleType: false, tableOrder: false, appointmentBooking: false, weightBased: false, serviceQueue: false, prescription: false, warranty: false, sizeVariants: false, comboMeals: false },
    defaultCategories: ['Tools', 'Paint', 'Electrical', 'Plumbing', 'Building Material', 'Fasteners'],
    dashboardWidgets: ['todaySales', 'lowStock', 'topProducts', 'supplierOrders'],
    features: BASE_FEATURES,
  },
  stationery: {
    id: 'stationery', name: 'Stationery & Books', icon: BookOpen, description: 'Office supplies, books, art materials',
    color: '45 80% 50%',
    navLabel: { home: 'Dashboard', workspace: 'Products', billing: 'POS', customers: 'Customers', settings: 'Settings' },
    productFields: [],
    customerFields: [],
    billingFeatures: { vehicleType: false, tableOrder: false, appointmentBooking: false, weightBased: false, serviceQueue: false, prescription: false, warranty: false, sizeVariants: false, comboMeals: false },
    defaultCategories: ['Notebooks', 'Pens', 'Books', 'Art Supplies', 'Office', 'School Kits'],
    dashboardWidgets: ['todaySales', 'lowStock', 'topProducts'],
    features: BASE_FEATURES,
  },
  pet_store: {
    id: 'pet_store', name: 'Pet Store', icon: Heart, description: 'Pet food, accessories, grooming',
    color: '15 75% 55%',
    navLabel: { home: 'Dashboard', workspace: 'Products', billing: 'POS', customers: 'Pet Parents', settings: 'Settings' },
    productFields: [
      { key: 'pet_type', label: 'Pet Type', type: 'select', options: ['Dog', 'Cat', 'Fish', 'Bird', 'Rabbit', 'Hamster', 'All'] },
    ],
    customerFields: [
      { key: 'pet_name', label: 'Pet Name', type: 'text', placeholder: 'Buddy' },
      { key: 'pet_breed', label: 'Pet Breed', type: 'text', placeholder: 'Golden Retriever' },
    ],
    billingFeatures: { vehicleType: false, tableOrder: false, appointmentBooking: false, weightBased: false, serviceQueue: false, prescription: false, warranty: false, sizeVariants: false, comboMeals: false },
    defaultCategories: ['Dog', 'Cat', 'Fish', 'Bird', 'Grooming', 'Accessories'],
    dashboardWidgets: ['todaySales', 'lowStock', 'topProducts'],
    features: [...BASE_FEATURES, { id: 'grooming', label: 'Grooming Services', description: 'Pet grooming appointments', enabled: true }],
  },
  food_stall: {
    id: 'food_stall', name: 'Food Stall & Street Food', icon: UtensilsCrossed, description: 'Quick bites, snacks, beverages',
    color: '0 75% 55%',
    navLabel: { home: 'Dashboard', workspace: 'Menu', billing: 'Orders', customers: 'Customers', settings: 'Settings' },
    productFields: [
      { key: 'is_veg', label: 'Type', type: 'select', options: ['Veg', 'Non-Veg', 'Egg'] },
    ],
    customerFields: [],
    billingFeatures: { vehicleType: false, tableOrder: false, appointmentBooking: false, weightBased: false, serviceQueue: false, prescription: false, warranty: false, sizeVariants: false, comboMeals: true },
    defaultCategories: ['Snacks', 'Beverages', 'Combos', 'Specials'],
    dashboardWidgets: ['todaySales', 'topProducts', 'peakHours'],
    features: BASE_FEATURES,
  },
  custom: {
    id: 'custom', name: 'Custom Business', icon: Store, description: 'Start with a blank slate',
    color: '220 70% 55%',
    navLabel: { home: 'Dashboard', workspace: 'Products', billing: 'Billing', customers: 'Customers', settings: 'Settings' },
    productFields: [],
    customerFields: [],
    billingFeatures: { vehicleType: false, tableOrder: false, appointmentBooking: false, weightBased: false, serviceQueue: false, prescription: false, warranty: false, sizeVariants: false, comboMeals: false },
    defaultCategories: ['General', 'Products', 'Services'],
    dashboardWidgets: ['todaySales', 'lowStock', 'topProducts'],
    features: BASE_FEATURES,
  },
};

export const getCategoryConfig = (categoryId: string): CategoryConfig => {
  return CATEGORY_CONFIGS[categoryId] || CATEGORY_CONFIGS.custom;
};

// Printer brands and models
export interface PrinterBrand {
  id: string;
  name: string;
  models: string[];
  connectionType: ('bluetooth' | 'usb' | 'wifi' | 'network')[];
}

export const PRINTER_BRANDS: PrinterBrand[] = [
  { id: 'ezo', name: 'Ezo', models: ['Ezo POS 58mm', 'Ezo POS 80mm'], connectionType: ['bluetooth'] },
  { id: 'epson', name: 'Epson', models: ['TM-T20III', 'TM-T82III', 'TM-T88VII', 'TM-M30II'], connectionType: ['usb', 'bluetooth', 'network'] },
  { id: 'canon', name: 'Canon', models: ['SELPHY CP1500', 'PIXMA G3020'], connectionType: ['usb', 'wifi'] },
  { id: 'hp', name: 'HP', models: ['LaserJet Pro M404', 'Smart Tank 515', 'OfficeJet Pro 9015'], connectionType: ['usb', 'wifi'] },
  { id: 'samsung', name: 'Samsung', models: ['Bixolon SRP-350III', 'Bixolon SRP-Q300'], connectionType: ['usb', 'bluetooth'] },
  { id: 'sunmi', name: 'SUNMI', models: ['SUNMI V1', 'SUNMI V2', 'SUNMI V2 Pro', 'SUNMI T2 Mini'], connectionType: ['bluetooth', 'usb'] },
  { id: 'star', name: 'Star Micronics', models: ['TSP143IV', 'mPOP', 'SM-L200'], connectionType: ['bluetooth', 'usb', 'wifi'] },
  { id: 'citizen', name: 'Citizen', models: ['CT-E651', 'CT-S310II', 'CMP-30II'], connectionType: ['usb', 'bluetooth'] },
  { id: 'other', name: 'Other', models: ['Generic 58mm', 'Generic 80mm', 'Custom'], connectionType: ['bluetooth', 'usb'] },
];

// Dashboard theme presets expanded
export const DASHBOARD_THEMES = {
  fire_orange: { primary: '24 95% 53%', accent: '4 90% 58%', label: 'Fire Orange', emoji: '🔥' },
  ocean_blue: { primary: '210 90% 50%', accent: '195 85% 45%', label: 'Ocean Blue', emoji: '🌊' },
  emerald: { primary: '152 69% 45%', accent: '165 70% 40%', label: 'Emerald Green', emoji: '💎' },
  royal_purple: { primary: '270 70% 55%', accent: '280 65% 50%', label: 'Royal Purple', emoji: '👑' },
  midnight: { primary: '220 80% 55%', accent: '240 70% 50%', label: 'Midnight Blue', emoji: '🌙' },
  cherry: { primary: '350 80% 55%', accent: '330 75% 50%', label: 'Cherry Red', emoji: '🍒' },
  forest: { primary: '140 60% 40%', accent: '160 55% 35%', label: 'Forest Green', emoji: '🌲' },
  sunset: { primary: '30 90% 55%', accent: '15 85% 50%', label: 'Sunset Gold', emoji: '🌅' },
} as const;

export type DashboardThemeKey = keyof typeof DASHBOARD_THEMES;
