"use client";

import { useCallback, useEffect, useState } from "react";
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
        throw new Error(data.error ?? "Failed to load clinicians");
      }

      setUsers(data.users ?? []);
    } catch (err) {
      setUsers([]);
      setError(err instanceof Error ? err.message : "Failed to load clinicians");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { users, loading, error, reload: load };
}
