import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHotel,
  faPaw,
  faUser,
  faCalendarAlt,
  faSpinner,
  faExclamationTriangle,
  faBed,
  faPhone,
  faStethoscope,
} from "@fortawesome/free-solid-svg-icons";
import { apiRequest } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import "./VetCurrentBoarders.css";

const VetCurrentBoarders = () => {
  const [boarders, setBoarders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBoarder, setSelectedBoarder] = useState(null);

  useEffect(() => {
    fetchCurrentBoarders();
  }, []);

  const fetchCurrentBoarders = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/veterinary/boardings/current-boarders");
      setBoarders(data.boarders || []);
      setError("");
    } catch (err) {
      console.error("Failed to fetch current boarders:", err);
      setError("Failed to load current boarders. Please try again.");
      setBoarders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBoarders = boarders.filter((boarder) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      boarder.pet?.name?.toLowerCase().includes(searchLower) ||
      boarder.customer?.name?.toLowerCase().includes(searchLower) ||
      boarder.hotel_room?.room_number?.toLowerCase().includes(searchLower) ||
      boarder.pet?.species?.toLowerCase().includes(searchLower)
    );
  });

  const handleViewDetails = (boarder) => {
    setSelectedBoarder(boarder);
  };

  const handleCloseDetails = () => {
    setSelectedBoarder(null);
  };

  if (loading) {
    return (
      <div className="vet-current-boarders">
        <div className="loading-spinner">
          <div className="spinner-icon">
            <FontAwesomeIcon icon={faSpinner} className="spin-animation" />
          </div>
          <span>Loading current boarders...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vet-current-boarders">
        <div className="error-message">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="vet-current-boarders">
      <div className="boarders-header">
        <div className="header-content">
          <h2>
            <FontAwesomeIcon icon={faHotel} /> Current Boarders
          </h2>
          <p>Pets currently staying at the hotel - for emergency access</p>
        </div>
        <div className="boarders-count">
          <span className="count-badge">{boarders.length} Active</span>
        </div>
      </div>

      <div className="search-bar">
        <div className="search-input-wrapper">
          <FontAwesomeIcon icon={faPaw} />
          <input
            type="text"
            placeholder="Search by pet name, owner, room, or species..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredBoarders.length === 0 ? (
        <div className="no-boarders">
          <FontAwesomeIcon icon={faBed} />
          <h3>No current boarders</h3>
          <p>There are no pets currently checked in at the hotel.</p>
        </div>
      ) : (
        <div className="boarders-grid">
          {filteredBoarders.map((boarder) => (
            <div key={boarder.id} className="boarder-card animate-fade-in">
              <div className="boarder-header">
                <div className="pet-icon">
                  <FontAwesomeIcon icon={faPaw} />
                </div>
                <div className="pet-info">
                  <h4>{boarder.pet?.name || "Unknown Pet"}</h4>
                  <span className="pet-species">
                    {boarder.pet?.species} - {boarder.pet?.breed}
                  </span>
                </div>
                <span className="status-badge checked-in">Checked In</span>
              </div>

              <div className="boarder-details">
                <div className="detail-row">
                  <FontAwesomeIcon icon={faUser} />
                  <span className="label">Owner:</span>
                  <span className="value">{boarder.customer?.name || "N/A"}</span>
                </div>
                <div className="detail-row">
                  <FontAwesomeIcon icon={faHotel} />
                  <span className="label">Room:</span>
                  <span className="value">
                    {boarder.hotel_room?.room_number || "N/A"} ({boarder.hotel_room?.type})
                  </span>
                </div>
                <div className="detail-row">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  <span className="label">Check-out:</span>
                  <span className="value">
                    {boarder.check_out
                      ? new Date(boarder.check_out).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                {boarder.emergency_phone && (
                  <div className="detail-row emergency">
                    <FontAwesomeIcon icon={faPhone} />
                    <span className="label">Emergency:</span>
                    <span className="value">{boarder.emergency_phone}</span>
                  </div>
                )}
              </div>

              <div className="boarder-actions">
                <button
                  className="view-details-btn"
                  onClick={() => handleViewDetails(boarder)}
                >
                  <FontAwesomeIcon icon={faStethoscope} /> View Medical Info
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Boarder Details Modal */}
      {selectedBoarder && (
        <div className="modal-overlay" onClick={handleCloseDetails}>
          <div className="modal boarder-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <FontAwesomeIcon icon={faPaw} /> {selectedBoarder.pet?.name}
              </h3>
              <button className="close-btn" onClick={handleCloseDetails}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="info-section">
                <h4>Pet Information</h4>
                <p>
                  <strong>Name:</strong> {selectedBoarder.pet?.name}
                </p>
                <p>
                  <strong>Species:</strong> {selectedBoarder.pet?.species}
                </p>
                <p>
                  <strong>Breed:</strong> {selectedBoarder.pet?.breed}
                </p>
              </div>
              <div className="info-section">
                <h4>Owner Information</h4>
                <p>
                  <strong>Name:</strong> {selectedBoarder.customer?.name}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedBoarder.customer?.phone || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {selectedBoarder.customer?.email || "N/A"}
                </p>
              </div>
              <div className="info-section">
                <h4>Stay Details</h4>
                <p>
                  <strong>Room:</strong> {selectedBoarder.hotel_room?.room_number} ({selectedBoarder.hotel_room?.type})
                </p>
                <p>
                  <strong>Check-in:</strong>{" "}
                  {new Date(selectedBoarder.check_in).toLocaleDateString()}
                </p>
                <p>
                  <strong>Check-out:</strong>{" "}
                  {new Date(selectedBoarder.check_out).toLocaleDateString()}
                </p>
                <p>
                  <strong>Total Amount:</strong>{" "}
                  {formatCurrency(selectedBoarder.total_amount)}
                </p>
              </div>
              {selectedBoarder.special_requests && (
                <div className="info-section">
                  <h4>Special Requests</h4>
                  <p className="special-requests">{selectedBoarder.special_requests}</p>
                </div>
              )}
              {selectedBoarder.emergency_contact && (
                <div className="info-section emergency">
                  <h4>Emergency Contact</h4>
                  <p>
                    <strong>Name:</strong> {selectedBoarder.emergency_contact}
                  </p>
                  <p>
                    <strong>Phone:</strong> {selectedBoarder.emergency_phone}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VetCurrentBoarders;
