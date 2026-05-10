import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome-icons';
import {
  faBox,
  faPlus,
  faTimes,
  faPills,
  faNotesMedical,
  faExclamationTriangle,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { apiRequest } from '../../api/client';
import './VeterinaryInventoryUsage.css';

/**
 * VETERINARY INVENTORY USAGE COMPONENT
 * 
 * Allows veterinarians to record medical supplies, medicines, vaccines, 
 * and other inventory items used during appointments and treatments.
 * 
 * Features:
 * - Only shows service consumable items
 * - Validates stock availability
 * - Uses existing inventory deduction logic (FIFO/FEFO)
 * - Creates proper movement logs
 * - Links to appointment/pet records
 */

const VeterinaryInventoryUsage = ({ 
  appointmentId, 
  petId, 
  onUsageRecorded,
  initialItems = [] 
}) => {
  // State
  const [items, setItems] = useState(initialItems);
  const [availableItems, setAvailableItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch available service consumable items
  useEffect(() => {
    fetchAvailableItems();
  }, [appointmentId]);

  const fetchAvailableItems = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiRequest(`/veterinary/inventory-items`);
      
      if (response && response.items) {
        setAvailableItems(response.items);
      } else {
        setError('Failed to fetch available items');
      }
    } catch (err) {
      console.error('Failed to fetch available items:', err);
      setError('Failed to fetch available items');
    } finally {
      setLoading(false);
    }
  };

  // Add new item to usage list
  const addItem = () => {
    const newItem = {
      id: Date.now(),
      inventory_item_id: '',
      item_name: '',
      quantity_used: 1,
      unit: 'pcs',
      notes: '',
      is_new: true
    };
    setItems([...items, newItem]);
  };

  // Remove item from usage list
  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Update item in usage list
  const updateItem = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  // Calculate totals
  const totalItems = items.filter(item => !item.is_new).length;
  const totalQuantity = items.reduce((sum, item) => sum + (item.is_new ? 0 : item.quantity_used), 0);

  // Save inventory usage
  const saveUsage = async () => {
    // Validate items
    const validItems = items.filter(item => !item.is_new && item.inventory_item_id && item.quantity_used > 0);
    
    if (validItems.length === 0) {
      setError('Please add at least one item with valid inventory selection and quantity');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await apiRequest(`/veterinary/appointments/${appointmentId}/inventory-usage`, {
        method: 'POST',
        body: JSON.stringify({
          items: validItems.map(item => ({
            inventory_item_id: item.inventory_item_id,
            quantity_used: item.quantity_used,
            notes: item.notes
          }))
        })
      });

      if (response && response.success) {
        // Clear form
        setItems([]);
        
        // Notify parent component
        if (onUsageRecorded) {
          onUsageRecorded(response.usages || []);
        }
        
        alert('Inventory usage recorded successfully!');
      } else {
        setError(response.message || 'Failed to record inventory usage');
      }
    } catch (err) {
      console.error('Failed to save inventory usage:', err);
      setError('Failed to record inventory usage');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="veterinary-inventory-usage">
      <div className="usage-header">
        <h3>
          <FontAwesomeIcon icon={faBox} /> Used Inventory Items
        </h3>
        <p className="usage-subtitle">
          Record medical supplies, medicines, vaccines, and other consumables used during this appointment.
        </p>
      </div>

      {/* Available Items Reference */}
      <div className="available-items-section">
        <h4>Available Service Items</h4>
        {loading ? (
          <div className="loading-state">
            <FontAwesomeIcon icon={faSpinner} className="spinner" />
            <p>Loading available items...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <p>{error}</p>
          </div>
        ) : (
          <div className="items-grid">
            {availableItems.map(item => (
              <div key={item.id} className="available-item">
                <div className="item-info">
                  <div className="item-name">{item.name}</div>
                  <div className="item-details">
                    <span className="item-stock">Stock: {item.stock}</span>
                    <span className="item-unit">Unit: {item.unit || 'pcs'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Usage Form */}
      <div className="usage-form-section">
        <h4>Record Usage</h4>
        
        <div className="usage-items">
          {items.map((item, index) => (
            <div key={item.id} className="usage-item">
              <div className="item-select">
                <select
                  value={item.inventory_item_id}
                  onChange={(e) => updateItem(index, 'inventory_item_id', e.target.value)}
                  className={item.is_new ? 'error' : ''}
                >
                  <option value="">Select Item...</option>
                  {availableItems.map(availableItem => (
                    <option key={availableItem.id} value={availableItem.id}>
                      {availableItem.name} (Stock: {availableItem.stock})
                    </option>
                  ))}
                </select>
                
                {item.is_new && (
                  <button 
                    className="btn-remove"
                    onClick={() => removeItem(index)}
                    title="Remove this item"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}
              </div>

              <div className="item-quantity">
                <input
                  type="number"
                  min="1"
                  value={item.quantity_used}
                  onChange={(e) => updateItem(index, 'quantity_used', parseInt(e.target.value) || 1)}
                  placeholder="Quantity"
                  className={item.is_new ? 'error' : ''}
                />
              </div>

              <div className="item-unit">
                <input
                  type="text"
                  value={item.unit}
                  onChange={(e) => updateItem(index, 'unit', e.target.value)}
                  placeholder="Unit (pcs, ml, mg)"
                  className={item.is_new ? 'error' : ''}
                />
              </div>

              <div className="item-notes">
                <textarea
                  value={item.notes}
                  onChange={(e) => updateItem(index, 'notes', e.target.value)}
                  placeholder="Usage notes (e.g., Anti-rabies vaccine, 2ml injection)"
                  rows={2}
                  className={item.is_new ? 'error' : ''}
                />
              </div>

              {!item.is_new && (
                <button 
                  className="btn-remove"
                  onClick={() => removeItem(index)}
                  title="Remove this item"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button 
            className="btn-add"
            onClick={addItem}
          >
            <FontAwesomeIcon icon={faPlus} /> Add Item
          </button>
          
          <button 
            className={`btn-save ${saving ? 'loading' : ''}`}
            onClick={saveUsage}
            disabled={saving || totalItems === 0}
          >
            {saving ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="spinner" />
                Recording Usage...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faPills} /> Record Usage ({totalItems} items)
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            {error}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="usage-instructions">
        <h4>
          <FontAwesomeIcon icon={faNotesMedical} /> Usage Instructions
        </h4>
        <ul>
          <li>Select only <strong>service consumable</strong> items from the dropdown</li>
          <li>Enter the <strong>quantity used</strong> for each item</li>
          <li>Add <strong>usage notes</strong> for better tracking (e.g., vaccine type, injection site)</li>
          <li>System will automatically deduct stock using <strong>FIFO/FEFO logic</strong></li>
          <li>All usage will be recorded in <strong>inventory movement logs</strong></li>
          <li>Archived/inactive items cannot be selected</li>
        </ul>
      </div>
    </div>
  );
};

export default VeterinaryInventoryUsage;
