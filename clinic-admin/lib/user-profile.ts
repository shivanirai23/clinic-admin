export interface UserProfile {
  title: string;
  firstName: string;
  lastName: string;
  gender: string;
  contact: string;
  email: string;
  birthDate: string;
  role: string;
  city: string;
}

export const defaultUserProfile: UserProfile = {
  title: "Ms.",
  firstName: "Siri",
  lastName: "Reddy",
  gender: "Female",
  contact: "+91 9876543210",
  email: "siri.reddy@clinic.com",
  birthDate: "1990-05-15",
  role: "Administrator",
  city: "Hyderabad",
};

export function getUserDisplayName(profile: UserProfile) {
  return `${profile.firstName} ${profile.lastName}`;
}

export function getUserInitials(profile: UserProfile) {
  return `${profile.firstName[0] ?? ""}${profile.lastName[0] ?? ""}`.toUpperCase();
}
