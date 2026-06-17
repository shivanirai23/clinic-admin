import * as React from "react";
import { cn } from "@/lib/utils";
import type { BadgeStatus } from "@/lib/types";

const statusColors: Record<BadgeStatus, { bg: string; text: string }> = {
  ACTIVE: { bg: "#81c92f", text: "#ffffff" },
  DEACTIVATED: { bg: "#ff9800", text: "#ffffff" },
  LOST: { bg: "#e5649f", text: "#ffffff" },
  NO_BADGE: { bg: "#429ee2", text: "#ffffff" },
};

export function StatusBadge({ status }: { status: BadgeStatus }) {
  const label = status === "NO_BADGE" ? "NO BADGE" : status;
  const colors = statusColors[status];

  return (
    <span
      className="inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {label}
    </span>
  );
}

export function PhmsBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-md bg-[#f5f5f5] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
      {label}
    </span>
  );
}
