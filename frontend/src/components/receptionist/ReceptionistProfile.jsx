import ProfilePage from "../../components/ProfilePage";

export default function ReceptionistProfile() {
  return (
    <ProfilePage
      title="Receptionist Profile"
      roleLabel="Receptionist"
      allowedRoles={["receptionist", "admin"]}
      bioPlaceholder="Tell us about your receptionist experience..."
    />
  );
}
