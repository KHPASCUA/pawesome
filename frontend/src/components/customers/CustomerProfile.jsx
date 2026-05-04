import ProfilePage from "../../components/ProfilePage";

export default function CustomerProfile() {
  return (
    <ProfilePage
      title="Customer Profile"
      roleLabel="Customer"
      allowedRoles={["customer"]}
      bioPlaceholder="Tell us about yourself and your pets..."
    />
  );
}