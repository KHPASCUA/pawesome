import ProfilePage from "../../components/ProfilePage";

export default function AdminProfile() {
  return (
    <ProfilePage
      title="Admin Profile"
      roleLabel="Administrator"
      allowedRoles={["admin"]}
      bioPlaceholder="Tell us about your administrative experience..."
    />
  );
}
