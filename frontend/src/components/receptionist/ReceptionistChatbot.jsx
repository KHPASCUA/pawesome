import React, { useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRobot,
  faCalendarCheck,
  faUserFriends,
  faClipboardList,
  faMessage,
  faBolt,
  faCopy,
  faCheck,
  faArrowDown,
  faCircleQuestion,
  faHeadset,
  faPaw,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import RoleAwareChatbot from "../chatbot/RoleAwareChatbot";
import "./ReceptionistChatbot.css";

const ReceptionistChatbot = () => {
  const chatbotRef = useRef(null);
  const [copiedPrompt, setCopiedPrompt] = useState("");

  const supportStats = useMemo(
    () => [
      {
        id: "bookings",
        icon: faCalendarCheck,
        title: "Bookings",
        text: "Approval and scheduling guidance",
      },
      {
        id: "customers",
        icon: faUserFriends,
        title: "Customers",
        text: "Inquiry and profile support",
      },
      {
        id: "workflow",
        icon: faClipboardList,
        title: "Workflow",
        text: "Front desk process guide",
      },
    ],
    []
  );

  const promptCards = useMemo(
    () => [
      {
        id: "approval",
        title: "Approval guidance",
        prompt:
          "Help me review a customer booking request. Check what details I should verify before approving or rejecting it.",
      },
      {
        id: "vet",
        title: "Veterinary assignment",
        prompt:
          "Guide me on what to check before assigning a veterinarian to a veterinary service request.",
      },
      {
        id: "customer",
        title: "Customer concern",
        prompt:
          "Help me respond professionally to a customer asking about their booking status, payment, or schedule.",
      },
      {
        id: "front-desk",
        title: "Front desk workflow",
        prompt:
          "Give me the proper receptionist workflow for handling bookings, approvals, customer records, and service requests.",
      },
    ],
    []
  );

  const handleCopyPrompt = async (prompt, id) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedPrompt(id);

      window.clearTimeout(window.receptionistChatbotCopyTimer);
      window.receptionistChatbotCopyTimer = window.setTimeout(() => {
        setCopiedPrompt("");
      }, 1800);
    } catch (error) {
      console.error("Failed to copy prompt:", error);
    }
  };

  const scrollToAssistant = () => {
    chatbotRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="receptionist-chatbot-page">
      <section className="receptionist-chatbot-hero">
        <div className="chatbot-hero-content">
          <span className="chatbot-kicker">
            <FontAwesomeIcon icon={faRobot} />
            Receptionist AI Assistant
          </span>

          <h1>Front Desk Support Center</h1>

          <p>
            Get help with booking approvals, customer inquiries, service guidance,
            veterinarian assignment, and receptionist workflow decisions.
          </p>

          <div className="chatbot-hero-actions">
            <button type="button" className="chatbot-primary-btn" onClick={scrollToAssistant}>
              <FontAwesomeIcon icon={faMessage} />
              Open Assistant
            </button>

            <button type="button" className="chatbot-secondary-btn" onClick={scrollToAssistant}>
              <FontAwesomeIcon icon={faArrowDown} />
              Go to Chat
            </button>
          </div>
        </div>

        <div className="chatbot-hero-stats">
          {supportStats.map((item) => (
            <div key={item.id} className="chatbot-stat-card">
              <FontAwesomeIcon icon={item.icon} />
              <strong>{item.title}</strong>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="chatbot-workspace-grid">
        <div className="chatbot-guide-panel">
          <div className="panel-header">
            <span className="panel-kicker">
              <FontAwesomeIcon icon={faBolt} />
              Suggested Prompts
            </span>
            <h2>Quick Start</h2>
            <p>
              Copy a ready-made prompt and paste it into the assistant for faster
              receptionist support.
            </p>
          </div>

          <div className="prompt-card-list">
            {promptCards.map((item) => (
              <article className="prompt-card" key={item.id}>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.prompt}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyPrompt(item.prompt, item.id)}
                  className={copiedPrompt === item.id ? "copied" : ""}
                >
                  <FontAwesomeIcon icon={copiedPrompt === item.id ? faCheck : faCopy} />
                  {copiedPrompt === item.id ? "Copied" : "Copy"}
                </button>
              </article>
            ))}
          </div>
        </div>

        <aside className="chatbot-scope-panel">
          <div className="scope-card">
            <span>
              <FontAwesomeIcon icon={faCircleQuestion} />
            </span>
            <div>
              <h3>What it helps with</h3>
              <p>
                Booking review, service process reminders, customer response drafting,
                pet-related concerns, and front desk task guidance.
              </p>
            </div>
          </div>

          <div className="scope-card">
            <span>
              <FontAwesomeIcon icon={faShieldAlt} />
            </span>
            <div>
              <h3>Use with records</h3>
              <p>
                Always verify customer, pet, schedule, payment, and request status in
                the actual dashboard before confirming actions.
              </p>
            </div>
          </div>

          <div className="scope-card">
            <span>
              <FontAwesomeIcon icon={faHeadset} />
            </span>
            <div>
              <h3>Customer support</h3>
              <p>
                Use it to draft professional responses for inquiries, rejected
                requests, reschedules, and booking follow-ups.
              </p>
            </div>
          </div>

          <div className="scope-card">
            <span>
              <FontAwesomeIcon icon={faPaw} />
            </span>
            <div>
              <h3>Pet services</h3>
              <p>
                Ask for guidance on grooming, veterinary, hotel boarding, and general
                service flow handled by the receptionist.
              </p>
            </div>
          </div>
        </aside>
      </section>

      <section className="receptionist-chatbot-shell" ref={chatbotRef}>
        <div className="chatbot-shell-header">
          <div>
            <span className="panel-kicker">
              <FontAwesomeIcon icon={faRobot} />
              Embedded Assistant
            </span>
            <h2>Receptionist Assistant</h2>
            <p>Bookings, customer guidance, and front desk workflow help.</p>
          </div>
        </div>

        <RoleAwareChatbot
          mode="embedded"
          title="Receptionist Assistant"
          subtitle="Bookings, customer guidance, and front desk workflow help"
        />
      </section>
    </div>
  );
};

export default ReceptionistChatbot;