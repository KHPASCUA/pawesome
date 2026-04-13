import React, { useState } from "react";
import "./LoginHistory.css";

const LoginHistory = () => {
  const [search, setSearch] = useState("");
  const [logs] = useState([
    { id: 1, user: "Sarah Johnson", email: "sarah@gmail.com", time: "2026-02-23 09:15 AM", ip: "192.168.1.100" },
    { id: 2, user: "Mike Chen", email: "mike@gmail.com", time: "2026-02-23 08:30 AM", ip: "192.168.1.101" },
    { id: 3, user: "Emily Davis", email: "emily@gmail.com", time: "2026-02-23 08:00 AM", ip: "192.168.1.102" },
    { id: 4, user: "James Wilson", email: "james@gmail.com", time: "2026-02-22 05:45 PM", ip: "192.168.1.103" },
  ]);

  const filteredLogs = logs.filter(
    (log) =>
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.email.toLowerCase().includes(search.toLowerCase()) ||
      log.ip.includes(search)
  );

  return (
    <div className="login-history">
      <div className="section-header">
        <h2>Login History</h2>
        <input
          type="text"
          placeholder="Search by user, email, or IP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-bar"
        />
      </div>

      <table className="history-table">
        <thead>
          <tr>
            <th>User</th><th>Email</th><th>Login Time</th><th>IP Address</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map((log) => (
            <tr key={log.id}>
              <td>{log.user}</td>
              <td>{log.email}</td>
              <td>{log.time}</td>
              <td>{log.ip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LoginHistory;