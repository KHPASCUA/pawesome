import { useState } from "react";
import { X, Send } from "lucide-react";
import chatbotLogo from "../assets/pawesome-icon.png";
import "./LandingChatbot.css";

const quickReplies = [
  "How to register",
  "How to login",
  "Available services",
  "How to book",
  "How to buy products",
  "Basic payment guide",
];

function getBotReply(message) {
  const text = message.toLowerCase();

  const privateKeywords = [
    "my booking",
    "my appointment",
    "my payment",
    "my pet",
    "my order",
    "my history",
    "my records",
    "status of my",
    "track my",
  ];

  if (privateKeywords.some((word) => text.includes(word))) {
    return "For personal booking status, payment status, pet records, order tracking, and appointment history, please login first and use the Customer Dashboard assistant.";
  }

  if (text.includes("register") || text.includes("account") || text.includes("sign up")) {
    return "To create a customer account, click Register on the landing page, fill out your details, then login using your email and password.";
  }

  if (text.includes("login") || text.includes("log in")) {
    return "Click the Login button, then enter your customer email and password to access your Customer Dashboard.";
  }

  if (text.includes("book") || text.includes("appointment")) {
    return "To book a service, create or login to your customer account, then go to the Customer Dashboard and choose your preferred service schedule.";
  }

  if (
    text.includes("service") ||
    text.includes("vet") ||
    text.includes("groom") ||
    text.includes("hotel")
  ) {
    return "Pawesome offers veterinary services, grooming, pet hotel booking, and pet care services. Login as a customer to request a service.";
  }

  if (text.includes("product") || text.includes("store") || text.includes("buy")) {
    return "Customers can browse and buy available pet products in the Customer Dashboard after logging in.";
  }

  if (text.includes("payment") || text.includes("pay")) {
    return "Payment instructions will be shown after submitting a booking or order. For personal payment status, please login first.";
  }

  return "Hi! I can help with registration, login, services, booking, products, and basic payment instructions.";
}

export default function LandingChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! Welcome to Pawesome. How can I help you today?",
    },
  ]);

  const sendMessage = (customMessage) => {
    const message = customMessage || input.trim();
    if (!message) return;

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: message },
      { sender: "bot", text: getBotReply(message) },
    ]);

    setInput("");
  };

  return (
    <>
      <button
        className="landing-chatbot-toggle"
        type="button"
        onClick={() => setOpen(true)}
      >
        <img src={chatbotLogo} alt="Pawesome Chatbot" className="chatbot-logo-img" />
      </button>

      {open && (
        <div className="landing-chatbot">
          <div className="landing-chatbot-header">
            <div>
              <strong>Pawesome Assistant</strong>
              <span>For new users</span>
            </div>
            <button onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="landing-chatbot-body">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}

            <div className="quick-replies">
              {quickReplies.map((reply) => (
                <button key={reply} onClick={() => sendMessage(reply)}>
                  {reply}
                </button>
              ))}
            </div>
          </div>

          <div className="landing-chatbot-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask something..."
            />
            <button onClick={() => sendMessage()}>
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
