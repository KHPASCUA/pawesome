import ProfilePage from "../../components/ProfilePage";

export default function CashierProfile() {
  return (
    <ProfilePage
      title="Cashier Profile"
      roleLabel="Cashier"
      allowedRoles={["cashier", "admin"]}
      bioPlaceholder="Tell us about your cashiering experience..."
    />
  );
}
