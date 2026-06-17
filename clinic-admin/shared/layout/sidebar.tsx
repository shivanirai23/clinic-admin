"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { navItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-72 flex-col border-r border-border-light bg-white">
      <div className="border-b border-border-light px-5 py-4">
        <p className="font-display text-base font-bold text-text-primary">PetCarePilot</p>
        <p className="text-xs text-text-muted">Clinic Admin</p>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-brand-blue text-white"
                  : "text-text-secondary hover:bg-border-light",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border-light p-3">
        <div className="flex items-center gap-2.5 rounded-lg border border-border-light bg-page px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue/10 text-xs font-bold text-brand-blue">
            SR
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text-primary">Siri Reddy</p>
            <p className="text-xs text-text-muted">Administrator</p>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-text-muted hover:bg-white hover:text-text-primary"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
