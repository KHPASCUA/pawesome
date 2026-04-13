import React from 'react';

const CategoryFilter = ({ 
  categories, 
  activeCategory, 
  onCategoryChange,
  searchQuery,
  onSearchChange 
}) => {
  return (
    <div className="category-filter">
      <div className="search-section">
        <div className="search-bar">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="🔍 Search products..."
            className="search-input"
          />
        </div>
      </div>

      <div className="categories-section">
        <h4>Categories</h4>
        <div className="category-grid">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => onCategoryChange(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-label">{category.label}</span>
              {category.count > 0 && (
                <span className="category-count">{category.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="quick-actions">
        <h4>Quick Filters</h4>
        <div className="action-buttons">
          <button className="quick-action-btn">
            ⭐ In Stock
          </button>
          <button className="quick-action-btn">
            🔥 On Sale
          </button>
          <button className="quick-action-btn">
            🆕 New Arrivals
          </button>
          <button className="quick-action-btn">
            💰 Best Value
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;
