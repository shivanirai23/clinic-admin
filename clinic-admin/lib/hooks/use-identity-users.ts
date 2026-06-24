"use client";

import { useCallback, useEffect, useState } from "react";
import { formatUserFacingError, sanitizeApiErrorMessage } from "@/lib/user-facing-errors";
import type { IdentityUserWithBadge } from "@/lib/hikigai/identity";

interface IdentityUsersResponse {
  users: IdentityUserWithBadge[];
  error?: string;
}

export function useIdentityUsers() {
  const [users, setUsers] = useState<IdentityUserWithBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/identity/users");
      const data = (await response.json()) as IdentityUsersResponse;

      if (!response.ok) {
        throw new Error(
          sanitizeApiErrorMessage(
            data.error ?? "",
            "clinicians",
            "We couldn't load clinicians. Please try again.",
          ),
        );
      }

      setUsers(data.users ?? []);
    } catch (err) {
      setUsers([]);
      setError(formatUserFacingError(err, "clinicians"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { users, loading, error, reload: load };
}
