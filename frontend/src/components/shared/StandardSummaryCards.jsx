import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faUsers, faMoneyBillWave, faBox, faCalendarCheck } from "@fortawesome/free-solid-svg-icons";
import "./StandardSummaryCards.css";

/**
 * Standardized Summary Cards Component
 * Provides consistent summary card layout across all report modules
 *
 * @param {Object} props
 * @param {Array} props.cards - Array of card objects
 * @param {string} props.cards[].id - Unique card identifier
 * @param {string} props.cards[].label - Card label
 * @param {string|number} props.cards[].value - Card value
 * @param {string} props.cards[].icon - FontAwesome icon name
 * @param {string} props.cards[].color - Card color theme (primary, secondary, success, warning, danger)
 * @param {string} props.cards[].trend - Trend indicator (up, down, neutral)
 * @param {string} props.cards[].change - Change value/text
 */
const StandardSummaryCards = ({ cards = [] }) => {
  const getIconComponent = (iconName) => {
    const iconMap = {
      faChartLine,
      faUsers,
      faMoneyBillWave,
      faBox,
      faCalendarCheck,
    };
    return iconMap[iconName] || faChartLine;
  };

  return (
    <div className="standard-summary-cards">
      <div className="cards-grid">
        {cards.map((card) => (
          <div key={card.id} className={`summary-card ${card.color || 'primary'}`}>
            <div className="card-content">
              <div className="card-icon">
                <FontAwesomeIcon icon={getIconComponent(card.icon)} />
              </div>
              <div className="card-info">
                <div className="card-value">{card.value}</div>
                <div className="card-label">{card.label}</div>
              </div>
            </div>
            {card.change && (
              <div className={`card-trend ${card.trend || 'neutral'}`}>
                <span className="trend-icon">
                  {card.trend === 'up' ? '↑' : card.trend === 'down' ? '↓' : '→'}
                </span>
                <span className="trend-value">{card.change}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StandardSummaryCards;
