import React, { useState, useEffect } from "react";
import { inventoryApi } from "../../api/inventory";
import { formatCurrency } from "../../utils/currency";
import "./StockAdjustmentModal.css";

const StockAdjustmentModal = ({ isOpen, onClose, item, onSuccess }) => {
  // Category-based expiry rule
  const expiryRequiredCategories = [
    "food",
    "medicine", 
    "vitamins",
    "health",
    "grooming",
    "shampoo",
    "treats",
  ];

  const needsExpiration = (itm) => {
    const category = String(itm?.category || "").toLowerCase();
    return expiryRequiredCategories.some((key) => category.includes(key));
  };
  const [adjustmentType, setAdjustmentType] = useState("add"); // 'add', 'remove', 'set'
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper to get stock value from multiple possible field names
  const getStock = (itm) => Number(itm?.stock ?? itm?.quantity ?? itm?.stock_quantity ?? itm?.current_stock ?? 0);
  const currentStock = getStock(item);

  const resetForm = () => {
    setAdjustmentType("add");
    setQuantity("");
    setReason("");
    setCustomReason("");
    setExpirationDate("");
    setError(null);
  };

  // Auto-suggest quantity based on adjustment type
  useEffect(() => {
    if (adjustmentType === "remove" && currentStock > 0) {
      setQuantity(Math.min(currentStock, 5).toString());
    } else if (adjustmentType === "add") {
      setQuantity("");
    } else if (adjustmentType === "set") {
      setQuantity(currentStock.toString());
    }
  }, [adjustmentType, item, currentStock]);


  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    if (!quantity || parseInt(quantity) <= 0) {
      return "Please enter a valid quantity";
    }
    if (!reason.trim()) {
      return "Please provide a reason for this adjustment";
    }
    if (adjustmentType === "remove" && parseInt(quantity) > currentStock) {
      return `Cannot remove more than current stock (${currentStock})`;
    }
    return null;
  };

  // Create stock notification for low/out of stock alerts
  const createStockNotification = async (newStock) => {
    const reorderLevel = item?.reorder_level || item?.reorderLevel || 10;

    try {
      if (newStock <= 0) {
        await inventoryApi.createInventoryNotification?.({
          title: "Out of Stock Alert",
          message: `${item.name} is now out of stock.`,
          type: "danger",
          module: "inventory",
          item_id: item.id,
          priority: "high",
        });
      } else if (newStock <= reorderLevel) {
        await inventoryApi.createInventoryNotification?.({
          title: "Low Stock Alert",
          message: `${item.name} is running low. Current stock: ${newStock}.`,
          type: "warning",
          module: "inventory",
          item_id: item.id,
          priority: "medium",
        });
      }
    } catch (error) {
      console.error("Failed to create stock notification:", error);
    }
  };

  const handleSubmit = async () => {
    if (Number(quantity) <= 0) {
      alert("Please enter quantity greater than 0.");
      return;
    }

    if (!reason) {
      alert("Please select a reason.");
      return;
    }

    // Category-based expiration validation
    if (adjustmentType === "add" && needsExpiration(item) && !expirationDate) {
      alert("Expiration date is required for this item category.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const finalReason = reason === "Other" ? customReason : reason;

      console.log("[StockAdjustment] Sending request:", {
        itemId: item.id,
        type: adjustmentType,
        quantity: Number(quantity),
        reason: finalReason,
      });

      const result = await inventoryApi.adjustStock(item.id, adjustmentType, Number(quantity), finalReason, {
        expiration_date: needsExpiration(item) ? expirationDate : null
      });
      console.log("[StockAdjustment] Success:", result);

      await onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error("[StockAdjustment] Failed:", err);
      console.error("[StockAdjustment] Error details:", {
        message: err.message,
        response: err.response,
        request: err.request,
      });

      // Show specific error message from backend or generic message
      const errorMsg = err.message || "Failed to adjust stock. Please try again.";
      setError(errorMsg);
      alert(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const getNewStockPreview = () => {
    if (!quantity || isNaN(parseInt(quantity))) return currentStock;
    const qty = parseInt(quantity);
    switch (adjustmentType) {
      case "add":
        return currentStock + qty;
      case "remove":
        return Math.max(0, currentStock - qty);
      case "set":
        return qty;
      default:
        return currentStock;
    }
  };

  const getAdjustmentReasons = () => {
    switch (adjustmentType) {
      case "add":
        return [
          "New stock received",
          "Returned by customer",
          "Inventory correction",
          "Found in warehouse",
          "Other",
        ];
      case "remove":
        return [
          "Sold to customer",
          "Damaged/expired",
          "Internal use",
          "Lost/missing",
          "Returned to supplier",
          "Other",
        ];
      case "set":
        return [
          "Inventory count correction",
          "System reset",
          "Stock take adjustment",
          "Other",
        ];
      default:
        return ["Other"];
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content stock-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-icon">📦</span>
            <div>
              <h3>Adjust Stock</h3>
              <p>Update inventory quantity with reason tracking</p>
            </div>
          </div>
          <button className="btn-close" onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Product Info */}
            <div className="product-info-card">
              <div className="product-name">{item.name}</div>
              <div className="product-meta">
                <span className="sku">SKU: {item.sku || "N/A"}</span>
                <span className="category">{item.category || "Uncategorized"}</span>
              </div>
              <div className="current-stock">
                <span className="label">Current Stock:</span>
                <span className={`value ${currentStock <= 10 ? "low" : ""}`}>
                  {currentStock} units
                </span>
              </div>
            </div>

            {/* Error Display */}
            {error && <div className="error-banner">{error}</div>}

            {/* Adjustment Type */}
            <div className="adjustment-type">
              <label>Adjustment Type</label>
              <div className="type-buttons">
                <button
                  type="button"
                  className={`type-btn ${adjustmentType === "add" ? "active" : ""}`}
                  onClick={() => setAdjustmentType("add")}
                >
                  <span className="icon">➕</span>
                  <span>Add Stock</span>
                </button>
                <button
                  type="button"
                  className={`type-btn ${adjustmentType === "remove" ? "active" : ""}`}
                  onClick={() => setAdjustmentType("remove")}
                >
                  <span className="icon">➖</span>
                  <span>Remove Stock</span>
                </button>
                <button
                  type="button"
                  className={`type-btn ${adjustmentType === "set" ? "active" : ""}`}
                  onClick={() => setAdjustmentType("set")}
                >
                  <span className="icon">📝</span>
                  <span>Set Exact</span>
                </button>
              </div>
            </div>

            {/* Quantity Input */}
            <div className="form-group">
              <label>
                {adjustmentType === "add" && "Quantity to Add"}
                {adjustmentType === "remove" && "Quantity to Remove"}
                {adjustmentType === "set" && "New Stock Level"}
              </label>
              <div className="quantity-input">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity((prev) => Math.max(0, parseInt(prev || 0) - 1))}
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  min="0"
                />
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity((prev) => parseInt(prev || 0) + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Quick Quantity Buttons */}
            <div className="quick-quantities">
              {[5, 10, 25, 50, 100].map((qty) => (
                <button
                  key={qty}
                  type="button"
                  className="quick-qty-btn"
                  onClick={() => setQuantity(qty.toString())}
                >
                  +{qty}
                </button>
              ))}
            </div>

            {/* Reason Selection */}
            <div className="form-group">
              <label>
                Reason <span className="required">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={!reason ? "placeholder" : ""}
              >
                <option value="">Select a reason...</option>
                {getAdjustmentReasons().map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Reason Input */}
            {reason === "Other" && (
              <div className="form-group">
                <label>Specify Reason <span className="required">*</span></label>
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Enter custom reason..."
                  autoFocus
                  required
                />
              </div>
            )}

            {/* Expiration Date - Category-based requirement */}
            {adjustmentType === "add" && needsExpiration(item) && (
              <div className="form-group">
                <label>
                  Expiration Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
                <small className="field-hint required">
                  This category requires an expiration date.
                </small>
              </div>
            )}

            {adjustmentType === "add" && !needsExpiration(item) && (
              <div className="form-note">
                <span className="note-icon">ℹ️</span>
                <span>This item category does not require expiration tracking.</span>
              </div>
            )}

            {/* Smart Alert Warnings */}
            {quantity && getNewStockPreview() <= 0 && (
              <div className="alert-danger">
                <span className="alert-icon">⚠️</span>
                <span>This will result in <strong>OUT OF STOCK</strong></span>
              </div>
            )}

            {quantity && getNewStockPreview() > 0 && getNewStockPreview() <= 10 && (
              <div className="alert-warning">
                <span className="alert-icon">⚠️</span>
                <span>This will trigger <strong>LOW STOCK</strong> alert</span>
              </div>
            )}

            {/* Preview */}
            {quantity && (
              <div className="adjustment-preview">
                <div className="preview-row">
                  <span>Current:</span>
                  <strong>{currentStock} units</strong>
                </div>
                <div className="preview-row adjustment">
                  <span>
                    {adjustmentType === "add" && "➕ Adding:"}
                    {adjustmentType === "remove" && "➖ Removing:"}
                    {adjustmentType === "set" && "📝 Setting to:"}
                  </span>
                  <strong>
                    {adjustmentType === "set"
                      ? `${getNewStockPreview()} units`
                      : `${quantity} units`}
                  </strong>
                </div>
                <div className="preview-row new-total">
                  <span>New Total:</span>
                  <strong className={getNewStockPreview() <= 10 ? "low" : ""}>
                    {getNewStockPreview()} units
                  </strong>
                </div>
                {item.price && (
                  <div className="preview-row value">
                    <span>Stock Value:</span>
                    <strong>{formatCurrency(getNewStockPreview() * item.price)}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Stock History Panel */}
            <div className="stock-history-panel">
              <h4 className="history-title">
                <span>📋</span> Recent Adjustments
              </h4>
              {item.history?.length ? (
                <ul className="history-list">
                  {item.history.slice(0, 5).map((log, index) => (
                    <li key={index} className="history-item">
                      <div className="history-top">
                        <span className={`history-badge ${log.type || log.adjustment_type || "adjustment"}`}>
                          {(log.type || log.adjustment_type || "adjustment").toUpperCase()}
                        </span>
                        <span className="history-qty">
                          {log.previous_stock ?? log.previous ?? "—"} → {log.new_stock ?? log.new ?? "—"}
                        </span>
                      </div>
                      <div className="history-meta">
                        <span className="history-reason">{log.reason || "No reason"}</span>
                        <span className="history-date">
                          {log.created_at ? new Date(log.created_at).toLocaleString() : "Unknown date"}
                        </span>
                      </div>
                      {log.performed_by && (
                        <div className="history-user">
                          <span>👤 {log.performed_by}</span>
                          {log.role && <span className="user-role">({log.role})</span>}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No recent adjustments</p>
              )}
            </div>
          </div>

          <div className="adjust-stock-footer">
            <button
              type="button"
              className="cancel-adjustment-btn"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="button"
              className="save-adjustment-btn"
              onClick={handleSubmit}
              disabled={loading || !quantity || !reason}
            >
              {loading ? "Processing..." : "Save Adjustment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustmentModal;
