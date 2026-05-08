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
 * │  1. Use the Inventory Management UI or API                   │
 * │  2. All data should come from the backend API                     │
 * │  3. This file now only contains utility functions             │
 * │  4. No hardcoded demo data for production safety              │
 * └─────────────────────────────────────────────────────────────────┘
 */

// Empty arrays - data should come from backend API
export const sharedProducts = [];
export const sharedServices = [];

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
