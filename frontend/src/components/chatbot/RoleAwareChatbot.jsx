import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRobot,
  faPaperPlane,
  faXmark,
  faRotateRight,
  faCashRegister,
  faChartLine,
  faBoxOpen,
  faCalendarCheck,
  faWandMagicSparkles,
  faUsers,
  faCalendarPlus,
  faTriangleExclamation,
  faPercent,
  faReceipt,
} from "@fortawesome/free-solid-svg-icons";
import {
  createChatbotBooking,
  createChatbotHotelBooking,
  fetchBookingOptions,
  fetchChatbotWelcome,
  fetchHotelOptions,
  lookupChatbotAppointments,
  searchChatbotInventory,
  sendChatbotMessage,
} from "../../services/chatbotService";
import { apiRequest } from "../../api/client";
import "./RoleAwareChatbot.css";

const formatMessage = (text) => (text || "").split("\n");

const CUSTOMER_APPROVAL_NOTICE =
  "Reminder: Customer booking requests are not automatically confirmed. The receptionist must review, approve, reject, or reschedule the request first.";

const normalizeCustomerBotReply = (reply = "", role = "user") => {
  if (role !== "customer") return reply;

  const lowerReply = reply.toLowerCase();

  const approvalKeywords = [
    "confirmed",
    "approved",
    "successfully booked",
    "booking is confirmed",
    "appointment is confirmed",
  ];

  const needsCorrection = approvalKeywords.some((keyword) =>
    lowerReply.includes(keyword)
  );

  if (!needsCorrection) return reply;

  return reply
    .replace(/your booking is confirmed/gi, "your booking request has been submitted")
    .replace(/your appointment is confirmed/gi, "your appointment request has been submitted")
    .replace(/successfully booked/gi, "submitted for receptionist review")
    .replace(/confirmed/gi, "pending receptionist approval")
    .replace(/approved/gi, "waiting for receptionist approval")
    .concat(`\n\n${CUSTOMER_APPROVAL_NOTICE}`);
};

const RoleAwareChatbot = ({
  mode = "widget",
  title = "Pawesome Assistant",
  subtitle = "Shared RBAC chatbot",
  role: propRole,
}) => {
  const role = propRole || localStorage.getItem("role") || "user";
  const [isOpen, setIsOpen] = useState(mode === "embedded");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [error, setError] = useState("");
  const [workflow, setWorkflow] = useState(null);
  const [workflowState, setWorkflowState] = useState({
    loading: false,
    error: "",
    options: { pets: [], services: [], rooms: [] },
    results: [],
    form: {
      pet_id: "",
      service_id: "",
      scheduled_at: "",
      query: "",
      // Hotel booking form fields
      hotel_pet_id: "",
      hotel_room_id: "",
      check_in: "",
      check_out: "",
      special_requests: "",
    },
  });
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadWelcome = async () => {
      try {
        setIsBootstrapping(true);
        const data = await fetchChatbotWelcome();
        setMessages([
          {
            sender: "bot",
            text: data.message,
            suggestions: data.suggestions || [],
          },
        ]);
      } catch (err) {
        setError(err.message || "Failed to load chatbot.");
      } finally {
        setIsBootstrapping(false);
      }
    };

    loadWelcome();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const [typingMessage, setTypingMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const submitMessage = async (messageText) => {
    const trimmed = messageText.trim();
    if (!trimmed || isLoading) {
      return;
    }

    const timestamp = new Date().toISOString();
    setMessages((prev) => [...prev, { sender: "user", text: trimmed, timestamp }]);
    setInput("");
    setError("");
    setIsLoading(true);

    try {
      const data = await sendChatbotMessage(trimmed);

      // Customer-side safety rule:
      // customers can request bookings, but only receptionist can approve/reject/reschedule.
      const replyText = normalizeCustomerBotReply(data.reply, role);

      // Simulate typing effect for more natural feel
      setIsTyping(true);
      let currentText = "";
      const words = replyText.split(" ");

      for (let i = 0; i < words.length; i++) {
        currentText += (i > 0 ? " " : "") + words[i];
        setTypingMessage(currentText);
        await new Promise((resolve) => setTimeout(resolve, 30)); // Typing speed
      }

      setIsTyping(false);
      setTypingMessage("");

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: replyText,
          suggestions: data.suggestions || [],
          actions: data.actions || [],
          source: data.source || "rule_based",
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setError(err.message || "Unable to reach the chatbot service.");
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();
    submitMessage(input);
  };

  const onAction = (path) => {
    if (!path) {
      return;
    }

    navigate(path);
    if (mode === "widget") {
      setIsOpen(false);
    }
  };

  const openWorkflow = async (workflowName) => {
    setWorkflow(workflowName);
    setWorkflowState((prev) => ({
      ...prev,
      loading: workflowName === "create_booking",
      error: "",
      results: [],
    }));

    if (workflowName === "create_booking") {
      try {
        const data = await fetchBookingOptions();
        setWorkflowState((prev) => ({
          ...prev,
          loading: false,
          options: {
            pets: data.pets || [],
            services: data.services || [],
          },
          form: {
            ...prev.form,
            pet_id: data.pets?.[0]?.id?.toString() || "",
            service_id: data.services?.[0]?.id?.toString() || "",
          },
        }));
      } catch (err) {
        setWorkflowState((prev) => ({
          ...prev,
          loading: false,
          error: err.message || "Failed to load booking options.",
        }));
      }
    }

    if (workflowName === "hotel_booking") {
      try {
        const data = await fetchHotelOptions();
        setWorkflowState((prev) => ({
          ...prev,
          loading: false,
          options: {
            pets: data.pets || [],
            rooms: data.rooms || [],
          },
          form: {
            ...prev.form,
            hotel_pet_id: data.pets?.[0]?.id?.toString() || "",
            hotel_room_id: "",
            check_in: "",
            check_out: "",
          },
        }));
      } catch (err) {
        setWorkflowState((prev) => ({
          ...prev,
          loading: false,
          error: err.message || "Failed to load hotel options.",
        }));
      }
    }
  };

  const closeWorkflow = () => {
    setWorkflow(null);
    setWorkflowState((prev) => ({
      ...prev,
      loading: false,
      error: "",
      results: [],
    }));
  };

  const updateWorkflowForm = (key, value) => {
    setWorkflowState((prev) => ({
      ...prev,
      form: {
        ...prev.form,
        [key]: value,
      },
    }));
  };

  const submitBookingWorkflow = async (event) => {
    event.preventDefault();
    setWorkflowState((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      const data = await createChatbotBooking({
        pet_id: Number(workflowState.form.pet_id),
        service_id: Number(workflowState.form.service_id),
        scheduled_at: workflowState.form.scheduled_at,
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `Booking request submitted for ${data.appointment?.pet?.name || "your pet"} on ${data.appointment?.scheduled_at || workflowState.form.scheduled_at}. Your request is waiting for receptionist approval.`,
          suggestions: ["Check my booking status", "How do I upload payment receipt?"],
        },
      ]);
      closeWorkflow();
    } catch (err) {
      setWorkflowState((prev) => ({
        ...prev,
        loading: false,
        error: err.message || "Failed to create booking.",
      }));
    }
  };

  const submitLookupWorkflow = async (event) => {
    event.preventDefault();
    setWorkflowState((prev) => ({ ...prev, loading: true, error: "", results: [] }));

    try {
      const data = await lookupChatbotAppointments(workflowState.form.query);
      setWorkflowState((prev) => ({
        ...prev,
        loading: false,
        results: data || [],
      }));
    } catch (err) {
      setWorkflowState((prev) => ({
        ...prev,
        loading: false,
        error: err.message || "Failed to look up appointments.",
      }));
    }
  };

  const submitInventoryWorkflow = async (event) => {
    event.preventDefault();
    setWorkflowState((prev) => ({ ...prev, loading: true, error: "", results: [] }));

    try {
      const data = await searchChatbotInventory(workflowState.form.query);
      setWorkflowState((prev) => ({
        ...prev,
        loading: false,
        results: data || [],
      }));
    } catch (err) {
      setWorkflowState((prev) => ({
        ...prev,
        loading: false,
        error: err.message || "Failed to search inventory.",
      }));
    }
  };

  const submitTransactionLookupWorkflow = async (event) => {
    event.preventDefault();
    setWorkflowState((prev) => ({ ...prev, loading: true, error: "", results: [] }));

    try {
      const data = await apiRequest(`/cashier/transactions/search?q=${workflowState.form.query}`);
      setWorkflowState((prev) => ({
        ...prev,
        loading: false,
        results: data || [],
      }));
    } catch (err) {
      setWorkflowState((prev) => ({
        ...prev,
        loading: false,
        error: err.message || "Failed to search transactions.",
      }));
    }
  };

  const submitHotelBookingWorkflow = async (event) => {
    event.preventDefault();
    setWorkflowState((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      const data = await createChatbotHotelBooking({
        pet_id: Number(workflowState.form.hotel_pet_id),
        hotel_room_id: Number(workflowState.form.hotel_room_id),
        check_in: workflowState.form.check_in,
        check_out: workflowState.form.check_out,
        special_requests: workflowState.form.special_requests,
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `Hotel booking request submitted for ${data.boarding?.pet?.name || "your pet"} from ${workflowState.form.check_in} to ${workflowState.form.check_out}. Your request is waiting for receptionist approval.`,
          suggestions: ["Check my booking status", "How do I upload payment receipt?"],
        },
      ]);
      closeWorkflow();
    } catch (err) {
      setWorkflowState((prev) => ({
        ...prev,
        loading: false,
        error: err.message || "Failed to create hotel booking.",
      }));
    }
  };

  const quickActionsByRole = {
    customer: [
      {
        label: "Book Service",
        icon: faCalendarPlus,
        workflow: "create_booking",
      },
      {
        label: "Hotel Stay",
        icon: faCalendarPlus,
        workflow: "hotel_booking",
      },
      {
        label: "Booking Status",
        icon: faCalendarCheck,
        message:
          "Check my booking status. Explain that the receptionist approves, rejects, or reschedules booking requests.",
      },
      {
        label: "Payment Receipt",
        icon: faReceipt,
        message:
          "How do I upload a payment receipt and who verifies it?",
      },
      {
        label: "Reschedule",
        icon: faRotateRight,
        message:
          "Can I request to reschedule my booking? Explain that the receptionist must approve the new schedule.",
      },
      {
        label: "Cancel Booking",
        icon: faXmark,
        message:
          "Can I cancel my booking? Explain the rule for pending, approved, and completed bookings.",
      },
      {
        label: "Receptionist",
        icon: faUsers,
        message:
          "How can I contact the receptionist about my booking request?",
      },
    ],
    cashier: [
      {
        label: "POS Help",
        icon: faCashRegister,
        message: "How do I process a cashier POS transaction?",
      },
      {
        label: "Payment Verification",
        icon: faCalendarCheck,
        message: "How do I verify and confirm payments for approved bookings?",
      },
      {
        label: "Transaction Lookup",
        icon: faCalendarCheck,
        workflow: "transaction_lookup",
      },
      {
        label: "Refund Help",
        icon: faRotateRight,
        message: "How do I process a refund?",
      },
      {
        label: "Discount Help",
        icon: faPercent,
        message: "How do I apply discount codes?",
      },
      {
        label: "Multi-Payment Help",
        icon: faCashRegister,
        message: "How do I process split payments?",
      },
      {
        label: "Receipt Help",
        icon: faReceipt,
        message: "How do I generate receipts?",
      },
      {
        label: "Inventory Search",
        icon: faBoxOpen,
        workflow: "inventory_search",
      },
    ],
    admin: [
      {
        label: "Dashboard Help",
        icon: faChartLine,
        message: "Explain the admin dashboard summary.",
      },
      {
        label: "User Management",
        icon: faUsers,
        message: "How do I manage system users?",
      },
      {
        label: "Reports Help",
        icon: faChartLine,
        message: "How do I generate admin reports?",
      },
    ],
    receptionist: [
      {
        label: "Booking Lookup",
        icon: faCalendarCheck,
        workflow: "appointment_lookup",
      },
      {
        label: "Approve/Reject",
        icon: faCalendarPlus,
        message: "How do I approve or reject booking requests from customers?",
      },
      {
        label: "Create Booking",
        icon: faCalendarPlus,
        workflow: "create_booking",
      },
      {
        label: "Customer Help",
        icon: faUsers,
        message: "How do I manage customer records?",
      },
    ],
    inventory: [
      {
        label: "Inventory Search",
        icon: faBoxOpen,
        workflow: "inventory_search",
      },
      {
        label: "Low Stock Help",
        icon: faTriangleExclamation,
        message: "How do I monitor low stock items?",
      },
    ],
  };

  const quickActions = quickActionsByRole[role] || [
    {
      label: "Dashboard Help",
      icon: faChartLine,
      message: "Help me understand this dashboard.",
    },
  ];

  const handleNewChat = async () => {
    setMessages([]);
    setInput("");
    setError("");
    setTypingMessage("");
    setIsTyping(false);

    try {
      setIsBootstrapping(true);
      const data = await fetchChatbotWelcome();

      setMessages([
        {
          sender: "bot",
          text: data.message,
          suggestions: data.suggestions || [],
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setError(err.message || "Failed to restart chatbot.");
    } finally {
      setIsBootstrapping(false);
    }
  };

  const containerClass = `rbac-chatbot ${mode} ${isOpen ? "open" : ""}`;

  return (
    <div className={containerClass}>
      {mode === "widget" && !isOpen && (
        <button
          type="button"
          className="rbac-chatbot-toggle"
          onClick={() => setIsOpen(true)}
        >
          <span className="rbac-chatbot-toggle-icon">
            <FontAwesomeIcon icon={faRobot} />
          </span>
          <span className="rbac-chatbot-toggle-text">Assistant</span>
        </button>
      )}

      {isOpen && (
        <section className="rbac-chatbot-panel">
          <header className="rbac-chatbot-header">
            <div className="rbac-chatbot-title-wrap">
              <span className="rbac-chatbot-header-icon">
                <FontAwesomeIcon icon={faRobot} />
              </span>

              <div>
                <h3>{title}</h3>
                <p>{subtitle}</p>
              </div>
            </div>

            <div className="rbac-chatbot-header-actions">
              <button
                type="button"
                className="rbac-chatbot-icon-btn"
                onClick={handleNewChat}
                title="New Chat"
              >
                <FontAwesomeIcon icon={faRotateRight} />
              </button>

              {mode === "widget" && (
                <button
                  type="button"
                  className="rbac-chatbot-icon-btn"
                  onClick={() => setIsOpen(false)}
                  title="Close"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              )}
            </div>
          </header>

          <div className="rbac-chatbot-body">
            {!isBootstrapping && role === "customer" && (
              <div className="rbac-customer-flow-notice">
                <strong>Receptionist Approval Required</strong>
                <span>
                  You can submit booking requests here, but only the receptionist can approve,
                  reject, reschedule, or verify payment.
                </span>
              </div>
            )}

            {!isBootstrapping && (
              <div className="rbac-quick-actions-bar">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    className="rbac-quick-action"
                    onClick={() => {
                      if (action.workflow) {
                        openWorkflow(action.workflow);
                      } else {
                        submitMessage(action.message);
                      }
                    }}
                  >
                    <FontAwesomeIcon icon={action.icon} />
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            )}

            {isBootstrapping ? (
              <div className="rbac-chatbot-state">Loading chatbot...</div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div key={`${message.sender}-${index}`} className={`rbac-chat-message ${message.sender}`}>
                    <div className="rbac-chat-bubble">
                      {formatMessage(message.text).map((line, lineIndex) => (
                        <p key={lineIndex}>{line}</p>
                      ))}
                      {message.source === "ai" && message.sender === "bot" && (
                        <span className="rbac-ai-indicator" title="AI-generated response">
                          <FontAwesomeIcon icon={faWandMagicSparkles} />
                          AI
                        </span>
                      )}
                      {message.suggestions?.length > 0 && (
                        <div className="rbac-chat-actions">
                          {message.suggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              className="rbac-chip"
                              onClick={() => submitMessage(suggestion)}
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                      {message.actions?.length > 0 && (
                        <div className="rbac-chat-actions">
                          {message.actions.map((action) => (
                            <button
                              key={`${action.label}-${action.path}`}
                              type="button"
                              className="rbac-link-action"
                              onClick={() =>
                                action.type === "workflow"
                                  ? openWorkflow(action.workflow)
                                  : onAction(action.path)
                              }
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="rbac-message rbac-message-bot">
                    <div className="rbac-message-avatar">
                      <span className="rbac-typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </span>
                    </div>
                    <div className="rbac-message-content">
                      <div className="rbac-message-text">{typingMessage}<span className="rbac-cursor">|</span></div>
                    </div>
                  </div>
                )}
                {isLoading && !isTyping && <div className="rbac-chatbot-state">Assistant is thinking...</div>}
                {error && <div className="rbac-chatbot-error">{error}</div>}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="rbac-chatbot-form" onSubmit={onSubmit}>
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={
                role === "customer"
                  ? "Ask about booking requests, status, payment, or receptionist approval..."
                  : "Ask about bookings, services, logs, or dashboard help..."
              }
              disabled={isLoading || isBootstrapping}
            />
            <button type="submit" disabled={!input.trim() || isLoading || isBootstrapping}>
              <FontAwesomeIcon icon={faPaperPlane} />
              Send
            </button>
          </form>
        </section>
      )}

      {workflow && (
        <div className="rbac-workflow-overlay" onClick={closeWorkflow}>
          <div className="rbac-workflow-modal" onClick={(event) => event.stopPropagation()}>
            <div className="rbac-workflow-header">
              <h4>
                {workflow === "create_booking" && "Create Booking"}
                {workflow === "appointment_lookup" && "Appointment Lookup"}
                {workflow === "inventory_search" && "Inventory Search"}
                {workflow === "hotel_booking" && "Book Pet Hotel Stay"}
                {workflow === "transaction_lookup" && "Transaction Lookup"}
              </h4>
              <button type="button" onClick={closeWorkflow}>Close</button>
            </div>

            {workflow === "create_booking" && (
              <form className="rbac-workflow-form" onSubmit={submitBookingWorkflow}>
                <label>
                  Pet
                  <select
                    value={workflowState.form.pet_id}
                    onChange={(event) => updateWorkflowForm("pet_id", event.target.value)}
                  >
                    {workflowState.options.pets.map((pet) => (
                      <option key={pet.id} value={pet.id}>
                        {pet.name} {pet.species ? `(${pet.species})` : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Service
                  <select
                    value={workflowState.form.service_id}
                    onChange={(event) => updateWorkflowForm("service_id", event.target.value)}
                  >
                    {workflowState.options.services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} (₱{Number(service.price || 0).toFixed(2)})
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Schedule
                  <input
                    type="datetime-local"
                    value={workflowState.form.scheduled_at}
                    onChange={(event) => updateWorkflowForm("scheduled_at", event.target.value)}
                    required
                  />
                </label>
                <button type="submit" disabled={workflowState.loading}>
                  {workflowState.loading ? "Submitting..." : "Submit Booking Request"}
                </button>
              </form>
            )}

            {workflow === "appointment_lookup" && (
              <form className="rbac-workflow-form" onSubmit={submitLookupWorkflow}>
                <label>
                  Search appointments
                  <input
                    type="text"
                    value={workflowState.form.query}
                    onChange={(event) => updateWorkflowForm("query", event.target.value)}
                    placeholder="Pet, customer, service, or status"
                  />
                </label>
                <button type="submit" disabled={workflowState.loading}>
                  {workflowState.loading ? "Searching..." : "Search"}
                </button>
              </form>
            )}

            {workflow === "inventory_search" && (
              <form className="rbac-workflow-form" onSubmit={submitInventoryWorkflow}>
                <label>
                  Search inventory
                  <input
                    type="text"
                    value={workflowState.form.query}
                    onChange={(event) => updateWorkflowForm("query", event.target.value)}
                    placeholder="Product name, SKU, or description"
                    required
                  />
                </label>
                <button type="submit" disabled={workflowState.loading}>
                  {workflowState.loading ? "Searching..." : "Search"}
                </button>
              </form>
            )}

            {workflow === "transaction_lookup" && (
              <form className="rbac-workflow-form" onSubmit={submitTransactionLookupWorkflow}>
                <label>
                  Search transactions
                  <input
                    type="text"
                    value={workflowState.form.query}
                    onChange={(event) => updateWorkflowForm("query", event.target.value)}
                    placeholder="Transaction ID, customer name, or amount"
                    required
                  />
                </label>
                <button type="submit" disabled={workflowState.loading}>
                  {workflowState.loading ? "Searching..." : "Search"}
                </button>
              </form>
            )}

            {workflow === "hotel_booking" && (
              <form className="rbac-workflow-form" onSubmit={submitHotelBookingWorkflow}>
                <label>
                  Pet
                  <select
                    value={workflowState.form.hotel_pet_id}
                    onChange={(event) => updateWorkflowForm("hotel_pet_id", event.target.value)}
                  >
                    {workflowState.options.pets.map((pet) => (
                      <option key={pet.id} value={pet.id}>
                        {pet.name} {pet.species ? `(${pet.species})` : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Check-in Date
                  <input
                    type="date"
                    value={workflowState.form.check_in}
                    onChange={(event) => updateWorkflowForm("check_in", event.target.value)}
                    required
                  />
                </label>
                <label>
                  Check-out Date
                  <input
                    type="date"
                    value={workflowState.form.check_out}
                    onChange={(event) => updateWorkflowForm("check_out", event.target.value)}
                    required
                  />
                </label>
                <label>
                  Room (Optional - leave empty for auto-assignment)
                  <select
                    value={workflowState.form.hotel_room_id}
                    onChange={(event) => updateWorkflowForm("hotel_room_id", event.target.value)}
                  >
                    <option value="">Auto-assign available room</option>
                    {workflowState.options.rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.room_number} - {room.type} (₱{room.daily_rate}/night)
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Special Requests
                  <textarea
                    value={workflowState.form.special_requests}
                    onChange={(event) => updateWorkflowForm("special_requests", event.target.value)}
                    placeholder="Any special care instructions..."
                    rows="3"
                  />
                </label>
                <button type="submit" disabled={workflowState.loading}>
                  {workflowState.loading ? "Submitting..." : "Submit Hotel Request"}
                </button>
              </form>
            )}

            {workflowState.error && <div className="rbac-chatbot-error">{workflowState.error}</div>}
            {workflowState.loading && workflow !== "create_booking" && (
              <div className="rbac-chatbot-state">Loading workflow...</div>
            )}

            {workflowState.results.length > 0 && (
              <div className="rbac-workflow-results">
                {workflowState.results.map((item) => (
                  <div key={`${workflow}-${item.id}`} className="rbac-result-card">
                    {workflow === "appointment_lookup" ? (
                      <>
                        <strong>{item.pet || "Pet"} - {item.service || "Service"}</strong>
                        <span>{item.customer || "Customer"} | {item.status}</span>
                        <span>{item.scheduled_at}</span>
                      </>
                    ) : workflow === "transaction_lookup" ? (
                      <>
                        <strong>#{item.id || item.transaction_id}</strong>
                        <span>{item.customer || "Guest"} | {item.payment_type}</span>
                        <span>Amount: ₱{Number(item.amount || 0).toFixed(2)}</span>
                        <span>{item.date || item.created_at}</span>
                      </>
                    ) : (
                      <>
                        <strong>{item.name}</strong>
                        <span>SKU: {item.sku}</span>
                        <span>Stock: {item.stock}</span>
                        <span>Price: ₱{Number(item.price || 0).toFixed(2)}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!workflowState.loading && workflowState.results.length === 0 && workflowState.form.query && workflow !== "create_booking" && !workflowState.error && (
              <div className="rbac-chatbot-state">No results found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleAwareChatbot;
