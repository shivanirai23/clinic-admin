"use client";

import { Navbar } from "@/shared/ui/navbar";

export function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="mt-2 text-slate-500">
            Welcome to HIKIGAI Clinic Admin. Build clinic management features in this zone.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Clinics", description: "Manage clinic locations and settings" },
            { title: "Staff", description: "Invite and manage clinic staff" },
            { title: "Reports", description: "View operational reports and analytics" },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-slate-800">{card.title}</h2>
              <p className="mt-2 text-sm text-slate-500">{card.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
