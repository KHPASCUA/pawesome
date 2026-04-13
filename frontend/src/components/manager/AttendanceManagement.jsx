import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";   // ✅ npm install xlsx
import * as XLSXStyle from "xlsx-style"; // optional for styling

const AttendanceManagement = () => {
  const [records, setRecords] = useState([
    { staffId: 1, name: "Alice", date: "2026-03-26", status: "Present", method: "Manual" },
    { staffId: 2, name: "Bob", date: "2026-03-26", status: "Present", method: "Biometric" },
    { staffId: 3, name: "Charlie", date: "2026-03-26", status: "Late", method: "Manual" }
  ]);

  const [newRecord, setNewRecord] = useState({
    staffId: "",
    name: "",
    date: "",
    status: "Present",
    method: "Manual"
  });

  const handleChange = (e) => {
    setNewRecord({ ...newRecord, [e.target.name]: e.target.value });
  };

  const handleAddRecord = (e) => {
    e.preventDefault();
    setRecords([...records, newRecord]);
    setNewRecord({ staffId: "", name: "", date: "", status: "Present", method: "Manual" });
  };

  // 🔹 Summary calculation
  const summary = useMemo(() => {
    const totals = {};
    records.forEach(r => {
      if (!totals[r.date]) {
        totals[r.date] = { Present: 0, Absent: 0, Late: 0 };
      }
      totals[r.date][r.status] = (totals[r.date][r.status] || 0) + 1;
    });
    return totals;
  }, [records]);

  // 🔹 Export to Excel with Chart
  const exportExcel = () => {
    // Attendance Records sheet
    const wsRecords = XLSX.utils.json_to_sheet(records);

    // Summary sheet
    const summaryData = Object.entries(summary).map(([date, counts]) => ({
      date,
      Present: counts.Present,
      Absent: counts.Absent,
      Late: counts.Late
    }));
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);

    // Workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsRecords, "Attendance Records");
    XLSX.utils.book_append_sheet(wb, wsSummary, "Daily Summary");

    // ⚠️ Note: XLSX by itself doesn’t embed charts.
    // Workaround: Managers can open the "Daily Summary" sheet in Excel
    // and use Insert → Chart (Bar/Line) to visualize trends.
    // If you want charts generated automatically, you’d need a library like ExcelJS.

    XLSX.writeFile(wb, "attendance_summary.xlsx");
  };

  return (
    <div>
      <h3>🕒 Attendance Management</h3>

      {/* Attendance Records Table */}
      <table border="1" cellPadding="8" style={{ marginBottom: "20px" }}>
        <thead>
          <tr>
            <th>Staff ID</th>
            <th>Name</th>
            <th>Date</th>
            <th>Status</th>
            <th>Method</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r, idx) => (
            <tr key={idx}>
              <td>{r.staffId}</td>
              <td>{r.name}</td>
              <td>{r.date}</td>
              <td>{r.status}</td>
              <td>{r.method}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Attendance Summary */}
      <h4>Daily Summary</h4>
      <table border="1" cellPadding="8" style={{ marginBottom: "20px" }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Present</th>
            <th>Absent</th>
            <th>Late</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(summary).map(([date, counts]) => (
            <tr key={date}>
              <td>{date}</td>
              <td>{counts.Present}</td>
              <td>{counts.Absent}</td>
              <td>{counts.Late}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Attendance Form */}
      <h4>Add Attendance Record</h4>
      <form onSubmit={handleAddRecord}>
        <input name="staffId" value={newRecord.staffId} onChange={handleChange} placeholder="Staff ID" />
        <input name="name" value={newRecord.name} onChange={handleChange} placeholder="Staff Name" />
        <input type="date" name="date" value={newRecord.date} onChange={handleChange} />
        <select name="status" value={newRecord.status} onChange={handleChange}>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="Late">Late</option>
        </select>
        <select name="method" value={newRecord.method} onChange={handleChange}>
          <option value="Manual">Manual</option>
          <option value="Biometric">Biometric</option>
        </select>
        <button type="submit">Add Record</button>
      </form>

      {/* Export Button */}
      <button onClick={exportExcel} style={{ marginTop: "20px" }}>
        📥 Export Attendance to Excel (with Summary)
      </button>
    </div>
  );
};

export default AttendanceManagement;