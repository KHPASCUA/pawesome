import { useRef, useState } from "react";
import { FaUserCircle, FaCamera } from "react-icons/fa";
import "./DashboardProfile.css";

export default function DashboardProfile({
  name = "User",
  role = "Dashboard User",
  image = "",
  onUpload,
}) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(image);

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    if (onUpload) {
      onUpload(file);
    }
  };

  return (
    <div className="dashboard-profile-card">
      <button className="dashboard-profile-btn" type="button">
        <span className="dashboard-profile-avatar">
          {preview ? (
            <img src={preview} alt={`${name} profile`} />
          ) : (
            <FaUserCircle size={24} />
          )}
        </span>

        <span className="dashboard-profile-info">
          <strong>{name}</strong>
          <small>{role}</small>
        </span>
      </button>

      <button
        className="dashboard-profile-upload"
        type="button"
        onClick={() => fileRef.current?.click()}
      >
        <FaCamera size={15} />
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleChange}
      />
    </div>
  );
}
