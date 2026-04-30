import ProfilePage from "../../components/ProfilePage";

export default function VetProfile() {
  return (
    <ProfilePage
      title="Veterinary Profile"
      roleLabel="Veterinarian"
      allowedRoles={["veterinary", "admin"]}
      bioPlaceholder="Tell us about your veterinary experience..."
    />
  );
}
