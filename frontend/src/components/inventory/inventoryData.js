/**
 * UNIFIED INVENTORY DATA
 * 
 * This file now imports from the centralized inventorySync.js
 * to ensure all dashboards (Admin, Inventory, Cashier, Customer)
 * use the SAME demo fallback data.
 * 
 * TO ADD NEW ITEMS: Edit /src/components/shared/inventorySync.js
 */

import { sharedProducts, sharedServices } from '../shared/inventorySync';

// Transform shared products to inventory format (with IDs as strings)
const transformToInventoryFormat = (item) => ({
  id: item.sku || `INV-${String(item.id).padStart(3, '0')}`,
  name: item.name,
  sku: item.sku,
  brand: item.brand,
  supplier: item.supplier,
  category: item.category,
  price: item.price,
  quantity: item.stock,
  expiration: item.expiration,
  status: item.stock === 0 ? 'Out of stock' : item.stock <= item.minStock ? 'Low stock' : 'In stock',
  description: item.description,
});

// Export unified inventory items (products + services)
export const inventoryItems = [
  ...sharedProducts.map(transformToInventoryFormat),
  ...sharedServices.map(transformToInventoryFormat)
];

// Re-export for backward compatibility
export { sharedProducts, sharedServices };

// Pet store inventory history
export const inventoryHistory = [
  {
    id: "HIS-001",
    date: "2026-03-30 09:45",
    product: "Premium Dog Food 5kg",
    action: "Restocked",
    quantity: 24,
    user: "Admin",
    note: "Weekly delivery",
  },
  {
    id: "HIS-002",
    date: "2026-03-29 15:12",
    product: "Cat Kibble 2kg",
    action: "Sale",
    quantity: 8,
    user: "Cashier",
    note: "Customer purchase",
  },
  {
    id: "HIS-003",
    date: "2026-03-28 11:30",
    product: "Pet Shampoo 500ml",
    action: "Restocked",
    quantity: 30,
    user: "Admin",
    note: "Grooming supplies",
  },
  {
    id: "HIS-004",
    date: "2026-03-27 18:05",
    product: "Leather Dog Collar",
    action: "Sale",
    quantity: 5,
    user: "Cashier",
    note: "Evening sales",
  },
  {
    id: "HIS-005",
    date: "2026-03-26 14:20",
    product: "Flea Treatment",
    action: "Restocked",
    quantity: 20,
    user: "Admin",
    note: "Health products",
  },
  {
    id: "HIS-006",
    date: "2026-03-25 10:10",
    product: "Squeaky Toy Set",
    action: "Sale",
    quantity: 12,
    user: "Cashier",
    note: "Morning rush",
  },
];
