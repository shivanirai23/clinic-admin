"use client";

import Link from "next/link";
import { dashboardMetrics, pendingWrites, todayVisits } from "@/lib/mock-data";
import { Button } from "@/shared/ui/button";
import { MetricCard } from "@/shared/ui/metric-card";
import { PageHeader, SectionHeader, VisitRow } from "@/shared/ui/page-header";
import { PhmsBadge } from "@/shared/ui/badge";

export function DashboardPage() {
  const previewVisits = todayVisits.slice(0, 4);

  return (
    <>
      <PageHeader title="Dashboard" />
      <main className="space-y-8 px-8 py-6">
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard compact label="Visits today" value={dashboardMetrics.visitsToday} />
          <MetricCard
            compact
            label="Success rate"
            value={`${dashboardMetrics.successRate}%`}
            subtitle="Visits completed successfully"
          />
          <MetricCard
            compact
            label="Pending writes"
            value={dashboardMetrics.pendingWrites}
            subtitle="Failed PHMS write-backs"
          />
          <Link href="/qr-badges" className="block transition-opacity hover:opacity-95">
            <MetricCard
              compact
              label="QR alerts"
              value={dashboardMetrics.qrAlerts}
              subtitle="Badge reported lost"
            />
          </Link>
        </section>

        <section className="grid grid-cols-1 gap-10 xl:grid-cols-2">
          <div className="space-y-4">
            <SectionHeader
              title="Today's visits"
              action={
                <Link href="/visits">
                  <Button variant="outline" size="sm">
                    View all
                  </Button>
                </Link>
              }
            />
            <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
              {previewVisits.map((visit) => (
                <VisitRow
                  key={visit.id}
                  petName={visit.petName}
                  veterinarian={visit.veterinarian}
                  reason={visit.reason}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <SectionHeader
              title="Pending write retry"
              action={
                <Link href="/write-retry-queue">
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </Link>
              }
            />
            <div className="space-y-3">
              {pendingWrites.map((write) => (
                <div
                  key={write.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-white px-5 py-4 shadow-sm"
                >
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{write.petName}</p>
                    <div className="mt-1.5">
                      <PhmsBadge label={write.phms} />
                    </div>
                  </div>
                  <Link href="/write-retry-queue">
                    <Button variant="outline" size="sm">
                      Retry Now
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
