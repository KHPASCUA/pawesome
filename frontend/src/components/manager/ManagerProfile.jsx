import ProfilePage from "../../components/ProfilePage";

export default function ManagerProfile() {
  return (
    <ProfilePage
      title="Manager Profile"
      roleLabel="Manager"
      allowedRoles={["manager"]}
      bioPlaceholder="Tell us about your management experience..."
    />
  );
}
