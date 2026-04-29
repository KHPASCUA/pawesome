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

    // Real-time updates: poll every 5 seconds
    const interval = setInterval(() => {
      fetchCurrentBoarders();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchCurrentBoarders = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/veterinary/boardings/current-boarders");
      const boardersData = Array.isArray(data)
        ? data
        : data.boarders || data.data || [];
      setBoarders(boardersData);
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
      (boarder.pet?.name || "").toLowerCase().includes(searchLower) ||
      (boarder.customer?.name || "").toLowerCase().includes(searchLower) ||
      (boarder.hotel_room?.room_number || "").toLowerCase().includes(searchLower) ||
      (boarder.pet?.species || "").toLowerCase().includes(searchLower)
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
      <section className="app-content vet-current-boarders">
        <div className="premium-card vet-loading-state">
          <FontAwesomeIcon icon={faSpinner} className="spin-animation" />
          <span>Loading current boarders...</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="app-content vet-current-boarders">
        <div className="premium-card vet-error-state">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>{error}</span>
        </div>
      </section>
    );
  }

  return (
    <section className="app-content vet-current-boarders">
      <div className="premium-card vet-boarders-header">
        <div>
          <h2 className="premium-title">
            <FontAwesomeIcon icon={faHotel} /> Current Boarders
          </h2>
          <p className="premium-muted">Pets currently staying at the hotel - for emergency access</p>
        </div>
        <span className="badge badge-success">{boarders.length} Active</span>
      </div>

      <div className="premium-card vet-boarders-search">
        <div className="vet-search-box">
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
        <div className="premium-card vet-empty-state">
          <FontAwesomeIcon icon={faBed} />
          <h3>No current boarders</h3>
          <p>There are no pets currently checked in at the hotel.</p>
        </div>
      ) : (
        <div className="vet-boarders-grid">
          {filteredBoarders.map((boarder) => (
            <article key={boarder.id} className="premium-card vet-boarder-card">
              <div className="vet-boarder-top">
                <div className="vet-boarder-pet">
                  <div className="vet-pet-icon">
                    <FontAwesomeIcon icon={faPaw} />
                  </div>
                  <div>
                    <h4>{boarder.pet?.name || "Unknown Pet"}</h4>
                    <p>{boarder.pet?.species} - {boarder.pet?.breed}</p>
                    <p className="vet-pet-meta">
                      Room {boarder.hotel_room?.room_number || "N/A"}
                    </p>
                  </div>
                </div>
                <span className="badge badge-success">
                  {boarder.status || "Checked In"}
                </span>
              </div>

              <div className="vet-boarder-details">
                <div className="vet-boarder-row">
                  <FontAwesomeIcon icon={faUser} />
                  <strong>Owner:</strong>
                  <span>{boarder.customer?.name || "N/A"}</span>
                </div>
                <div className="vet-boarder-row">
                  <FontAwesomeIcon icon={faHotel} />
                  <strong>Room:</strong>
                  <span>{boarder.hotel_room?.room_number || "N/A"} ({boarder.hotel_room?.type})</span>
                </div>
                <div className="vet-boarder-row">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  <strong>Check-out:</strong>
                  <span>
                    {boarder.check_out
                      ? new Date(boarder.check_out).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                {boarder.emergency_phone && (
                  <div className="vet-boarder-row vet-emergency">
                    <FontAwesomeIcon icon={faPhone} />
                    <strong>Emergency:</strong>
                    <span>{boarder.emergency_phone}</span>
                  </div>
                )}
              </div>

              <button
                className="btn-primary vet-view-btn"
                onClick={() => handleViewDetails(boarder)}
                type="button"
              >
                <FontAwesomeIcon icon={faStethoscope} /> View Medical Info
              </button>
            </article>
          ))}
        </div>
      )}

      {/* Boarder Details Modal */}
      {selectedBoarder && (
        <div className="app-modal-overlay" onClick={handleCloseDetails} role="dialog">
          <div className="app-modal vet-boarder-modal" onClick={(e) => e.stopPropagation()}>
            <div className="app-modal-header">
              <h3>
                <FontAwesomeIcon icon={faPaw} /> {selectedBoarder.pet?.name}
              </h3>
              <button className="app-modal-close" onClick={handleCloseDetails} type="button">
                ×
              </button>
            </div>
            <div className="app-modal-body">
              <div className="vet-info-section">
                <h4>Pet Information</h4>
                <p><strong>Name:</strong> {selectedBoarder.pet?.name}</p>
                <p><strong>Species:</strong> {selectedBoarder.pet?.species}</p>
                <p><strong>Breed:</strong> {selectedBoarder.pet?.breed}</p>
              </div>
              <div className="vet-info-section">
                <h4>Owner Information</h4>
                <p><strong>Name:</strong> {selectedBoarder.customer?.name}</p>
                <p><strong>Phone:</strong> {selectedBoarder.customer?.phone || "N/A"}</p>
                <p><strong>Email:</strong> {selectedBoarder.customer?.email || "N/A"}</p>
              </div>
              <div className="vet-info-section">
                <h4>Stay Details</h4>
                <p><strong>Room:</strong> {selectedBoarder.hotel_room?.room_number} ({selectedBoarder.hotel_room?.type})</p>
                <p><strong>Check-in:</strong> {new Date(selectedBoarder.check_in).toLocaleDateString()}</p>
                <p><strong>Check-out:</strong> {new Date(selectedBoarder.check_out).toLocaleDateString()}</p>
                <p><strong>Total Amount:</strong> {selectedBoarder.total_amount
                  ? formatCurrency(selectedBoarder.total_amount)
                  : "N/A"}</p>
              </div>
              {selectedBoarder.special_requests && (
                <div className="vet-info-section">
                  <h4>Special Requests</h4>
                  <p className="vet-special-requests">{selectedBoarder.special_requests}</p>
                </div>
              )}
              {selectedBoarder.emergency_contact && (
                <div className="vet-info-section vet-emergency">
                  <h4>Emergency Contact</h4>
                  <p><strong>Name:</strong> {selectedBoarder.emergency_contact}</p>
                  <p><strong>Phone:</strong> {selectedBoarder.emergency_phone}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default VetCurrentBoarders;
