"use client";

import { auditLogEntries } from "@/lib/mock-data";
import { PageHeader } from "@/shared/ui/page-header";

export function AuditLogPage() {
  return (
    <>
      <PageHeader title="Audit Log" />
      <main className="px-10 py-10">
        <p className="mb-6 text-text-muted">
          Track administrative actions across the clinic admin portal
        </p>

        <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-page text-sm text-text-muted">
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Action</th>
                <th className="px-6 py-4 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLogEntries.map((entry) => (
                <tr key={entry.id} className="border-b border-border last:border-b-0">
                  <td className="px-6 py-4 text-sm text-text-muted">{entry.timestamp}</td>
                  <td className="px-6 py-4 font-medium text-text-primary">{entry.user}</td>
                  <td className="px-6 py-4 text-text-secondary">{entry.action}</td>
                  <td className="px-6 py-4 text-text-secondary">{entry.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
