"use client";

import { useCallback, useEffect, useState } from "react";
import { formatUserFacingError, sanitizeApiErrorMessage } from "@/lib/user-facing-errors";
import type { Visit } from "@/lib/types";

interface AppointmentsResponse {
  visits: Visit[];
  source?: string;
  error?: string;
}

export function useAppointments(date?: string) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = date ? `?date=${encodeURIComponent(date)}` : "";
      const response = await fetch(`/api/appointments${params}`);
      const data = (await response.json()) as AppointmentsResponse;

      if (!response.ok) {
        throw new Error(
          sanitizeApiErrorMessage(
            data.error ?? "",
            "appointments",
            "We couldn't load today's appointments. Please try again.",
          ),
        );
      }

      setVisits(data.visits ?? []);
    } catch (err) {
      setVisits([]);
      setError(formatUserFacingError(err, "appointments"));
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    void load();
  }, [load]);

  return { visits, loading, error, reload: load };
}
