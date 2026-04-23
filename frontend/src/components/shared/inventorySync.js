/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║           UNIFIED INVENTORY DATA - SINGLE SOURCE OF TRUTH        ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Used by: CashierPOS, CustomerStore, InventoryReports, Admin      ║
 * ║  Features: FIFO tracking, expiration dates, stock management     ║
 * ║  Refresh: 30-second auto-refresh for live data                   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  HOW TO ADD NEW INVENTORY ITEMS:                                │
 * │                                                                 │
 * │  1. Scroll down to sharedProducts array below                  │
 * │  2. Copy an existing item object (everything inside {})        │
 * │  3. Paste after the last item (before the ];)                   │
 * │  4. Update all fields with new product info                     │
 * │  5. Make sure id is unique (increment by 1)                     │
 * │  6. Save file - all dashboards will show the new item!         │
 * │                                                                 │
 * │  IMPORTANT: If backend API is running, items should be added  │
 * │  through the Inventory Management UI or API, not here.          │
 * │  This file is only for DEMO/FALLBACK data when API is offline. │
 * └─────────────────────────────────────────────────────────────────┘
 */

export const sharedProducts = [
  { 
    id: 1, 
    name: "Premium Dog Food 5kg", 
    price: 1200, 
    category: "Food", 
    inStock: true, 
    stock: 50, 
    minStock: 10,
    sku: "PDF-5KG-001", 
    description: "High-quality nutrition for adult dogs", 
    image: "🦴", 
    rating: 4.5, 
    reviews: 128, 
    discount: 10,
    brand: "Pawsome Premium",
    supplier: "Pet Nutrition Co.",
    expiration: "2026-12-10",
    receivedDate: "2026-03-01",
    batchNumber: "B001",
    location: "A1-01"
  },
  { 
    id: 2, 
    name: "Cat Kibble 2kg", 
    price: 850, 
    category: "Food", 
    inStock: true, 
    stock: 30, 
    minStock: 5,
    sku: "CK-2KG-002", 
    description: "Balanced diet for cats", 
    image: "🐟", 
    rating: 4.2, 
    reviews: 89, 
    discount: 0,
    brand: "Whisker Delight",
    supplier: "Feline Nutrition Ltd.",
    expiration: "2026-11-05",
    receivedDate: "2026-03-15",
    batchNumber: "B002",
    location: "A1-02"
  },
  { 
    id: 3, 
    name: "Puppy Starter Kit", 
    price: 750, 
    category: "Food", 
    inStock: true, 
    stock: 20, 
    minStock: 5,
    sku: "PSK-008", 
    description: "Complete nutrition kit for puppies", 
    image: "🍼", 
    rating: 4.8, 
    reviews: 203, 
    discount: 15,
    brand: "Pawsome Beginnings",
    supplier: "Pet Nutrition Co.",
    expiration: "2026-10-15",
    receivedDate: "2026-02-20",
    batchNumber: "B003",
    location: "A1-03"
  },
  { 
    id: 4, 
    name: "Leather Dog Collar", 
    price: 450, 
    category: "Accessories", 
    inStock: true, 
    stock: 25, 
    minStock: 5,
    sku: "LDC-003", 
    description: "Durable leather collar with metal buckle", 
    image: "🦮", 
    rating: 4.3, 
    reviews: 234, 
    discount: 5,
    brand: "Pawsome Accessories",
    supplier: "Pet Style Co.",
    expiration: null,
    receivedDate: "2026-01-10",
    batchNumber: "B004",
    location: "B2-01"
  },
  { 
    id: 5, 
    name: "Pet Bed Medium", 
    price: 650, 
    category: "Accessories", 
    inStock: true, 
    stock: 15, 
    minStock: 3,
    sku: "PBM-009", 
    description: "Soft cushioned bed for medium pets", 
    image: "🛏️", 
    rating: 4.7, 
    reviews: 189, 
    discount: 10,
    brand: "Cozy Paws",
    supplier: "Comfort Pet Supplies",
    expiration: null,
    receivedDate: "2026-02-01",
    batchNumber: "B005",
    location: "B2-02"
  },
  { 
    id: 6, 
    name: "Pet Carrier Small", 
    price: 950, 
    category: "Accessories", 
    inStock: false, 
    stock: 0, 
    minStock: 2,
    sku: "PCS-006", 
    description: "Comfortable travel carrier for small pets", 
    image: "🧳", 
    rating: 4.6, 
    reviews: 98, 
    discount: 0,
    brand: "Travel Paws",
    supplier: "Pet Travel Co.",
    expiration: null,
    receivedDate: "2025-12-01",
    batchNumber: "B006",
    location: "B2-03"
  },
  { 
    id: 7, 
    name: "Pet Shampoo 500ml", 
    price: 280, 
    category: "Grooming", 
    inStock: true, 
    stock: 40, 
    minStock: 10,
    sku: "PS-500-004", 
    description: "Gentle cleansing formula for pets", 
    image: "🧴", 
    rating: 4.5, 
    reviews: 312, 
    discount: 0,
    brand: "Fresh & Clean",
    supplier: "Grooming Essentials",
    expiration: "2027-02-12",
    receivedDate: "2026-03-10",
    batchNumber: "B007",
    location: "C3-01"
  },
  { 
    id: 8, 
    name: "Squeaky Toy Set", 
    price: 180, 
    category: "Toys", 
    inStock: true, 
    stock: 60, 
    minStock: 15,
    sku: "STS-005", 
    description: "3-piece fun toy set for dogs", 
    image: "⚽", 
    rating: 4.6, 
    reviews: 289, 
    discount: 10,
    brand: "PlayTime",
    supplier: "Pet Toys Inc.",
    expiration: null,
    receivedDate: "2026-01-20",
    batchNumber: "B008",
    location: "D4-01"
  },
  { 
    id: 9, 
    name: "Flea Treatment", 
    price: 380, 
    category: "Health", 
    inStock: true, 
    stock: 35, 
    minStock: 10,
    sku: "FT-007", 
    description: "Monthly flea and tick prevention", 
    image: "🛡️", 
    rating: 4.3, 
    reviews: 412, 
    discount: 0,
    brand: "Guardian",
    supplier: "Pet Health Solutions",
    expiration: "2027-05-20",
    receivedDate: "2026-03-05",
    batchNumber: "B009",
    location: "E5-01"
  },
  { 
    id: 10, 
    name: "Dental Chew Sticks", 
    price: 220, 
    category: "Health", 
    inStock: true, 
    stock: 45, 
    minStock: 10,
    sku: "DCS-010", 
    description: "Dental care treats for dogs", 
    image: "🦷", 
    rating: 4.4, 
    reviews: 189, 
    discount: 15,
    brand: "Oral Care",
    supplier: "Pet Health Solutions",
    expiration: "2026-09-08",
    receivedDate: "2026-02-25",
    batchNumber: "B010",
    location: "E5-02"
  },
];

export const sharedServices = [
  { id: 101, name: "Full Grooming Service", price: 650, category: "Services", description: "Bath, haircut, nail trim, ear cleaning", image: "✂️", rating: 4.8, reviews: 523, discount: 0, inStock: true },
  { id: 102, name: "Vet Consultation", price: 500, category: "Services", description: "Basic health check and consultation", image: "🩺", rating: 4.7, reviews: 312, discount: 0, inStock: true },
  { id: 103, name: "Pet Boarding (Daily)", price: 450, category: "Services", description: "Day care and overnight boarding", image: "🏨", rating: 4.5, reviews: 245, discount: 10, inStock: true },
  { id: 104, name: "Vaccination", price: 350, category: "Services", description: "Core vaccines for dogs/cats", image: "💉", rating: 4.6, reviews: 189, discount: 0, inStock: true },
];

// Categorize products for CustomerStore
export const categorizeProducts = (products) => {
  const categories = {
    Food: [],
    Accessories: [],
    Grooming: [],
    Toys: [],
    Health: [],
    Services: []
  };
  
  products.forEach(product => {
    const cat = product.category;
    if (categories[cat]) {
      categories[cat].push(product);
    }
  });
  
  return categories;
};

// FIFO Helper: Sort by received date (oldest first)
export const sortByFIFO = (items) => {
  return [...items].sort((a, b) => new Date(a.receivedDate) - new Date(b.receivedDate));
};

// Check if item is near expiration (within 30 days)
export const isNearExpiration = (expirationDate, daysThreshold = 30) => {
  if (!expirationDate) return false;
  const today = new Date();
  const exp = new Date(expirationDate);
  const diffTime = exp - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= daysThreshold && diffDays > 0;
};

// Check if item is expired
export const isExpired = (expirationDate) => {
  if (!expirationDate) return false;
  const today = new Date();
  const exp = new Date(expirationDate);
  return exp < today;
};

// Get stock status with FIFO consideration
export const getStockStatus = (item) => {
  if (item.stock === 0) return { label: "Out of Stock", color: "#ef4444", severity: "critical" };
  if (isExpired(item.expiration)) return { label: "Expired", color: "#dc2626", severity: "critical" };
  if (isNearExpiration(item.expiration)) return { label: "Near Expiration", color: "#f59e0b", severity: "warning" };
  if (item.stock <= item.minStock) return { label: "Low Stock", color: "#f97316", severity: "warning" };
  return { label: "In Stock", color: "#22c55e", severity: "good" };
};

// Update stock across all dashboards (simulated - in production this would be API call)
export const updateStock = (itemId, quantityChange, allItems) => {
  return allItems.map(item => {
    if (item.id === itemId) {
      const newStock = Math.max(0, item.stock + quantityChange);
      return { 
        ...item, 
        stock: newStock, 
        inStock: newStock > 0,
        lastUpdated: new Date().toISOString()
      };
    }
    return item;
  });
};

// Get inventory summary for dashboard
export const getInventorySummary = (items) => {
  const total = items.length;
  const inStock = items.filter(i => i.stock > 0).length;
  const outOfStock = items.filter(i => i.stock === 0).length;
  const lowStock = items.filter(i => i.stock > 0 && i.stock <= i.minStock).length;
  const nearExpiration = items.filter(i => isNearExpiration(i.expiration)).length;
  const expired = items.filter(i => isExpired(i.expiration)).length;
  const totalValue = items.reduce((sum, i) => sum + (i.price * i.stock), 0);
  
  return {
    total,
    inStock,
    outOfStock,
    lowStock,
    nearExpiration,
    expired,
    totalValue
  };
};
