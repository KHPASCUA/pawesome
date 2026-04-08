import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserShield,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faClock,
  faAward,
  faEdit,
  faCamera,
  faGraduationCap,
  faCog,
  faCalendarAlt,
  faSave,
  faBuilding,
  faKey,
  faBell,
  faHistory,
} from "@fortawesome/free-solid-svg-icons";
import "./AdminProfile.css";

const AdminProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    personalInfo: {
      firstName: "Admin",
      lastName: "User",
      email: "admin@pawesomeretreat.com",
      phone: "+1 (555) 987-6543",
      address: "456 Admin Tower, Management City, MC 67890",
      joinDate: "January 2024",
      department: "System Administration",
    },
    professional: {
      employeeId: "ADMIN-2024-001",
      role: "System Administrator",
      accessLevel: "Full System Access",
      experience: "5 years",
      certifications: [
        "System Administration Certification",
        "Network Security Professional",
        "Database Management Expert",
      ],
      responsibilities: [
        "User Management",
        "System Configuration",
        "Security Oversight",
        "Report Generation",
      ],
    },
    stats: {
      totalUsersManaged: 156,
      systemUptime: "99.9%",
      securityIncidents: 2,
      efficiencyScore: 95,
    },
  });

  const [editedData, setEditedData] = useState({ ...profileData });

  const handleEdit = () => {
    setEditedData({ ...profileData });
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfileData({ ...editedData });
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleInputChange = (section, field, value) => {
    setEditedData({
      ...editedData,
      [section]: {
        ...editedData[section],
        [field]: value,
      },
    });
  };

  return (
    <div className="admin-profile">
      <div className="profile-header">
        <div className="profile-title">
          <h2>
            <FontAwesomeIcon icon={faUserShield} /> Administrator Profile
          </h2>
          <p>Manage your administrative credentials and system access</p>
        </div>
        {!isEditing && (
          <button className="edit-profile-btn" onClick={handleEdit}>
            <FontAwesomeIcon icon={faEdit} /> Edit Profile
          </button>
        )}
      </div>

      <div className="profile-content">
        {/* Profile Overview Card */}
        <div className="profile-overview-card">
          <div className="profile-avatar-section">
            <div className="avatar-container">
              <div className="avatar">
                <FontAwesomeIcon icon={faUserShield} />
                <button className="camera-btn">
                  <FontAwesomeIcon icon={faCamera} />
                </button>
              </div>
              <div className="avatar-info">
                <h3>
                  {profileData.personalInfo.firstName} {profileData.personalInfo.lastName}
                </h3>
                <p>{profileData.professional.role}</p>
                <div className="member-since">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  <span>Member since {profileData.personalInfo.joinDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="profile-stats">
            <div className="stat-item">
              <div className="stat-number">{profileData.stats.totalUsersManaged}</div>
              <div className="stat-label">Users Managed</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{profileData.stats.systemUptime}</div>
              <div className="stat-label">System Uptime</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{profileData.stats.securityIncidents}</div>
              <div className="stat-label">Security Events</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{profileData.stats.efficiencyScore}%</div>
              <div className="stat-label">Efficiency</div>
            </div>
          </div>
        </div>

        <div className="profile-grid">
          {/* Personal Information */}
          <div className="profile-card">
            <div className="card-header">
              <h3>
                <FontAwesomeIcon icon={faUserShield} /> Personal Information
              </h3>
            </div>
            <div className="card-content">
              <div className="info-grid">
                <div className="info-item">
                  <label>First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.personalInfo.firstName}
                      onChange={(e) =>
                        handleInputChange("personalInfo", "firstName", e.target.value)
                      }
                    />
                  ) : (
                    <span>{profileData.personalInfo.firstName}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.personalInfo.lastName}
                      onChange={(e) =>
                        handleInputChange("personalInfo", "lastName", e.target.value)
                      }
                    />
                  ) : (
                    <span>{profileData.personalInfo.lastName}</span>
                  )}
                </div>
                <div className="info-item full-width">
                  <label>
                    <FontAwesomeIcon icon={faEnvelope} /> Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedData.personalInfo.email}
                      onChange={(e) =>
                        handleInputChange("personalInfo", "email", e.target.value)
                      }
                    />
                  ) : (
                    <span>{profileData.personalInfo.email}</span>
                  )}
                </div>
                <div className="info-item full-width">
                  <label>
                    <FontAwesomeIcon icon={faPhone} /> Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedData.personalInfo.phone}
                      onChange={(e) =>
                        handleInputChange("personalInfo", "phone", e.target.value)
                      }
                    />
                  ) : (
                    <span>{profileData.personalInfo.phone}</span>
                  )}
                </div>
                <div className="info-item full-width">
                  <label>
                    <FontAwesomeIcon icon={faMapMarkerAlt} /> Address
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.personalInfo.address}
                      onChange={(e) =>
                        handleInputChange("personalInfo", "address", e.target.value)
                      }
                    />
                  ) : (
                    <span>{profileData.personalInfo.address}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>Department</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.personalInfo.department}
                      onChange={(e) =>
                        handleInputChange("personalInfo", "department", e.target.value)
                      }
                    />
                  ) : (
                    <span>{profileData.personalInfo.department}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>
                    <FontAwesomeIcon icon={faClock} /> Join Date
                  </label>
                  <span>{profileData.personalInfo.joinDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="profile-card">
            <div className="card-header">
              <h3>
                <FontAwesomeIcon icon={faCog} /> Professional Information
              </h3>
            </div>
            <div className="card-content">
              <div className="info-grid">
                <div className="info-item full-width">
                  <label>Employee ID</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.professional.employeeId}
                      onChange={(e) =>
                        handleInputChange("professional", "employeeId", e.target.value)
                      }
                    />
                  ) : (
                    <span>{profileData.professional.employeeId}</span>
                  )}
                </div>
                <div className="info-item full-width">
                  <label>System Role</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.professional.role}
                      onChange={(e) =>
                        handleInputChange("professional", "role", e.target.value)
                      }
                    />
                  ) : (
                    <span>{profileData.professional.role}</span>
                  )}
                </div>
                <div className="info-item full-width">
                  <label>Access Level</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.professional.accessLevel}
                      onChange={(e) =>
                        handleInputChange("professional", "accessLevel", e.target.value)
                      }
                    />
                  ) : (
                    <span>{profileData.professional.accessLevel}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>Experience</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.professional.experience}
                      onChange={(e) =>
                        handleInputChange("professional", "experience", e.target.value)
                      }
                    />
                  ) : (
                    <span>{profileData.professional.experience}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="profile-card full-width">
            <div className="card-header">
              <h3>
                <FontAwesomeIcon icon={faAward} /> Certifications & Qualifications
              </h3>
            </div>
            <div className="card-content">
              <div className="certifications-list">
                {profileData.professional.certifications.map((cert, index) => (
                  <div key={index} className="certification-item">
                    <div className="cert-icon">
                      <FontAwesomeIcon icon={faAward} />
                    </div>
                    <div className="cert-content">
                      <h4>{cert}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Responsibilities */}
          <div className="profile-card full-width">
            <div className="card-header">
              <h3>
                <FontAwesomeIcon icon={faBuilding} /> System Responsibilities
              </h3>
            </div>
            <div className="card-content">
              <div className="specialties-grid">
                {profileData.professional.responsibilities.map((responsibility, index) => (
                  <div key={index} className="specialty-item">
                    <FontAwesomeIcon icon={faCog} />
                    <span>{responsibility}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="profile-actions">
            <button className="save-btn" onClick={handleSave}>
              <FontAwesomeIcon icon={faSave} /> Save Changes
            </button>
            <button className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;
