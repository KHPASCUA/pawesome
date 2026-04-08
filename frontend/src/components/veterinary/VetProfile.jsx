import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserMd,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faClock,
  faAward,
  faEdit,
  faCamera,
  faGraduationCap,
  faStethoscope,
  faLanguage,
  faCalendarAlt,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
import "./VetProfile.css";

const VetProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    personalInfo: {
      firstName: "Dr. Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@pawesomeretreat.com",
      phone: "+1 (555) 123-4567",
      address: "123 Pet Care Lane, Animal City, AC 12345",
      joinDate: "January 15, 2020",
      languages: ["English", "Spanish"],
    },
    professional: {
      licenseNumber: "VET-2020-12345",
      specialization: "Small Animal Medicine",
      experience: "8 years",
      education: "Doctor of Veterinary Medicine - University of Animal Health",
      certifications: [
        "American Veterinary Medical Association (AVMA)",
        "Board Certified in Small Animal Medicine",
        "Advanced Surgical Training Certificate",
      ],
      specialties: [
        "Internal Medicine",
        "Surgery",
        "Preventive Care",
        "Dental Care",
      ],
    },
    stats: {
      totalPatients: 1247,
      surgeriesPerformed: 342,
      consultations: 892,
      satisfactionRate: 98,
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
    <div className="vet-profile">
      <div className="profile-header">
        <div className="profile-title">
          <h2>
            <FontAwesomeIcon icon={faUserMd} /> Veterinarian Profile
          </h2>
          <p>Manage your professional information and credentials</p>
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
                <FontAwesomeIcon icon={faUserMd} />
                <button className="camera-btn">
                  <FontAwesomeIcon icon={faCamera} />
                </button>
              </div>
              <div className="avatar-info">
                <h3>
                  Dr. {profileData.personalInfo.firstName} {profileData.personalInfo.lastName}
                </h3>
                <p>{profileData.professional.specialization}</p>
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
              <div className="stat-number">{profileData.stats.totalPatients}</div>
              <div className="stat-label">Total Patients</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{profileData.stats.surgeriesPerformed}</div>
              <div className="stat-label">Surgeries</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{profileData.stats.consultations}</div>
              <div className="stat-label">Consultations</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{profileData.stats.satisfactionRate}%</div>
              <div className="stat-label">Satisfaction</div>
            </div>
          </div>
        </div>

        <div className="profile-grid">
          {/* Personal Information */}
          <div className="profile-card">
            <div className="card-header">
              <h3>
                <FontAwesomeIcon icon={faUserMd} /> Personal Information
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
                <div className="info-item full-width">
                  <label>
                    <FontAwesomeIcon icon={faLanguage} /> Languages
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.personalInfo.languages.join(", ")}
                      onChange={(e) =>
                        handleInputChange(
                          "personalInfo",
                          "languages",
                          e.target.value.split(", ").map(lang => lang.trim())
                        )
                      }
                    />
                  ) : (
                    <span>{profileData.personalInfo.languages.join(", ")}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="profile-card">
            <div className="card-header">
              <h3>
                <FontAwesomeIcon icon={faGraduationCap} /> Professional Information
              </h3>
            </div>
            <div className="card-content">
              <div className="info-grid">
                <div className="info-item full-width">
                  <label>License Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.professional.licenseNumber}
                      onChange={(e) =>
                        handleInputChange("professional", "licenseNumber", e.target.value)
                      }
                    />
                  ) : (
                    <span>{profileData.professional.licenseNumber}</span>
                  )}
                </div>
                <div className="info-item full-width">
                  <label>Specialization</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.professional.specialization}
                      onChange={(e) =>
                        handleInputChange("professional", "specialization", e.target.value)
                      }
                    />
                  ) : (
                    <span>{profileData.professional.specialization}</span>
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
                <div className="info-item">
                  <label>
                    <FontAwesomeIcon icon={faClock} /> Join Date
                  </label>
                  <span>{profileData.personalInfo.joinDate}</span>
                </div>
                <div className="info-item full-width">
                  <label>Education</label>
                  {isEditing ? (
                    <textarea
                      value={editedData.professional.education}
                      onChange={(e) =>
                        handleInputChange("professional", "education", e.target.value)
                      }
                      rows="2"
                    />
                  ) : (
                    <span>{profileData.professional.education}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="profile-card full-width">
            <div className="card-header">
              <h3>
                <FontAwesomeIcon icon={faAward} /> Certifications & Awards
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

          {/* Specialties */}
          <div className="profile-card full-width">
            <div className="card-header">
              <h3>
                <FontAwesomeIcon icon={faStethoscope} /> Medical Specialties
              </h3>
            </div>
            <div className="card-content">
              <div className="specialties-grid">
                {profileData.professional.specialties.map((specialty, index) => (
                  <div key={index} className="specialty-item">
                    <FontAwesomeIcon icon={faStethoscope} />
                    <span>{specialty}</span>
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

export default VetProfile;
