"use client";

import { useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { pendingWrites as initialWrites } from "@/lib/mock-data";
import type { PendingWrite } from "@/lib/types";
import { Button } from "@/shared/ui/button";
import { PhmsBadge } from "@/shared/ui/badge";
import { PageHeader } from "@/shared/ui/page-header";
import { Toast } from "@/shared/ui/toast";

export function WriteRetryQueuePage() {
  const [writes, setWrites] = useState<PendingWrite[]>(initialWrites);
  const [toast, setToast] = useState<string | null>(null);
  const [retryingAll, setRetryingAll] = useState(false);

  const handleRetry = async (id: string) => {
    const target = writes.find((w) => w.id === id);
    if (!target) return;

    setWrites((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: "retrying" } : w)),
    );

    await new Promise((r) => setTimeout(r, 1800));

    setWrites((prev) => prev.filter((w) => w.id !== id));
    setToast(
      `${target.petName}'s visit was successfully sent to ${target.phms === "CORNERSTONE" ? "Cornerstone" : "Neo"}`,
    );
  };

  const handleRetryAll = async () => {
    const pending = writes.filter((w) => w.status !== "retrying");
    if (pending.length === 0) return;

    setRetryingAll(true);
    setWrites((prev) =>
      prev.map((w) => (w.status !== "retrying" ? { ...w, status: "retrying" } : w)),
    );

    await new Promise((r) => setTimeout(r, 2000));

    setWrites([]);
    setRetryingAll(false);
    setToast("All pending visits were sent successfully");
  };

  const handleResolve = (id: string) => {
    const target = writes.find((w) => w.id === id);
    if (!target) return;

    setWrites((prev) => prev.filter((w) => w.id !== id));
    setToast(`Visit for ${target.petName} marked as resolved`);
  };

  const hasPending = writes.some((w) => w.status !== "retrying");

  return (
    <>
      <PageHeader
        title="Pending Syncs"
        action={
          <Button
            size="sm"
            onClick={handleRetryAll}
            disabled={!hasPending || retryingAll}
            className="gap-1.5"
          >
            {retryingAll ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5" />
            )}
            Retry All
          </Button>
        }
      />
      <main className="px-8 py-6">
        <p className="mb-5 text-sm text-text-muted">
          Visits that couldn't be sent to your practice software — retry or mark as resolved
        </p>

        <div className="space-y-3">
          {writes.length === 0 ? (
            <div className="rounded-xl border border-border bg-white px-6 py-10 text-center text-sm text-text-muted">
              No pending syncs. All visits have been sent to your practice software.
            </div>
          ) : (
            writes.map((write) => (
              <div
                key={write.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-text-primary">{write.petName}</p>
                  <div className="mt-1.5">
                    <PhmsBadge label={write.phms} />
                  </div>
                </div>
                <div className="flex gap-2">
                  {write.status === "retrying" ? (
                    <Button variant="outline" size="sm" disabled className="gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Retrying...
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => handleRetry(write.id)}>
                      Retry
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResolve(write.id)}
                    disabled={write.status === "retrying"}
                  >
                    Mark resolved
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}
