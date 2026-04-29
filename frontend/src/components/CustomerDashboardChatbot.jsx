import { useState } from "react";
import { FaTimes, FaPaperPlane } from "react-icons/fa";
import chatbotLogo from "../assets/pawesome-icon.png";
import "./CustomerDashboardChatbot.css";

function getCustomerReply(message) {
  const text = message.toLowerCase();

  if (text.includes("booking") || text.includes("appointment")) {
    return "You can check your booking and appointment status in the My Bookings or Appointments section of your dashboard.";
  }

  if (text.includes("payment") || text.includes("paid")) {
    return "You can view your payment status in the Payments or Orders section. If it is still pending, wait for cashier verification.";
  }

  if (text.includes("pet")) {
    return "You can manage your pet records in the My Pets section.";
  }

  if (text.includes("order") || text.includes("product")) {
    return "You can track your product orders in the My Orders section.";
  }

  if (text.includes("cancel")) {
    return "If cancellation is allowed, open your booking or order details and click Cancel. If no cancel button appears, contact the receptionist.";
  }

  return "I can help you with your bookings, appointments, pets, orders, and payment status inside the Customer Dashboard.";
}

export default function CustomerDashboardChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I can help you with your customer dashboard records.",
    },
  ]);

  const sendMessage = () => {
    const message = input.trim();
    if (!message) return;

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: message },
      { sender: "bot", text: getCustomerReply(message) },
    ]);

    setInput("");
  };

  return (
    <>
      <button
        className="customer-chatbot-toggle"
        type="button"
        onClick={() => setOpen(true)}
      >
        <img src={chatbotLogo} alt="Pawesome Chatbot" className="chatbot-logo-img" />
      </button>

      {open && (
        <div className="customer-chatbot">
          <div className="customer-chatbot-header">
            <div>
              <strong>Customer Assistant</strong>
              <span>Bookings • Pets • Orders • Payments</span>
            </div>

            <button onClick={() => setOpen(false)}>
              <FaTimes />
            </button>
          </div>

          <div className="customer-chatbot-body">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="customer-chatbot-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask about your bookings, pets, orders..."
            />
            <button onClick={sendMessage}>
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
