"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronUp } from "lucide-react";
import { navItems } from "@/lib/navigation";
import { logout } from "@/lib/auth/session";
import {
  defaultUserProfile,
  getUserDisplayName,
  getUserInitials,
} from "@/lib/user-profile";
import { DropdownMenu } from "@/shared/ui/modal";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<DOMRect | null>(null);

  const displayName = getUserDisplayName(defaultUserProfile);
  const initials = getUserInitials(defaultUserProfile);
  const role = defaultUserProfile.role;

  const closeUserMenu = () => {
    setUserMenuOpen(false);
    setUserMenuAnchor(null);
  };

  const toggleUserMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (userMenuOpen) {
      closeUserMenu();
    } else {
      setUserMenuOpen(true);
      setUserMenuAnchor(e.currentTarget.getBoundingClientRect());
    }
  };

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
        <button
          type="button"
          onClick={toggleUserMenu}
          data-menu-trigger
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg border border-border-light bg-page px-3 py-2.5 text-left transition-colors hover:border-brand-blue/40 hover:bg-white",
            userMenuOpen && "border-brand-blue/40 bg-white",
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-xs font-bold text-brand-blue">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text-primary">{displayName}</p>
            <p className="text-xs text-text-muted">{role}</p>
          </div>
          <ChevronUp
            className={cn(
              "h-4 w-4 shrink-0 text-text-muted transition-transform",
              userMenuOpen && "rotate-180",
            )}
          />
        </button>

        <DropdownMenu
          open={userMenuOpen}
          onClose={closeUserMenu}
          anchorRect={userMenuAnchor}
          placement="top"
          matchWidth
          items={[
            {
              label: "Profile",
              onClick: () => router.push("/profile"),
            },
            {
              label: "Logout",
              onClick: logout,
              destructive: true,
            },
          ]}
        />
      </div>
    </aside>
  );
}
