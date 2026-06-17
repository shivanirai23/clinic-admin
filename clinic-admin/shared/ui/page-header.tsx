import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
  action?: ReactNode;
}

export function PageHeader({ title, breadcrumbs, action }: PageHeaderProps) {
  return (
    <header className="border-b border-border bg-white px-8 py-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="mb-1 flex items-center gap-2 text-xs text-text-muted">
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.label} className="flex items-center gap-2">
                  {i > 0 && <span>/</span>}
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-brand-blue">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-text-secondary">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
          <h1 className="font-display text-2xl font-bold text-text-primary">{title}</h1>
        </div>
        {action}
      </div>
    </header>
  );
}

export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-display text-lg font-bold text-text-primary">{title}</h2>
      {action}
    </div>
  );
}

export function VisitRow({
  petName,
  veterinarian,
  reason,
}: {
  petName: string;
  veterinarian: string;
  reason: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border px-5 py-4 last:border-b-0">
      <div>
        <p className="text-sm font-semibold text-text-primary">{petName}</p>
        <div className="mt-0.5 flex items-center gap-2 text-sm text-text-secondary">
          <span>{veterinarian}</span>
          <span className="h-1 w-1 rounded-full bg-border" />
          <span className="text-xs text-text-muted">{reason}</span>
        </div>
      </div>
      <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
    </div>
  );
}
