import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  compact?: boolean;
}

export function MetricCard({ label, value, subtitle, compact }: MetricCardProps) {
  return (
    <div className={cn("rounded-2xl bg-white shadow-sm", compact ? "px-5 py-5" : "px-6 py-6")}>
      <p className="text-sm text-text-muted">{label}</p>
      <p
        className={cn(
          "mt-1 font-display font-bold leading-none text-text-primary",
          compact ? "text-3xl" : "text-4xl",
        )}
      >
        {value}
      </p>
      {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
    </div>
  );
}
