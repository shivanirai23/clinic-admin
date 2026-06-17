"use client";

import { AuthGuard } from "@/lib/auth/AuthGuard";
import { Sidebar } from "@/shared/layout/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-white">
        <Sidebar />
        <div className="pl-72">{children}</div>
      </div>
    </AuthGuard>
  );
}
