const db = require("../config/db");

exports.getRequests = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT 
        id,
        customer_name,
        request_type,
        service_name,
        request_date,
        status
      FROM booking_requests
      WHERE status IN ('pending', 'rescheduled')
      ORDER BY request_date DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Get receptionist requests error:", error);
    res.status(500).json({ message: "Failed to load requests" });
  }
};

exports.approveRequest = async (req, res) => {
  try {
    const { id } = req.params;

    await db.promise().query(
      "UPDATE booking_requests SET status = 'approved' WHERE id = ?",
      [id]
    );

    res.json({ message: "Request approved successfully" });
  } catch (error) {
    console.error("Approve request error:", error);
    res.status(500).json({ message: "Failed to approve request" });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;

    await db.promise().query(
      "UPDATE booking_requests SET status = 'rejected' WHERE id = ?",
      [id]
    );

    res.json({ message: "Request rejected successfully" });
  } catch (error) {
    console.error("Reject request error:", error);
    res.status(500).json({ message: "Failed to reject request" });
  }
};

exports.rescheduleRequest = async (req, res) => {
  try {
    const { id } = req.params;

    await db.promise().query(
      "UPDATE booking_requests SET status = 'rescheduled' WHERE id = ?",
      [id]
    );

    res.json({ message: "Request marked for reschedule" });
  } catch (error) {
    console.error("Reschedule request error:", error);
    res.status(500).json({ message: "Failed to reschedule request" });
  }
};
