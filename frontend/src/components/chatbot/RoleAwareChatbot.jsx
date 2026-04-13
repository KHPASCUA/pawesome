import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createChatbotBooking,
  fetchBookingOptions,
  fetchChatbotWelcome,
  lookupChatbotAppointments,
  searchChatbotInventory,
  sendChatbotMessage,
} from "../../services/chatbotService";
import "./RoleAwareChatbot.css";

const formatMessage = (text) => text.split("\n");

const RoleAwareChatbot = ({
  mode = "widget",
  title = "Pawesome Assistant",
  subtitle = "Shared RBAC chatbot",
}) => {
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
    options: { pets: [], services: [] },
    results: [],
    form: {
      pet_id: "",
      service_id: "",
      scheduled_at: "",
      query: "",
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

  const submitMessage = async (messageText) => {
    const trimmed = messageText.trim();
    if (!trimmed || isLoading) {
      return;
    }

    setMessages((prev) => [...prev, { sender: "user", text: trimmed }]);
    setInput("");
    setError("");
    setIsLoading(true);

    try {
      const data = await sendChatbotMessage(trimmed);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.reply,
          suggestions: data.suggestions || [],
          actions: data.actions || [],
        },
      ]);
    } catch (err) {
      setError(err.message || "Unable to reach the chatbot service.");
    } finally {
      setIsLoading(false);
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
          text: `Booking created for ${data.appointment?.pet?.name || "your pet"} on ${data.appointment?.scheduled_at || workflowState.form.scheduled_at}.`,
          suggestions: ["Look up appointments", "Show dashboard summary"],
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

  const containerClass = `rbac-chatbot ${mode} ${isOpen ? "open" : ""}`;

  return (
    <div className={containerClass}>
      {mode === "widget" && !isOpen && (
        <button
          type="button"
          className="rbac-chatbot-toggle"
          onClick={() => setIsOpen(true)}
        >
          <span className="rbac-chatbot-toggle-icon">AI</span>
          <span className="rbac-chatbot-toggle-text">Assistant</span>
        </button>
      )}

      {isOpen && (
        <section className="rbac-chatbot-panel">
          <header className="rbac-chatbot-header">
            <div>
              <h3>{title}</h3>
              <p>{subtitle}</p>
            </div>
            {mode === "widget" && (
              <button
                type="button"
                className="rbac-chatbot-close"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            )}
          </header>

          <div className="rbac-chatbot-body">
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
                {isLoading && <div className="rbac-chatbot-state">Assistant is thinking...</div>}
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
              placeholder="Ask about bookings, services, logs, or dashboard help..."
              disabled={isLoading || isBootstrapping}
            />
            <button type="submit" disabled={!input.trim() || isLoading || isBootstrapping}>
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
                        {service.name} (${Number(service.price || 0).toFixed(2)})
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
                  {workflowState.loading ? "Saving..." : "Create Booking"}
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
                    ) : (
                      <>
                        <strong>{item.name}</strong>
                        <span>SKU: {item.sku}</span>
                        <span>Stock: {item.stock}</span>
                        <span>Price: ${Number(item.price || 0).toFixed(2)}</span>
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
