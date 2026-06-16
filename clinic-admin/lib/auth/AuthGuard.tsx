"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "aws-amplify/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(() => setChecking(false))
      // /login lives in the auth-zone app — needs a full-page navigation
      .catch(() => window.location.replace("/login"));
  }, []);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
