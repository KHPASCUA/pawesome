export const demoItems = [
  {
    id: 1,
    name: "Premium Dog Food",
    sku: "PET-001",
    category: "Pet Food",
    brand: "Royal Paw",
    supplier: "Pet Supplies Inc.",
    quantity: 25,
    stock: 25,
    reorder_level: 10,
    price: 850,
    unit_price: 850,
    expiration: "2026-12-31",
    status: "In Stock",
    description: "Premium dry food for adult dogs.",
  },
  {
    id: 2,
    name: "Cat Shampoo",
    sku: "GRM-002",
    category: "Grooming",
    brand: "CleanPaws",
    supplier: "Grooming Depot",
    quantity: 8,
    stock: 8,
    reorder_level: 10,
    price: 220,
    unit_price: 220,
    expiration: "2027-03-15",
    status: "Low Stock",
    description: "Gentle shampoo for cats.",
  },
  {
    id: 3,
    name: "Pet Vitamins",
    sku: "HLT-003",
    category: "Health",
    brand: "VitaPet",
    supplier: "VetCare Supplies",
    quantity: 0,
    stock: 0,
    reorder_level: 5,
    price: 350,
    unit_price: 350,
    expiration: "2026-09-20",
    status: "Out of Stock",
    description: "Daily vitamins for pets.",
  },
];

export const inventoryProducts = demoItems;

export const stockMovements = [
  {
    id: 1,
    item_name: "Premium Dog Food",
    action: "Stock Added",
    quantity: 25,
    created_at: new Date().toISOString(),
    status: "completed",
  },
  {
    id: 2,
    item_name: "Cat Shampoo",
    action: "Stock Adjusted",
    quantity: -2,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    status: "completed",
  },
];

export const inventoryHistory = stockMovements;

export const inventoryReports = {
  totalProducts: demoItems.length,
  total_items: demoItems.length,

  lowStock: demoItems.filter(
    (item) => item.stock > 0 && item.stock <= item.reorder_level
  ).length,
  low_stock_items: demoItems.filter(
    (item) => item.stock > 0 && item.stock <= item.reorder_level
  ).length,

  outOfStock: demoItems.filter((item) => item.stock === 0).length,
  out_of_stock_items: demoItems.filter((item) => item.stock === 0).length,

  totalValue: demoItems.reduce(
    (sum, item) => sum + item.stock * item.unit_price,
    0
  ),
  total_stock_value: demoItems.reduce(
    (sum, item) => sum + item.stock * item.unit_price,
    0
  ),

  recent_transactions: stockMovements,
  critical_items: demoItems.filter(
    (item) => item.stock <= item.reorder_level
  ),
};

export const inventoryCategories = [
  "Pet Food",
  "Grooming",
  "Health",
  "Toys",
  "Accessories",
  "Services",
];

export const suppliers = [
  "Pet Supplies Inc.",
  "Grooming Depot",
  "VetCare Supplies",
];
