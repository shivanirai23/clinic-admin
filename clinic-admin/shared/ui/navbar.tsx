"use client";

import { signOut } from "aws-amplify/auth";
import { Building2, LogOut } from "lucide-react";

export function Navbar() {
  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      // /login lives in auth-zone — hard navigation required
      window.location.replace("/login");
    }
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-brand-blue" />
          <span className="text-lg font-semibold text-slate-800">Clinic Admin</span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-800"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </header>
  );
}
