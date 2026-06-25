import { LayoutDashboard, QrCode } from "lucide-react";

export const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/qr-badges", label: "Clinician Onboarding", icon: QrCode },
] as const;
