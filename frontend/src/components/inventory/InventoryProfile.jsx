import ProfilePage from "../../components/ProfilePage";

export default function InventoryProfile() {
  return (
    <ProfilePage
      title="Inventory Profile"
      roleLabel="Inventory Manager"
      allowedRoles={["inventory", "admin"]}
      bioPlaceholder="Tell us about your inventory management experience..."
    />
  );
}
