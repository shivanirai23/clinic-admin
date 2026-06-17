import {
  Clock,
  Code2,
  LayoutDashboard,
  Mic,
  QrCode,
  RotateCcw,
} from "lucide-react";

export const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/qr-badges", label: "QR & Badges", icon: QrCode },
  { href: "/phms-connector", label: "PHMS Connector", icon: Code2 },
  { href: "/wake-phrase", label: "Wake Phrase", icon: Mic },
  { href: "/write-retry-queue", label: "Write Retry Queue", icon: RotateCcw },
  { href: "/audit-log", label: "Audit Log", icon: Clock },
] as const;
