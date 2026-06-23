"use client";

import { useMemo, useState } from "react";
import { useIdentityUsers } from "@/lib/hooks/use-identity-users";
import {
  BadgeCheck,
  BadgePlus,
  Check,
  ChevronRight,
  FileDown,
  Filter,
  Info,
  KeyRound,
  Loader2,
  MoreVertical,
  Printer,
  QrCode,
  Search,
  ShieldOff,
  X,
} from "lucide-react";
import { downloadBadgePdfFromQrPng, printBadgeFromQrPng } from "@/lib/badge-export";
import type { IdentityUserWithBadge, IssueQrBadgeResponse } from "@/lib/hikigai/identity";
import type { Badge, ClinicianCandidate } from "@/lib/types";
import { Button } from "@/shared/ui/button";
import { StatusBadge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { DropdownMenu, Modal } from "@/shared/ui/modal";
import { PageHeader } from "@/shared/ui/page-header";
import { StatCard } from "@/shared/ui/stat-card";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  const parts = name.replace(/^Dr\.\s*/i, "").split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

const avatarColors = [
  "bg-[#429ee2]/15 text-brand-blue",
  "bg-[rgba(128,202,47,0.2)] text-[#81c92f]",
  "bg-[rgba(255,152,0,0.2)] text-[#ff9800]",
  "bg-[#fce7f3] text-danger",
];

function avatarColorFor(id: string) {
  const index = id.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return avatarColors[index % avatarColors.length];
}

function identityUserToCandidate(user: IdentityUserWithBadge): ClinicianCandidate {
  return {
    id: user.id,
    name: user.displayName,
    role: user.role,
    email: user.email,
  };
}

function badgeToCandidate(badge: Badge): ClinicianCandidate {
  return {
    id: badge.id,
    name: badge.clinicianName,
    role: badge.role,
    email: badge.email,
  };
}

function userToBadge(user: IdentityUserWithBadge): Badge {
  return {
    id: user.id,
    clinicianName: user.displayName,
    email: user.email,
    role: user.role,
    status: user.badgeStatus,
    lastIssued: user.lastIssued,
    qrCredentialId: user.qrCredentialId,
  };
}

async function requestQrBadge(email: string): Promise<IssueQrBadgeResponse> {
  const response = await fetch("/api/identity/qr-badge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = (await response.json()) as IssueQrBadgeResponse & { error?: string };
  if (!response.ok) {
    throw new Error(data.error ?? "Failed to issue QR badge");
  }

  return data;
}

function getMenuItems(
  badge: Badge,
  handlers: {
    onIssueNew: () => void;
    onPrint: () => void;
    onExportPdf: () => void;
    onDeactivate: () => void;
  },
) {
  if (badge.status === "ACTIVE") {
    return [
      { label: "Print badge", onClick: handlers.onPrint },
      { label: "Export PDF", onClick: handlers.onExportPdf },
      { label: "Deactivate", onClick: handlers.onDeactivate, destructive: true },
    ];
  }
  return [{ label: "Issue new badge", onClick: handlers.onIssueNew }];
}

export function QrBadgesPage() {
  const { users, loading: usersLoading, error: usersError, reload: reloadUsers } =
    useIdentityUsers();
  const [search, setSearch] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<DOMRect | null>(null);
  const [issueStep, setIssueStep] = useState<1 | 2 | 3 | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<ClinicianCandidate | null>(null);
  const [issueSearch, setIssueSearch] = useState("");
  const [issuedBadgeName, setIssuedBadgeName] = useState("");
  const [issuedBadgeId, setIssuedBadgeId] = useState("");
  const [issuedQrPngBase64, setIssuedQrPngBase64] = useState<string | null>(null);
  const [issuing, setIssuing] = useState(false);
  const [issueError, setIssueError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const badges = useMemo(() => users.map(userToBadge), [users]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return badges;
    return badges.filter(
      (b) =>
        b.clinicianName.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q),
    );
  }, [badges, search]);

  const openMenuBadge = useMemo(
    () => badges.find((b) => b.id === menuOpenId) ?? null,
    [badges, menuOpenId],
  );

  const closeMenu = () => {
    setMenuOpenId(null);
    setMenuAnchor(null);
  };

  const stats = useMemo(
    () => ({
      active: badges.filter((b) => b.status === "ACTIVE").length,
      lostDeactivated: badges.filter(
        (b) => b.status === "LOST" || b.status === "DEACTIVATED",
      ).length,
      pinResets: 12,
    }),
    [badges],
  );

  const eligibleClinicians = useMemo(() => {
    const activeEmails = new Set(
      badges.filter((b) => b.status === "ACTIVE").map((b) => b.email.toLowerCase()),
    );
    return users
      .filter((user) => !activeEmails.has(user.email.toLowerCase()))
      .map(identityUserToCandidate);
  }, [users, badges]);

  const filteredEligible = useMemo(() => {
    const q = issueSearch.trim().toLowerCase();
    if (!q) return eligibleClinicians;
    return eligibleClinicians.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q),
    );
  }, [eligibleClinicians, issueSearch]);

  const openIssueFlow = (candidate?: ClinicianCandidate) => {
    setIssueSearch("");
    setIssueError(null);
    setIssuedQrPngBase64(null);
    if (candidate) {
      setSelectedCandidate(candidate);
      setIssueStep(2);
    } else {
      setSelectedCandidate(null);
      setIssueStep(1);
    }
  };

  const closeIssueFlow = () => {
    setIssueStep(null);
    setSelectedCandidate(null);
    setIssueSearch("");
    setIssueError(null);
    setIssuedQrPngBase64(null);
    setIssuing(false);
  };

  const completeIssue = async (candidate: ClinicianCandidate) => {
    setIssuing(true);
    setIssueError(null);

    try {
      const qrBadge = await requestQrBadge(candidate.email);

      setIssuedBadgeName(candidate.name);
      setIssuedBadgeId(candidate.id);
      setIssuedQrPngBase64(qrBadge.qr_code_png_base64);
      setIssueStep(3);
      await reloadUsers();
    } catch (error) {
      setIssueError(
        error instanceof Error ? error.message : "Failed to issue QR badge",
      );
    } finally {
      setIssuing(false);
    }
  };

  const handleIssueBadge = (target?: Badge) => {
    if (target) {
      openIssueFlow(badgeToCandidate(target));
      return;
    }
    openIssueFlow();
  };

  const resolveQrPng = async (email: string, cached?: string | null) => {
    if (cached) return cached;
    const badge = await requestQrBadge(email);
    return badge.qr_code_png_base64;
  };

  const handlePrintBadge = async (name: string, email: string, cached?: string | null) => {
    const pngBase64 = await resolveQrPng(email, cached);
    await printBadgeFromQrPng(pngBase64);
  };

  const handleExportPdf = async (name: string, email: string, cached?: string | null) => {
    setExporting(true);
    try {
      const pngBase64 = await resolveQrPng(email, cached);
      await downloadBadgePdfFromQrPng(pngBase64, name);
    } finally {
      setExporting(false);
    }
  };

  const handleDeactivate = async (badge: Badge) => {
    if (!badge.qrCredentialId) {
      setActionError("No active QR credential to revoke for this clinician.");
      return;
    }

    setDeactivatingId(badge.id);
    setActionError(null);
    closeMenu();

    try {
      const response = await fetch("/api/identity/credentials", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: badge.id,
          credentialId: badge.qrCredentialId,
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to deactivate badge");
      }

      await reloadUsers();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to deactivate badge",
      );
    } finally {
      setDeactivatingId(null);
    }
  };

  return (
    <>
      <PageHeader title="QR & Badges" />
      <main className="space-y-6 px-8 py-6">
        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <StatCard
            label="Active Badges"
            value={stats.active}
            icon={<BadgeCheck className="h-6 w-6 text-[#81c92f]" />}
            iconBg="bg-[rgba(128,202,47,0.2)]"
          />
          <StatCard
            label="Deactivated"
            value={String(stats.lostDeactivated).padStart(2, "0")}
            icon={<ShieldOff className="h-6 w-6 text-[#ff9800]" />}
            iconBg="bg-[rgba(255,152,0,0.2)]"
          />
          <StatCard
            label="PIN Resets (24h)"
            value={stats.pinResets}
            icon={<KeyRound className="h-6 w-6 text-[#429ee2]" />}
            iconBg="bg-[rgba(41,171,226,0.2)]"
          />
        </section>

        <section className="rounded-xl border border-border bg-white shadow-[0px_1px_8px_0px_rgba(66,158,226,0.5)]">
          <div className="flex flex-col gap-4 border-b border-border px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-text-primary">
                Clinicians
              </h2>
              <p className="text-sm text-text-secondary">
                Doctors from your Hikigai Identity pool — issue and manage QR badges
              </p>
            </div>
            <Button size="lg" onClick={() => openIssueFlow()} className="gap-2">
              <BadgePlus className="h-4 w-4" />
              Issue Badge
            </Button>
          </div>

          <div className="flex flex-col gap-3 border-b border-border px-6 py-3 sm:flex-row sm:items-center">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input
                className="pl-10"
                placeholder="Search by name or badge ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="ghost" size="sm" className="gap-2 text-text-secondary">
              <Filter className="h-3.5 w-3.5" />
              Filter
            </Button>
          </div>

          {usersError && (
            <div className="mx-6 mb-4 flex flex-col gap-3 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-danger">{usersError}</p>
              <Button variant="ghost" size="sm" onClick={() => void reloadUsers()}>
                Retry
              </Button>
            </div>
          )}

          {actionError && (
            <div className="mx-6 mb-4 flex flex-col gap-3 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-danger">{actionError}</p>
              <Button variant="ghost" size="sm" onClick={() => setActionError(null)}>
                Dismiss
              </Button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs font-semibold tracking-wide text-text-secondary">
                  <th className="px-6 py-4">Clinician Name</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Last Issued</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                      <p className="mt-2 text-sm">Loading clinicians from Identity…</p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-text-muted">
                      {users.length === 0
                        ? "No clinicians found in your Identity pool."
                        : "No clinicians match your search."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((badge) => (
                    <tr key={badge.id} className="border-b border-border last:border-b-0">
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-text-primary">
                          {badge.clinicianName}
                        </p>
                        <p className="text-xs text-text-secondary">{badge.email}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-primary">{badge.role}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={badge.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {badge.lastIssued ?? "—"}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          disabled={deactivatingId === badge.id}
                          onClick={(e) => {
                            if (menuOpenId === badge.id) {
                              closeMenu();
                            } else {
                              setMenuOpenId(badge.id);
                              setMenuAnchor(e.currentTarget.getBoundingClientRect());
                            }
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-page disabled:opacity-50"
                          data-menu-trigger
                        >
                          {deactivatingId === badge.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-text-muted" />
                          ) : (
                            <MoreVertical className="h-4 w-4 text-text-muted" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {openMenuBadge && (
          <DropdownMenu
            open={!!menuOpenId}
            onClose={closeMenu}
            anchorRect={menuAnchor}
            items={getMenuItems(openMenuBadge, {
              onIssueNew: () => handleIssueBadge(openMenuBadge),
              onPrint: () =>
                void handlePrintBadge(
                  openMenuBadge.clinicianName,
                  openMenuBadge.email,
                ),
              onExportPdf: () =>
                void handleExportPdf(
                  openMenuBadge.clinicianName,
                  openMenuBadge.email,
                ),
              onDeactivate: () => void handleDeactivate(openMenuBadge),
            })}
          />
        )}
      </main>

      {/* Issue badge flow — steps 1 & 2 */}
      <Modal
        open={issueStep === 1 || issueStep === 2}
        onClose={closeIssueFlow}
        bare
        className="max-w-lg"
      >
        {issueStep === 1 && (
          <>
            <div className="flex items-start justify-between border-b border-border px-6 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgba(41,171,226,0.15)]">
                  <QrCode className="h-5 w-5 text-brand-blue" />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-text-primary">
                    Issue Clinician Badge
                  </h2>
                  <p className="text-xs text-text-muted">Step 1 of 3</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeIssueFlow}
                className="text-text-muted hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-6">
              <h3 className="text-center font-display text-xl font-bold text-text-primary">
                Who needs a badge?
              </h3>
              <p className="mt-2 text-center text-sm text-text-muted">
                Only clinicians without an active security badge are listed here.
              </p>

              <div className="relative mt-5">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <Input
                  className="bg-white pl-10"
                  placeholder="Search by name or role..."
                  value={issueSearch}
                  onChange={(e) => setIssueSearch(e.target.value)}
                />
              </div>

              <div className="mt-4 max-h-72 space-y-3 overflow-y-auto">
                {usersLoading ? (
                  <div className="flex flex-col items-center rounded-lg border border-border px-4 py-8 text-text-muted">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <p className="mt-2 text-sm">Loading clinicians…</p>
                  </div>
                ) : filteredEligible.length === 0 ? (
                  <p className="rounded-lg border border-border px-4 py-6 text-center text-sm text-text-muted">
                    No clinicians without an active badge match your search.
                  </p>
                ) : (
                  filteredEligible.map((clinician) => {
                    const selected = selectedCandidate?.id === clinician.id;
                    return (
                      <button
                        key={clinician.id}
                        type="button"
                        onClick={() => setSelectedCandidate(clinician)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                          selected
                            ? "border-brand-blue bg-[#eff7fd]"
                            : "border-border bg-white hover:border-brand-blue/40",
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                            avatarColorFor(clinician.id),
                          )}
                        >
                          {getInitials(clinician.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-text-primary">
                            {clinician.name}
                          </p>
                          <p className="text-xs text-text-muted">{clinician.role}</p>
                          <p className="truncate text-xs text-text-secondary">{clinician.email}</p>
                        </div>
                        <span
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                            selected ? "border-brand-blue" : "border-border",
                          )}
                        >
                          {selected && (
                            <span className="h-2.5 w-2.5 rounded-full bg-brand-blue" />
                          )}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex justify-end border-t border-border bg-[#f9f9f9] px-6 py-4">
              <Button
                size="sm"
                disabled={!selectedCandidate}
                onClick={() => setIssueStep(2)}
                className="gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        {issueStep === 2 && selectedCandidate && (
          <>
            <div className="flex items-start justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="font-display text-base font-bold text-text-primary">
                  Verify Identity
                </h2>
                <p className="text-xs text-text-muted">Step 2 of 3</p>
              </div>
              <button
                type="button"
                onClick={closeIssueFlow}
                className="text-text-muted hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-8 text-center">
              <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full border-4 border-brand-blue p-1">
                <div
                  className={cn(
                    "flex h-full w-full items-center justify-center rounded-full text-2xl font-bold",
                    avatarColorFor(selectedCandidate.id),
                  )}
                >
                  {getInitials(selectedCandidate.name)}
                </div>
              </div>
              <h3 className="font-display text-lg font-bold text-text-primary">
                {selectedCandidate.name}
              </h3>
              <span className="mt-2 inline-block rounded-full border border-border bg-page px-3 py-1 text-xs text-text-secondary">
                {selectedCandidate.role}
              </span>
              <p className="mt-2 text-sm text-text-muted">{selectedCandidate.email}</p>

              <div className="mt-6 flex gap-3 rounded-xl border border-border bg-page px-4 py-4 text-left">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue" />
                <p className="text-sm leading-relaxed text-text-secondary">
                  Confirming will call the Hikigai Identity API to issue a QR login
                  badge for this clinician. The QR payload is shown once.
                </p>
              </div>

              {issueError && (
                <p className="mt-4 rounded-lg border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">
                  {issueError}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border bg-[#f9f9f9] px-6 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIssueStep(1)}
                disabled={issuing}
              >
                Back
              </Button>
              <Button
                size="sm"
                onClick={() => void completeIssue(selectedCandidate)}
                disabled={issuing}
                className="gap-1"
              >
                {issuing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Issuing...
                  </>
                ) : (
                  <>
                    Confirm &amp; Continue
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* Issue badge success — step 3 */}
      <Modal
        open={issueStep === 3}
        onClose={closeIssueFlow}
        bare
        className="max-w-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <QrCode className="h-5 w-5 text-text-primary" />
            <h2 className="font-display text-base font-bold text-text-primary">
              Issue Clinician Badge
            </h2>
          </div>
          <button
            type="button"
            onClick={closeIssueFlow}
            className="text-text-muted hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#76d231]">
            <Check className="h-8 w-8 text-white" strokeWidth={3} />
          </div>
          <h3 className="font-display text-xl font-bold text-text-primary">
            Badge Generated Successfully!
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
            The secure badge for <strong>{issuedBadgeName}</strong> is ready for
            distribution.
          </p>

          {issuedQrPngBase64 && (
            <div className="mx-auto mt-6 flex h-40 w-40 items-center justify-center rounded-xl border border-border bg-white p-3">
              <img
                src={`data:image/png;base64,${issuedQrPngBase64}`}
                alt={`QR badge for ${issuedBadgeName}`}
                className="h-full w-full object-contain"
              />
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                const email =
                  badges.find((b) => b.id === issuedBadgeId)?.email ??
                  selectedCandidate?.email;
                if (!email) return;
                closeIssueFlow();
                void handlePrintBadge(issuedBadgeName, email, issuedQrPngBase64);
              }}
              className="flex flex-col items-center rounded-xl border border-border bg-white px-6 py-6 text-left transition-colors hover:border-brand-blue/40 hover:bg-page"
            >
              <Printer className="mb-3 h-8 w-8 text-text-primary" />
              <span className="text-sm font-bold text-text-primary">Print Badge</span>
              <span className="mt-1 text-xs text-text-muted">Send to local card printer</span>
            </button>
            <button
              type="button"
              disabled={exporting}
              onClick={() => {
                const email =
                  badges.find((b) => b.id === issuedBadgeId)?.email ??
                  selectedCandidate?.email;
                if (!email) return;
                closeIssueFlow();
                void handleExportPdf(issuedBadgeName, email, issuedQrPngBase64);
              }}
              className="flex flex-col items-center rounded-xl border border-border bg-white px-6 py-6 text-left transition-colors hover:border-brand-blue/40 hover:bg-page disabled:opacity-50"
            >
              <FileDown className="mb-3 h-8 w-8 text-text-primary" />
              <span className="text-sm font-bold text-text-primary">
                {exporting ? "Downloading..." : "Export as PDF"}
              </span>
              <span className="mt-1 text-xs text-text-muted">Download for digital storage</span>
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
