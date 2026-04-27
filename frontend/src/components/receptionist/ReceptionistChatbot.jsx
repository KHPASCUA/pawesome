import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRobot,
  faCalendarCheck,
  faUserFriends,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";
import RoleAwareChatbot from "../chatbot/RoleAwareChatbot";
import "./ReceptionistChatbot.css";

const ReceptionistChatbot = () => {
  return (
    <div className="receptionist-chatbot-page">
      <div className="receptionist-chatbot-hero">
        <div>
          <span className="chatbot-kicker">
            <FontAwesomeIcon icon={faRobot} /> Receptionist AI Assistant
          </span>
          <h1>Front Desk Support Center</h1>
          <p>
            Helps the receptionist manage bookings, customer concerns,
            service guidance, and front desk workflow.
          </p>
        </div>

        <div className="chatbot-hero-stats">
          <div>
            <FontAwesomeIcon icon={faCalendarCheck} />
            <strong>Bookings</strong>
            <span>Approval help</span>
          </div>
          <div>
            <FontAwesomeIcon icon={faUserFriends} />
            <strong>Customers</strong>
            <span>Inquiry support</span>
          </div>
          <div>
            <FontAwesomeIcon icon={faClipboardList} />
            <strong>Workflow</strong>
            <span>Front desk guide</span>
          </div>
        </div>
      </div>

      <div className="receptionist-chatbot-shell">
        <RoleAwareChatbot
          mode="embedded"
          title="Receptionist Assistant"
          subtitle="Bookings, customer guidance, and front desk workflow help"
        />
      </div>
    </div>
  );
};

export default ReceptionistChatbot;
