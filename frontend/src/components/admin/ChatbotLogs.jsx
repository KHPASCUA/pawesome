import React, { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faComments,
  faPlus,
  faRobot,
  faSpinner,
  faTrash,
  faWrench,
  faEdit,
  faUser,
  faCoins,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { apiRequest } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import "./ChatbotLogs.css";

const emptyFaq = {
  question: "",
  answer: "",
  keywords: "",
  scope: "general",
  is_active: true,
  sort_order: 0,
};

const emptyService = {
  name: "",
  price: "",
  description: "",
};

const ChatbotLogs = () => {
  const [activeTab, setActiveTab] = useState("logs");
  const [chatLogs, setChatLogs] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userChats, setUserChats] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [services, setServices] = useState([]);

  const [faqForm, setFaqForm] = useState(emptyFaq);
  const [serviceForm, setServiceForm] = useState(emptyService);

  const [editingFaqId, setEditingFaqId] = useState(null);
  const [editingServiceId, setEditingServiceId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const stats = useMemo(() => {
    const totalChats = chatLogs.reduce(
      (sum, log) => sum + Number(log.total_chats || 0),
      0
    );

    return [
      {
        label: "Total Users",
        value: chatLogs.length,
        icon: faUser,
      },
      {
        label: "Total Chats",
        value: totalChats,
        icon: faComments,
      },
      {
        label: "Active FAQs",
        value: faqs.filter((faq) => faq.is_active).length,
        icon: faBook,
      },
      {
        label: "Services",
        value: services.length,
        icon: faCoins,
      },
    ];
  }, [chatLogs, faqs, services]);

  const showMessage = (setter, message) => {
    setter(message);
    setTimeout(() => setter(""), 3000);
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const [logsData, faqData, serviceData] = await Promise.all([
        apiRequest("/admin/chatbot/logs"),
        apiRequest("/admin/chatbot/faqs"),
        apiRequest("/admin/services"),
      ]);

      setChatLogs(Array.isArray(logsData) ? logsData : []);
      setFaqs(Array.isArray(faqData) ? faqData : []);
      setServices(Array.isArray(serviceData) ? serviceData : []);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load chatbot management data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadUserChats = async (userId) => {
    try {
      setDetailsLoading(true);
      const data = await apiRequest(`/admin/chatbot/logs/user/${userId}`);
      setUserChats(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load chat history.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const openUserChats = (log) => {
    setSelectedUser(log);
    loadUserChats(log.user_id);
  };

  const resetFaqForm = () => {
    setFaqForm(emptyFaq);
    setEditingFaqId(null);
  };

  const resetServiceForm = () => {
    setServiceForm(emptyService);
    setEditingServiceId(null);
  };

  const submitFaq = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...faqForm,
        keywords: faqForm.keywords
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        sort_order: Number(faqForm.sort_order || 0),
      };

      if (editingFaqId) {
        await apiRequest(`/admin/chatbot/faqs/${editingFaqId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/admin/chatbot/faqs", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      resetFaqForm();
      await loadData();
      showMessage(setSuccess, "FAQ saved successfully.");
    } catch (err) {
      setError(err.message || "Failed to save FAQ.");
    } finally {
      setSaving(false);
    }
  };

  const submitService = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...serviceForm,
        price: Number(serviceForm.price || 0),
      };

      if (editingServiceId) {
        await apiRequest(`/admin/services/${editingServiceId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/admin/services", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      resetServiceForm();
      await loadData();
      showMessage(setSuccess, "Service saved successfully.");
    } catch (err) {
      setError(err.message || "Failed to save service.");
    } finally {
      setSaving(false);
    }
  };

  const removeFaq = async (id) => {
    try {
      await apiRequest(`/admin/chatbot/faqs/${id}`, { method: "DELETE" });
      await loadData();
      showMessage(setSuccess, "FAQ deleted.");
    } catch (err) {
      setError(err.message || "Failed to delete FAQ.");
    }
  };

  const removeService = async (id) => {
    try {
      await apiRequest(`/admin/services/${id}`, { method: "DELETE" });
      await loadData();
      showMessage(setSuccess, "Service deleted.");
    } catch (err) {
      setError(err.message || "Failed to delete service.");
    }
  };

  return (
    <div className="chatbot-logs chatbot-admin-console">
      <div className="chatbot-hero">
        <div>
          <span className="eyebrow">Admin AI Console</span>
          <h2>
            <FontAwesomeIcon icon={faRobot} /> Chatbot Control Center
          </h2>
          <p>Monitor conversations, manage FAQs, and update service answers.</p>
        </div>

        <button className="refresh-btn" type="button" onClick={loadData}>
          Refresh Data
        </button>
      </div>

      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="chatbot-stat-grid">
        {stats.map((item) => (
          <div className="chatbot-stat-card" key={item.label}>
            <span className="stat-icon">
              <FontAwesomeIcon icon={item.icon} />
            </span>
            <div>
              <strong>{item.value}</strong>
              <p>{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="chatbot-tabs">
        <button
          className={activeTab === "logs" ? "active" : ""}
          onClick={() => setActiveTab("logs")}
        >
          <FontAwesomeIcon icon={faComments} /> Logs
        </button>

        <button
          className={activeTab === "faqs" ? "active" : ""}
          onClick={() => setActiveTab("faqs")}
        >
          <FontAwesomeIcon icon={faBook} /> FAQs
        </button>

        <button
          className={activeTab === "services" ? "active" : ""}
          onClick={() => setActiveTab("services")}
        >
          <FontAwesomeIcon icon={faWrench} /> Services
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} spin /> Loading chatbot admin tools...
        </div>
      ) : (
        <>
          {activeTab === "logs" && (
            <div className="admin-grid">
              <div className="management-panel">
                <div className="panel-title-row">
                  <h3>Conversation Summary</h3>
                  <span>{chatLogs.length} users</span>
                </div>

                <div className="management-list">
                  {chatLogs.map((log) => (
                    <button
                      type="button"
                      key={log.user_id}
                      className={`management-card clickable ${
                        selectedUser?.user_id === log.user_id ? "selected" : ""
                      }`}
                      onClick={() => openUserChats(log)}
                    >
                      <div className="card-main-row">
                        <strong>{log.user_name || "Unknown User"}</strong>
                        <span className="pill">{log.user_role || "user"}</span>
                      </div>
                      <span>{log.total_chats || 0} chats</span>
                      <span>
                        <FontAwesomeIcon icon={faClock} />{" "}
                        {log.last_chat_date || "No date"}
                      </span>
                    </button>
                  ))}

                  {chatLogs.length === 0 && (
                    <div className="empty-state">No chatbot logs yet.</div>
                  )}
                </div>
              </div>

              <div className="management-panel chat-history-panel">
                <div className="panel-title-row">
                  <h3>
                    {selectedUser
                      ? `Chat History: ${selectedUser.user_name}` 
                      : "Select a user"}
                  </h3>
                </div>

                {detailsLoading ? (
                  <div className="loading-container">
                    <FontAwesomeIcon icon={faSpinner} spin /> Loading conversations...
                  </div>
                ) : (
                  <div className="chat-bubble-list">
                    {userChats.map((chat) => (
                      <div key={chat.id} className="chat-thread">
                        <span className="chat-intent">
                          {chat.intent || "general"} • {chat.created_at}
                        </span>

                        <div className="bubble user-bubble">
                          <strong>User</strong>
                          <p>{chat.user_message}</p>
                        </div>

                        <div className="bubble bot-bubble">
                          <strong>Bot</strong>
                          <p>{chat.bot_response}</p>
                        </div>
                      </div>
                    ))}

                    {selectedUser && userChats.length === 0 && (
                      <div className="empty-state">
                        No conversation history for this user yet.
                      </div>
                    )}

                    {!selectedUser && (
                      <div className="empty-state">
                        Choose a user from the left panel to view chat history.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "faqs" && (
            <div className="admin-grid">
              <div className="management-panel">
                <h3>{editingFaqId ? "Edit FAQ" : "Create FAQ"}</h3>

                <form className="management-form" onSubmit={submitFaq}>
                  <input
                    type="text"
                    placeholder="Question"
                    value={faqForm.question}
                    onChange={(event) =>
                      setFaqForm((prev) => ({
                        ...prev,
                        question: event.target.value,
                      }))
                    }
                    required
                  />

                  <textarea
                    placeholder="Answer"
                    value={faqForm.answer}
                    onChange={(event) =>
                      setFaqForm((prev) => ({
                        ...prev,
                        answer: event.target.value,
                      }))
                    }
                    rows="5"
                    required
                  />

                  <input
                    type="text"
                    placeholder="Keywords separated by commas"
                    value={faqForm.keywords}
                    onChange={(event) =>
                      setFaqForm((prev) => ({
                        ...prev,
                        keywords: event.target.value,
                      }))
                    }
                  />

                  <div className="management-row">
                    <select
                      value={faqForm.scope}
                      onChange={(event) =>
                        setFaqForm((prev) => ({
                          ...prev,
                          scope: event.target.value,
                        }))
                      }
                    >
                      <option value="general">General</option>
                      <option value="admin">Admin</option>
                      <option value="customer">Customer</option>
                      <option value="receptionist">Receptionist</option>
                      <option value="veterinary">Veterinary</option>
                      <option value="cashier">Cashier</option>
                      <option value="inventory">Inventory</option>
                      <option value="manager">Manager</option>
                    </select>

                    <input
                      type="number"
                      placeholder="Sort order"
                      value={faqForm.sort_order}
                      onChange={(event) =>
                        setFaqForm((prev) => ({
                          ...prev,
                          sort_order: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={faqForm.is_active}
                      onChange={(event) =>
                        setFaqForm((prev) => ({
                          ...prev,
                          is_active: event.target.checked,
                        }))
                      }
                    />
                    Active
                  </label>

                  <div className="management-actions">
                    <button type="submit" disabled={saving}>
                      <FontAwesomeIcon icon={faPlus} />{" "}
                      {editingFaqId ? "Update FAQ" : "Add FAQ"}
                    </button>

                    {editingFaqId && (
                      <button type="button" onClick={resetFaqForm}>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="management-panel">
                <div className="panel-title-row">
                  <h3>Editable FAQs</h3>
                  <span>{faqs.length} records</span>
                </div>

                <div className="management-list">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="management-card">
                      <div className="card-main-row">
                        <strong>{faq.question}</strong>
                        <span className={`pill ${faq.is_active ? "active" : ""}`}>
                          {faq.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <span>{faq.answer}</span>
                      <span>Scope: {faq.scope}</span>
                      <span>
                        Keywords: {(faq.keywords || []).join(", ") || "None"}
                      </span>

                      <div className="card-actions">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingFaqId(faq.id);
                            setFaqForm({
                              question: faq.question,
                              answer: faq.answer,
                              keywords: (faq.keywords || []).join(", "),
                              scope: faq.scope || "general",
                              is_active: Boolean(faq.is_active),
                              sort_order: faq.sort_order ?? 0,
                            });
                          }}
                        >
                          <FontAwesomeIcon icon={faEdit} /> Edit
                        </button>

                        <button
                          type="button"
                          className="danger"
                          onClick={() => removeFaq(faq.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}

                  {faqs.length === 0 && (
                    <div className="empty-state">No FAQs configured yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "services" && (
            <div className="admin-grid">
              <div className="management-panel">
                <h3>{editingServiceId ? "Edit Service" : "Create Service"}</h3>

                <form className="management-form" onSubmit={submitService}>
                  <input
                    type="text"
                    placeholder="Service name"
                    value={serviceForm.name}
                    onChange={(event) =>
                      setServiceForm((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    required
                  />

                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={serviceForm.price}
                    onChange={(event) =>
                      setServiceForm((prev) => ({
                        ...prev,
                        price: event.target.value,
                      }))
                    }
                    required
                  />

                  <textarea
                    placeholder="Description"
                    value={serviceForm.description}
                    onChange={(event) =>
                      setServiceForm((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                    rows="4"
                  />

                  <div className="management-actions">
                    <button type="submit" disabled={saving}>
                      <FontAwesomeIcon icon={faPlus} />{" "}
                      {editingServiceId ? "Update Service" : "Add Service"}
                    </button>

                    {editingServiceId && (
                      <button type="button" onClick={resetServiceForm}>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="management-panel">
                <div className="panel-title-row">
                  <h3>Live Service Answers</h3>
                  <span>{services.length} records</span>
                </div>

                <div className="management-list">
                  {services.map((service) => (
                    <div key={service.id} className="management-card">
                      <div className="card-main-row">
                        <strong>{service.name}</strong>
                        <span className="pill active">
                          {formatCurrency(service.price)}
                        </span>
                      </div>

                      <span>{service.description || "No description"}</span>

                      <div className="card-actions">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingServiceId(service.id);
                            setServiceForm({
                              name: service.name,
                              price: service.price,
                              description: service.description || "",
                            });
                          }}
                        >
                          <FontAwesomeIcon icon={faEdit} /> Edit
                        </button>

                        <button
                          type="button"
                          className="danger"
                          onClick={() => removeService(service.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}

                  {services.length === 0 && (
                    <div className="empty-state">No services configured yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChatbotLogs;
