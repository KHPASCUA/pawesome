import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faCheck,
  faExclamationTriangle,
  faMagnifyingGlass,
  faMinus,
  faPlus,
  faSpinner,
  faStethoscope,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { apiRequest } from "../../api/client";
import { normalizeList } from "../../utils/normalizeList";
import "./VeterinaryInventoryUsage.css";

const money = (value) => `PHP ${Number(value || 0).toFixed(2)}`;

const VeterinaryInventoryUsage = ({ appointmentId, onUsageRecorded }) => {
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [usageHistory, setUsageHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchAvailableItems = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiRequest("/veterinary/inventory-items");
      if (response?.success === false) {
        throw new Error(response.message || "Failed to fetch service add-ons");
      }
      setAvailableItems(normalizeList(response, ["items", "data", "addons", "service_addons"]));
    } catch (err) {
      console.error("Failed to fetch veterinary service add-ons:", err);
      setError(err.message || "Failed to fetch service add-ons");
      setAvailableItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsageHistory = useCallback(async () => {
    if (!appointmentId) return;

    try {
      setHistoryLoading(true);
      const response = await apiRequest(`/veterinary/appointments/${appointmentId}/inventory-usage-history`);
      const history = normalizeList(response, ["history", "data", "items", "usages"]);
      setUsageHistory(history);
      setSelectedItems(
        history
          .filter((item) => item.inventory_item_id && Number(item.quantity_used) > 0)
          .map((item) => ({
            inventory_item_id: item.inventory_item_id,
            quantity_used: Number(item.quantity_used || 1),
            unit: item.unit || "pcs",
            notes: item.notes || "",
            unit_price: Number(item.unit_price || 0),
            description: item.description || item.item_name || "Service add-on",
          }))
      );
    } catch (err) {
      console.error("Failed to fetch veterinary add-on history:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    fetchAvailableItems();
    fetchUsageHistory();
  }, [fetchAvailableItems, fetchUsageHistory]);

  const selectedById = useMemo(
    () => new Map(selectedItems.map((item) => [String(item.inventory_item_id), item])),
    [selectedItems]
  );

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return availableItems;
    return availableItems.filter((item) =>
      [item.name, item.description, item.category, item.sku]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [availableItems, search]);

  const selectedTotal = selectedItems.reduce(
    (sum, item) => sum + Number(item.quantity_used || 0) * Number(item.unit_price || 0),
    0
  );

  const findAvailable = (inventoryItemId) =>
    availableItems.find((item) => String(item.id) === String(inventoryItemId));

  const isInsufficient = (item, quantity = 1) => {
    const alreadySelected = selectedById.get(String(item.id));
    const currentQuantity = Number(alreadySelected?.quantity_used || 0);
    const additionalNeeded = Math.max(0, Number(quantity || 1) - currentQuantity);
    return Number(item.stock || item.available_stock || 0) < additionalNeeded;
  };

  const addItem = (item) => {
    setSuccess("");
    setError("");
    if (isInsufficient(item, 1)) {
      setError(`Insufficient stock for ${item.name}.`);
      return;
    }

    setSelectedItems((current) => {
      if (current.some((selected) => String(selected.inventory_item_id) === String(item.id))) {
        return current;
      }

      return [
        ...current,
        {
          inventory_item_id: item.id,
          quantity_used: Number(item.default_quantity || 1),
          unit: item.unit || "pcs",
          notes: "",
          unit_price: Number(item.unit_price ?? item.price ?? 0),
          description: item.name,
        },
      ];
    });
  };

  const updateSelected = (inventoryItemId, patch) => {
    setSelectedItems((current) =>
      current.map((item) =>
        String(item.inventory_item_id) === String(inventoryItemId)
          ? { ...item, ...patch }
          : item
      )
    );
  };

  const removeSelected = (inventoryItemId) => {
    setSelectedItems((current) =>
      current.filter((item) => String(item.inventory_item_id) !== String(inventoryItemId))
    );
  };

  const hasInvalidQuantity = selectedItems.some((item) => {
    const available = findAvailable(item.inventory_item_id);
    if (!available) return true;
    const existing = usageHistory.find((history) => String(history.inventory_item_id) === String(item.inventory_item_id));
    const currentSavedQuantity = Number(existing?.quantity_used || 0);
    const additionalNeeded = Math.max(0, Number(item.quantity_used || 0) - currentSavedQuantity);
    return Number(item.quantity_used || 0) <= 0 || Number(available.stock || 0) < additionalNeeded;
  });

  const saveUsage = async () => {
    if (saving) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiRequest(`/veterinary/appointments/${appointmentId}/inventory-usage`, {
        method: "POST",
        body: JSON.stringify({
          items: selectedItems.map((item) => ({
            inventory_item_id: item.inventory_item_id,
            quantity_used: Number(item.quantity_used || 0),
            unit: item.unit || "pcs",
            notes: item.notes || "",
            unit_price: Number(item.unit_price || 0),
            description: item.description,
          })),
          general_notes: "Veterinary consultation service add-ons",
        }),
      });

      if (response?.success === false) {
        throw new Error(response.message || "Failed to save service add-ons");
      }

      setSuccess(response?.message || "Service add-ons saved.");
      await fetchAvailableItems();
      await fetchUsageHistory();
      onUsageRecorded?.(response?.usages || []);
    } catch (err) {
      console.error("Failed to save veterinary service add-ons:", err);
      setError(err.message || "Failed to save service add-ons");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="veterinary-inventory-usage">
      <div className="usage-header">
        <h3>
          <FontAwesomeIcon icon={faStethoscope} /> Service Add-ons
        </h3>
        <p className="usage-subtitle">
          Select billable consultation add-ons and inventory-linked supplies used for this appointment.
        </p>
      </div>

      <div className="addon-toolbar">
        <FontAwesomeIcon icon={faMagnifyingGlass} />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search add-ons, supplies, or SKU"
        />
      </div>

      {loading ? (
        <div className="loading-state">
          <FontAwesomeIcon icon={faSpinner} className="spinner" />
          <p>Loading service add-ons...</p>
        </div>
      ) : error && availableItems.length === 0 ? (
        <div className="error-state">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <p>{error}</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="empty-state">
          <FontAwesomeIcon icon={faBox} />
          <p>No active add-ons available.</p>
        </div>
      ) : (
        <div className="items-grid addon-card-grid">
          {filteredItems.map((item) => {
            const selected = selectedById.has(String(item.id));
            const outOfStock = Number(item.stock || item.available_stock || 0) <= 0;
            return (
              <button
                type="button"
                key={item.id}
                className={`available-item addon-card ${selected ? "selected" : ""} ${outOfStock ? "disabled" : ""}`}
                onClick={() => addItem(item)}
                disabled={outOfStock}
              >
                <div className="item-info">
                  <div>
                    <div className="item-name">{item.name}</div>
                    <p>{item.description || "Inventory-linked veterinary add-on"}</p>
                  </div>
                  {selected ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faPlus} />}
                </div>
                <div className="item-details">
                  <span>{money(item.unit_price ?? item.price)}</span>
                  <span className={outOfStock ? "stock-warning" : "item-stock"}>
                    {outOfStock ? "Insufficient stock" : `Stock: ${item.stock}`}
                  </span>
                  <span>{item.sku || item.category || "Inventory item"}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="usage-form-section">
        <div className="selected-header">
          <h4>Selected Add-ons</h4>
          <strong>{money(selectedTotal)}</strong>
        </div>

        {selectedItems.length === 0 ? (
          <div className="empty-state compact">
            <p>No add-ons selected for this consultation.</p>
          </div>
        ) : (
          <div className="selected-addons">
            {selectedItems.map((item) => {
              const available = findAvailable(item.inventory_item_id);
              const existing = usageHistory.find((history) => String(history.inventory_item_id) === String(item.inventory_item_id));
              const savedQuantity = Number(existing?.quantity_used || 0);
              const additionalNeeded = Math.max(0, Number(item.quantity_used || 0) - savedQuantity);
              const insufficient = available && Number(available.stock || 0) < additionalNeeded;

              return (
                <div key={item.inventory_item_id} className={`usage-item selected-addon-row ${insufficient ? "has-warning" : ""}`}>
                  <div className="selected-addon-main">
                    <strong>{item.description}</strong>
                    <span>{available?.sku || available?.category || "Inventory-linked"}</span>
                    {insufficient && <small>Insufficient stock. Available additional stock: {available?.stock || 0}</small>}
                  </div>
                  <div className="quantity-stepper">
                    <button
                      type="button"
                      onClick={() => updateSelected(item.inventory_item_id, { quantity_used: Math.max(1, Number(item.quantity_used || 1) - 1) })}
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity_used}
                      onChange={(event) =>
                        updateSelected(item.inventory_item_id, {
                          quantity_used: Math.max(1, Number(event.target.value || 1)),
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => updateSelected(item.inventory_item_id, { quantity_used: Number(item.quantity_used || 1) + 1 })}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>
                  <input
                    className="unit-input"
                    value={item.unit}
                    onChange={(event) => updateSelected(item.inventory_item_id, { unit: event.target.value })}
                    aria-label="Unit"
                  />
                  <input
                    className="price-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(event) => updateSelected(item.inventory_item_id, { unit_price: Number(event.target.value || 0) })}
                    aria-label="Unit price"
                  />
                  <textarea
                    value={item.notes}
                    onChange={(event) => updateSelected(item.inventory_item_id, { notes: event.target.value })}
                    placeholder="Notes"
                    rows={2}
                  />
                  <strong className="row-total">{money(Number(item.quantity_used || 0) * Number(item.unit_price || 0))}</strong>
                  <button type="button" className="btn-remove" onClick={() => removeSelected(item.inventory_item_id)}>
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="form-actions">
          <button
            className={`btn-save ${saving ? "loading" : ""}`}
            onClick={saveUsage}
            disabled={saving || historyLoading || hasInvalidQuantity}
            type="button"
          >
            {saving ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="spinner" />
                Saving Add-ons...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCheck} /> Save Service Add-ons
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="success-message">
            <FontAwesomeIcon icon={faCheck} />
            <span>{success}</span>
          </div>
        )}
      </div>

      <div className="usage-instructions">
        <h4>Saved Add-ons</h4>
        {historyLoading ? (
          <p>Loading saved add-ons...</p>
        ) : usageHistory.length === 0 ? (
          <p>No service add-ons have been saved for this appointment yet.</p>
        ) : (
          <ul>
            {usageHistory.map((usage) => (
              <li key={usage.id}>
                {usage.item_name || usage.description || "Service add-on"} - {usage.quantity_used} {usage.unit || "pcs"} · {money(usage.total_price)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default VeterinaryInventoryUsage;
