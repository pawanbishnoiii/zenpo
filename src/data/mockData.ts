import { Product } from '@/store/useAppStore';

export const categories = ['All', 'Car Wash', 'Spare Parts', 'Accessories', 'Services', 'Labour', 'Modification'];

// Car Wash Center products
export const carWashProducts: Product[] = [
  { id: '1', name: 'Premium Car Wash', description: 'Full exterior and interior cleaning', category: 'Car Wash', sku: 'CW-001', barcode: '8901234567890', price: 499, discountPrice: 449, taxPercent: 18, stock: 999, imageUrl: '' },
  { id: '2', name: 'Foam Wash', description: 'Foam-based deep cleaning', category: 'Car Wash', sku: 'CW-002', barcode: '8901234567893', price: 799, discountPrice: 749, taxPercent: 18, stock: 999, imageUrl: '' },
  { id: '3', name: 'Interior Detailing', description: 'Full interior deep clean', category: 'Services', sku: 'SV-001', barcode: '8901234567896', price: 1499, discountPrice: 1299, taxPercent: 18, stock: 999, imageUrl: '' },
  { id: '4', name: 'Exterior Polish', description: 'Wax & polish treatment', category: 'Services', sku: 'SV-002', barcode: '8901234567897', price: 999, discountPrice: 899, taxPercent: 18, stock: 999, imageUrl: '' },
  { id: '5', name: 'Engine Cleaning', description: 'Engine bay wash & degrease', category: 'Services', sku: 'SV-003', barcode: '8901234567898', price: 699, discountPrice: 649, taxPercent: 18, stock: 999, imageUrl: '' },
  { id: '6', name: 'Car Perfume', description: 'Long lasting car fragrance', category: 'Accessories', sku: 'AC-001', barcode: '8901234567894', price: 299, discountPrice: 249, taxPercent: 12, stock: 120, imageUrl: '' },
  { id: '7', name: 'Dashboard Polish', description: 'Silicone dashboard spray', category: 'Accessories', sku: 'AC-003', barcode: '8901234567899', price: 199, discountPrice: 179, taxPercent: 12, stock: 200, imageUrl: '' },
  { id: '8', name: 'Tyre Shine', description: 'Tyre polish & blackener', category: 'Accessories', sku: 'AC-004', barcode: '8901234567900', price: 149, discountPrice: 129, taxPercent: 12, stock: 150, imageUrl: '' },
];

// Spare Parts & Modification products
export const sparePartsProducts: Product[] = [
  { id: '9', name: 'Engine Oil 5W-30', description: 'Synthetic engine oil 4L', category: 'Spare Parts', sku: 'SP-001', barcode: '8901234567891', price: 1899, discountPrice: 1699, taxPercent: 18, stock: 45, imageUrl: '' },
  { id: '10', name: 'Air Filter', description: 'High performance air filter', category: 'Spare Parts', sku: 'SP-002', barcode: '8901234567892', price: 650, discountPrice: 599, taxPercent: 18, stock: 30, imageUrl: '' },
  { id: '11', name: 'Brake Pad Set', description: 'Front brake pad set', category: 'Spare Parts', sku: 'SP-003', barcode: '8901234567895', price: 2400, discountPrice: 2199, taxPercent: 18, stock: 15, imageUrl: '' },
  { id: '12', name: 'Oil Filter', description: 'Premium oil filter', category: 'Spare Parts', sku: 'SP-004', barcode: '8901234567901', price: 350, discountPrice: 299, taxPercent: 18, stock: 60, imageUrl: '' },
  { id: '13', name: 'LED Headlight Kit', description: 'H4 LED conversion kit', category: 'Modification', sku: 'MD-001', barcode: '8901234567902', price: 2999, discountPrice: 2499, taxPercent: 18, stock: 20, imageUrl: '' },
  { id: '14', name: 'Alloy Wheels 15"', description: 'Set of 4 alloy wheels', category: 'Modification', sku: 'MD-002', barcode: '8901234567903', price: 12000, discountPrice: 10999, taxPercent: 18, stock: 8, imageUrl: '' },
  { id: '15', name: 'Oil Change Labour', description: 'Engine oil change service', category: 'Labour', sku: 'LB-001', barcode: '8901234567904', price: 500, discountPrice: 400, taxPercent: 18, stock: 999, imageUrl: '' },
  { id: '16', name: 'Brake Service Labour', description: 'Brake pad replacement', category: 'Labour', sku: 'LB-002', barcode: '8901234567905', price: 800, discountPrice: 700, taxPercent: 18, stock: 999, imageUrl: '' },
];

// Default combined
export const mockProducts: Product[] = [...carWashProducts, ...sparePartsProducts];

export const dashboardStats = {
  todaySales: 12450,
  monthlySales: 345600,
  totalProducts: 156,
  lowStockItems: 8,
};

export const revenueData = [
  { name: 'Mon', revenue: 4200 },
  { name: 'Tue', revenue: 3800 },
  { name: 'Wed', revenue: 5100 },
  { name: 'Thu', revenue: 4600 },
  { name: 'Fri', revenue: 6200 },
  { name: 'Sat', revenue: 8100 },
  { name: 'Sun', revenue: 5400 },
];
