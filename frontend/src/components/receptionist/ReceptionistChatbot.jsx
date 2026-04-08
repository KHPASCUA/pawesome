import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRobot,
  faUser,
  faPaperPlane,
  faSearch,
  faComments,
  faPhone,
  faCalendarAlt,
  faHotel,
  faStethoscope,
  faCut,
  faQuestionCircle,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import "./ReceptionistChatbot.css";

const ReceptionistChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hello! I'm the Pawesome assistant. How can I help you today?",
      timestamp: "10:00 AM",
    },
    {
      id: 2,
      sender: "customer",
      text: "I'd like to book a hotel room for my dog",
      timestamp: "10:01 AM",
    },
    {
      id: 3,
      sender: "bot",
      text: "I can help you with that! What dates are you looking for and what size is your dog?",
      timestamp: "10:01 AM",
    },
  ]);
  
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const customerInquiries = [
    {
      id: 1,
      customer: "John Smith",
      message: "What are your hotel rates for small dogs?",
      category: "hotel",
      time: "9:45 AM",
      status: "pending",
      priority: "medium",
    },
    {
      id: 2,
      customer: "Sarah Johnson",
      message: "Do you have availability for a grooming appointment tomorrow?",
      category: "grooming",
      time: "10:15 AM",
      status: "answered",
      priority: "high",
    },
    {
      id: 3,
      customer: "Mike Davis",
      message: "My cat needs a vaccination. What's the process?",
      category: "vet",
      time: "10:30 AM",
      status: "pending",
      priority: "medium",
    },
    {
      id: 4,
      customer: "Emma Wilson",
      message: "Can I cancel my hotel booking for next week?",
      category: "hotel",
      time: "11:00 AM",
      status: "pending",
      priority: "low",
    },
  ];

  const quickResponses = [
    "I'll check our availability for you.",
    "Let me transfer you to our booking specialist.",
    "Our rates start from $25 per night for small dogs.",
    "We have openings available tomorrow at 2 PM and 4 PM.",
    "You can book online through our website or call us directly.",
  ];

  const filteredInquiries = customerInquiries.filter(inquiry => {
    const matchesSearch = inquiry.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         inquiry.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || inquiry.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: messages.length + 1,
        sender: "receptionist",
        text: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, newMsg]);
      setNewMessage("");
      
      // Simulate bot response
      setTimeout(() => {
        const botResponse = {
          id: messages.length + 2,
          sender: "bot",
          text: "Thank you for your message. Our team will get back to you shortly!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, botResponse]);
      }, 1000);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "hotel": return faHotel;
      case "vet": return faStethoscope;
      case "grooming": return faCut;
      default: return faQuestionCircle;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "warning";
      case "answered": return "success";
      case "escalated": return "danger";
      default: return "info";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "danger";
      case "medium": return "warning";
      case "low": return "info";
      default: return "info";
    }
  };

  return (
    <div className="receptionist-chatbot">
      <div className="chatbot-header">
        <div className="header-left">
          <h1>Customer Inquiries & Chatbot</h1>
          <p>Manage customer questions and automated responses</p>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <span className="stat-number">{customerInquiries.length}</span>
            <span className="stat-label">Total Inquiries</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{customerInquiries.filter(i => i.status === 'pending').length}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
      </div>

      <div className="chatbot-grid">
        <div className="inquiries-panel">
          <div className="panel-header">
            <h2>Customer Inquiries</h2>
            <div className="inquiry-controls">
              <div className="search-box">
                <FontAwesomeIcon icon={faSearch} />
                <input
                  type="text"
                  placeholder="Search inquiries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-filter"
              >
                <option value="all">All Categories</option>
                <option value="hotel">Hotel</option>
                <option value="vet">Veterinary</option>
                <option value="grooming">Grooming</option>
              </select>
            </div>
          </div>

          <div className="inquiries-list">
            {filteredInquiries.map((inquiry) => (
              <div key={inquiry.id} className="inquiry-item">
                <div className="inquiry-header">
                  <div className="customer-info">
                    <div className="customer-avatar">
                      <FontAwesomeIcon icon={faUser} />
                    </div>
                    <div>
                      <h4>{inquiry.customer}</h4>
                      <span className="inquiry-time">
                        <FontAwesomeIcon icon={faClock} />
                        {inquiry.time}
                      </span>
                    </div>
                  </div>
                  <div className="inquiry-badges">
                    <span className={`badge category-badge ${inquiry.category}`}>
                      <FontAwesomeIcon icon={getCategoryIcon(inquiry.category)} />
                      {inquiry.category}
                    </span>
                    <span className={`badge status-badge ${getStatusColor(inquiry.status)}`}>
                      {inquiry.status}
                    </span>
                    <span className={`badge priority-badge ${getPriorityColor(inquiry.priority)}`}>
                      {inquiry.priority}
                    </span>
                  </div>
                </div>
                <div className="inquiry-content">
                  <p>{inquiry.message}</p>
                </div>
                <div className="inquiry-actions">
                  <button className="action-btn primary-btn">Respond</button>
                  <button className="action-btn secondary-btn">Assign</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chat-panel">
          <div className="panel-header">
            <h2>
              <FontAwesomeIcon icon={faComments} />
              Live Chat
            </h2>
            <div className="chat-status">
              <span className="status-indicator online"></span>
              Online
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-avatar">
                  <FontAwesomeIcon icon={message.sender === 'bot' ? faRobot : faUser} />
                </div>
                <div className="message-content">
                  <div className="message-text">{message.text}</div>
                  <div className="message-time">{message.timestamp}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="quick-responses">
            <div className="quick-responses-header">
              <h3>Quick Responses</h3>
            </div>
            <div className="quick-responses-grid">
              {quickResponses.map((response, index) => (
                <button
                  key={index}
                  className="quick-response-btn"
                  onClick={() => setNewMessage(response)}
                >
                  {response}
                </button>
              ))}
            </div>
          </div>

          <div className="chat-input">
            <div className="input-group">
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button className="send-btn" onClick={handleSendMessage}>
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistChatbot;
