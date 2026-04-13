import React, { useState } from "react";
import "./Attendance.css";

const Attendance = () => {
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState([
    { id: 1, employee: "Mike Chen", date: "2026-02-23", checkIn: "08:30 AM", checkOut: "05:30 PM", status: "Present" },
    { id: 2, employee: "Emily Davis", date: "2026-02-23", checkIn: "08:00 AM", checkOut: "05:00 PM", status: "Present" },
    { id: 3, employee: "James Wilson", date: "2026-02-23", checkIn: "09:00 AM", checkOut: "-", status: "Working" },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employee: "",
    date: "",
    checkIn: "",
    checkOut: "",
    status: "Present",
  });

  const filteredRecords = records.filter(
    (rec) =>
      rec.employee.toLowerCase().includes(search.toLowerCase()) ||
      rec.date.includes(search) ||
      rec.status.toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const newRecord = {
      id: records.length + 1,
      ...formData,
    };
    setRecords([...records, newRecord]);
    setShowModal(false);
    setFormData({ employee: "", date: "", checkIn: "", checkOut: "", status: "Present" });
  };

  return (
    <div className="attendance">
      <div className="section-header">
        <h2>Attendance Tracking</h2>
        <div className="actions">
          <input
            type="text"
            placeholder="Search by employee, date, or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar"
          />
          <button className="mark-btn" onClick={() => setShowModal(true)}>
            + Mark Attendance
          </button>
        </div>
      </div>

      <table className="attendance-table">
        <thead>
          <tr>
            <th>Employee</th><th>Date</th><th>Check In</th><th>Check Out</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredRecords.map((rec) => (
            <tr key={rec.id}>
              <td>{rec.employee}</td>
              <td>{rec.date}</td>
              <td>{rec.checkIn}</td>
              <td>{rec.checkOut}</td>
              <td>
                <span className={`status ${rec.status.toLowerCase()}`}>
                  {rec.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for marking attendance */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Mark Attendance</h3>
            <form className="attendance-form">
              <label>
                Employee:
                <input type="text" name="employee" value={formData.employee} onChange={handleChange} />
              </label>
              <label>
                Date:
                <input type="date" name="date" value={formData.date} onChange={handleChange} />
              </label>
              <label>
                Check In:
                <input type="time" name="checkIn" value={formData.checkIn} onChange={handleChange} />
              </label>
              <label>
                Check Out:
                <input type="time" name="checkOut" value={formData.checkOut} onChange={handleChange} />
              </label>
              <label>
                Status:
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="Present">Present</option>
                  <option value="Working">Working</option>
                  <option value="Absent">Absent</option>
                </select>
              </label>
            </form>
            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button className="confirm-btn" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;