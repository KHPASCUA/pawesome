import RoleAwareChatbot from "./chatbot/RoleAwareChatbot";

export default function CustomerDashboardChatbot() {
  return (
    <RoleAwareChatbot
      mode="widget"
      title="Customer Assistant"
      subtitle="Requests, payments, pets, and bookings"
      role="customer"
    />
  );
}
