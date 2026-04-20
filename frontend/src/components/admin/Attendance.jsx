import React, { useState, useEffect } from "react";
import "./Attendance.css";
import { attendanceApi } from "../../api/attendance";

const Attendance = () => {
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    user_id: "",
    date: selectedDate,
    check_in: "",
    check_out: "",
    status: "present",
    notes: "",
  });

  // Load attendance data
  useEffect(() => {
    const loadAttendance = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { date: selectedDate };
        if (search) {
          params.search = search;
        }
        const response = await attendanceApi.getAll(params);
        if (response.success) {
          const transformedData = response.data.map(record => ({
            id: record.id,
            employee: record.user?.name || 'Unknown',
            employeeId: record.user?.id,
            date: record.date,
            checkIn: record.check_in ? new Date(`2000-01-01T${record.check_in}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-',
            checkOut: record.check_out ? new Date(`2000-01-01T${record.check_out}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-',
            status: record.status.charAt(0).toUpperCase() + record.status.slice(1),
            rawStatus: record.status,
          }));
          setRecords(transformedData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, [selectedDate, search]);

  const filteredRecords = records;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await attendanceApi.create(formData);
      if (response.success) {
        const record = response.data;
        const newRecord = {
          id: record.id,
          employee: record.user?.name || 'Unknown',
          employeeId: record.user?.id,
          date: record.date,
          checkIn: record.check_in ? new Date(`2000-01-01T${record.check_in}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-',
          checkOut: record.check_out ? new Date(`2000-01-01T${record.check_out}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-',
          status: record.status.charAt(0).toUpperCase() + record.status.slice(1),
          rawStatus: record.status,
        };
        setRecords([...records, newRecord]);
        setShowModal(false);
        setFormData({ user_id: "", date: selectedDate, check_in: "", check_out: "", status: "present", notes: "" });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="attendance">
        <div className="loading">Loading attendance data...</div>
      </div>
    );
  }

  return (
    <div className="attendance">
      <div className="section-header">
        <h2>Attendance Tracking</h2>
        <div className="actions">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-picker"
          />
          <input
            type="text"
            placeholder="Search by employee..."
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