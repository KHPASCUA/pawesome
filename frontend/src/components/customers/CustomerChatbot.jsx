import React from "react";
import RoleAwareChatbot from "../chatbot/RoleAwareChatbot";

export default function CustomerChatbot() {
  return (
    <RoleAwareChatbot
      mode="embedded"
      title="Customer Assistant"
      subtitle="Bookings, services, pets, and support"
    />
  );
}
