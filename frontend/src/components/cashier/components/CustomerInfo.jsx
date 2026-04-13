import React, { useState } from 'react';

const CustomerInfo = ({ 
  orderType, 
  onOrderTypeChange, 
  customerName, 
  onCustomerChange,
  tableNumber,
  onTableChange 
}) => {
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const mockCustomers = [
    { id: 1, name: 'Sarah Johnson', phone: '09123456789', email: 'sarah@email.com', pets: ['Max', 'Luna'] },
    { id: 2, name: 'Mike Chen', phone: '09987654321', email: 'mike@email.com', pets: ['Buddy'] },
    { id: 3, name: 'Emma Wilson', phone: '09112223344', email: 'emma@email.com', pets: ['Whiskers', 'Mittens', 'Shadow'] },
    { id: 4, name: 'John Smith', phone: '09133445566', email: 'john@email.com', pets: ['Rocky'] },
    { id: 5, name: 'Lisa Brown', phone: '09155667788', email: 'lisa@email.com', pets: ['Bella', 'Daisy'] },
  ];

  const filteredCustomers = mockCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery) ||
    customer.pets.some(pet => pet.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCustomerSelect = (customer) => {
    onCustomerChange(customer.name);
    setShowCustomerSearch(false);
    setSearchQuery('');
  };

  return (
    <div className="customer-info">
      <div className="order-type-section">
        <h4>Order Type</h4>
        <div className="order-type-buttons">
          <button 
            className={`order-type-btn ${orderType === 'walk-in' ? 'active' : ''}`}
            onClick={() => onOrderTypeChange('walk-in')}
          >
            🚶 Walk-in
          </button>
          <button 
            className={`order-type-btn ${orderType === 'appointment' ? 'active' : ''}`}
            onClick={() => onOrderTypeChange('appointment')}
          >
            📅 Appointment
          </button>
          <button 
            className={`order-type-btn ${orderType === 'delivery' ? 'active' : ''}`}
            onClick={() => onOrderTypeChange('delivery')}
          >
            🚚 Delivery
          </button>
          <button 
            className={`order-type-btn ${orderType === 'online' ? 'active' : ''}`}
            onClick={() => onOrderTypeChange('online')}
          >
            🌐 Online Order
          </button>
        </div>
      </div>

      <div className="customer-details">
        <h4>Customer Information</h4>
        
        <div className="customer-input-group">
          <label>Customer Name</label>
          <div className="customer-input-wrapper">
            <input
              type="text"
              value={customerName}
              onChange={(e) => onCustomerChange(e.target.value)}
              placeholder="Walk-in Customer"
            />
            <button 
              className="search-customer-btn"
              onClick={() => setShowCustomerSearch(!showCustomerSearch)}
            >
              🔍
            </button>
          </div>
          
          {showCustomerSearch && (
            <div className="customer-search-dropdown">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customer or pet name..."
                className="search-input"
                autoFocus
              />
              <div className="customer-search-results">
                {filteredCustomers.map(customer => (
                  <div 
                    key={customer.id}
                    className="customer-result"
                    onClick={() => handleCustomerSelect(customer)}
                  >
                    <div className="customer-result-info">
                      <span className="customer-result-name">{customer.name}</span>
                      <span className="customer-result-phone">{customer.phone}</span>
                      <span className="customer-result-pets">🐾 {customer.pets.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {orderType === 'appointment' && (
          <div className="appointment-info">
            <div className="appointment-input-group">
              <label>Appointment Time</label>
              <input
                type="datetime-local"
                placeholder="Select appointment time"
              />
            </div>
            <div className="appointment-input-group">
              <label>Service Type</label>
              <select>
                <option>Grooming</option>
                <option>Veterinary Checkup</option>
                <option>Training Session</option>
                <option>Daycare</option>
                <option>Boarding</option>
              </select>
            </div>
          </div>
        )}

        {orderType === 'delivery' && (
          <div className="delivery-info">
            <div className="delivery-input-group">
              <label>Delivery Address</label>
              <textarea
                placeholder="Enter delivery address..."
                rows={2}
              />
            </div>
            <div className="delivery-input-group">
              <label>Delivery Time</label>
              <select>
                <option>Standard (2-3 days)</option>
                <option>Express (1 day)</option>
                <option>Same Day (within 4 hours)</option>
              </select>
            </div>
            <div className="delivery-input-group">
              <label>Pet Information</label>
              <textarea
                placeholder="Pet name, breed, special requirements..."
                rows={2}
              />
            </div>
          </div>
        )}

        {orderType === 'online' && (
          <div className="online-info">
            <div className="online-input-group">
              <label>Order Reference</label>
              <input
                type="text"
                placeholder="Online order ID..."
              />
            </div>
            <div className="online-input-group">
              <label>Platform</label>
              <select>
                <option>Website</option>
                <option>Mobile App</option>
                <option>Facebook</option>
                <option>Instagram</option>
                <option>Phone Order</option>
              </select>
            </div>
          </div>
        )}

        <div className="pet-info">
          <h5>Pet Information</h5>
          <div className="pet-input-group">
            <label>Pet Name(s)</label>
            <input
              type="text"
              placeholder="Enter pet names..."
            />
          </div>
          <div className="pet-input-group">
            <label>Special Notes</label>
            <textarea
              placeholder="Allergies, special requirements, preferences..."
              rows={2}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerInfo;
