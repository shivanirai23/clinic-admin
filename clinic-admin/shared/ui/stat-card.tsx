import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  iconBg: string;
}

export function StatCard({ label, value, icon, iconBg }: StatCardProps) {
  return (
    <div className="relative flex items-center gap-5 rounded-xl border border-border bg-white p-5 shadow-[0px_10px_30px_-10px_rgba(99,14,212,0.15)]">
      <div
        className={cn(
          "flex h-14 w-14 shrink-0 items-center justify-center rounded-full",
          iconBg,
        )}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium tracking-wide text-text-secondary">{label}</p>
        <p className="font-display text-3xl font-bold leading-tight text-text-primary">
          {value}
        </p>
      </div>
    </div>
  );
}
