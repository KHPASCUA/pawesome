import React from "react";
import RoleAwareChatbot from "../chatbot/RoleAwareChatbot";

const ReceptionistChatbot = () => (
  <RoleAwareChatbot
    mode="embedded"
    title="Receptionist Assistant"
    subtitle="Bookings, customer guidance, and front desk workflow help"
  />
);

export default ReceptionistChatbot;
