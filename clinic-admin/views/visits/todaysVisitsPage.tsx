"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Filter, Loader2, Search } from "lucide-react";
import { useAppointments } from "@/lib/hooks/use-appointments";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { PageHeader } from "@/shared/ui/page-header";

const PAGE_SIZE = 5;

export function TodaysVisitsPage() {
  const { visits, loading, error } = useAppointments();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return visits;
    return visits.filter(
      (v) =>
        v.petName.toLowerCase().includes(q) ||
        v.ownerName.toLowerCase().includes(q),
    );
  }, [search, visits]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <PageHeader
        title="Today's Visits"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Today's Visits" },
        ]}
      />
      <main className="px-8 py-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              className="pl-10"
              placeholder="Search pet or owner name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-3.5 w-3.5" />
            Filters
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center gap-2 px-5 py-16 text-sm text-text-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading appointments from IDEXX...
            </div>
          ) : error ? (
            <div className="px-5 py-16 text-center text-sm text-danger">{error}</div>
          ) : (
            <>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-page text-xs font-semibold text-text-muted">
                    <th className="px-5 py-3 font-medium">Pet & Owner</th>
                    <th className="px-5 py-3 font-medium">Species / Breed</th>
                    <th className="px-5 py-3 font-medium">Veterinarian</th>
                    <th className="px-5 py-3 font-medium">Reason</th>
                    <th className="px-5 py-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-text-muted">
                        No visits found for today.
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((visit) => (
                      <tr key={visit.id} className="border-b border-border last:border-b-0">
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-text-primary">{visit.petName}</p>
                          <p className="text-xs text-text-muted">Owner: {visit.ownerName}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-text-secondary">
                          <p>{visit.species}</p>
                          <p className="text-xs text-text-muted">{visit.breed}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-text-secondary">
                          {visit.veterinarian}
                        </td>
                        <td className="px-5 py-4 text-sm text-text-secondary">{visit.reason}</td>
                        <td className="px-5 py-4 text-sm font-semibold text-text-primary">
                          {visit.time}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className="flex items-center justify-between border-t border-border px-6 py-4 text-sm text-text-muted">
                <p>
                  Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to{" "}
                  {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} visits
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="rounded-lg border border-border p-2 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n)}
                      className={`h-9 w-9 rounded-lg text-sm ${
                        n === page
                          ? "bg-brand-blue text-white"
                          : "border border-border text-text-secondary"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg border border-border p-2 disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
