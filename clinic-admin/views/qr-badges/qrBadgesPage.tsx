"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  BadgePlus,
  Check,
  ChevronRight,
  Copy,
  FileDown,
  Filter,
  Info,
  KeyRound,
  MoreVertical,
  Printer,
  QrCode,
  RefreshCw,
  Search,
  ShieldOff,
  X,
} from "lucide-react";
import { badgeRegistry, clinicianCandidates } from "@/lib/mock-data";
import { downloadBadgePdf, printBadge } from "@/lib/badge-export";
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

function badgeToCandidate(badge: Badge): ClinicianCandidate {
  return {
    id: badge.id,
    name: badge.clinicianName,
    role: badge.role,
    email: badge.email,
  };
}

function generatePin() {
  const pin = String(Math.floor(100000 + Math.random() * 900000));
  return `${pin.slice(0, 3)} ${pin.slice(3)}`;
}

function getMenuItems(
  badge: Badge,
  handlers: {
    onIssueNew: () => void;
    onRegeneratePin: () => void;
    onPrint: () => void;
    onExportPdf: () => void;
    onDeactivate: () => void;
  },
) {
  if (badge.status === "ACTIVE") {
    return [
      { label: "Print badge", onClick: handlers.onPrint },
      { label: "Export PDF", onClick: handlers.onExportPdf },
      { label: "Regenerate PIN", onClick: handlers.onRegeneratePin },
      { label: "Deactivate", onClick: handlers.onDeactivate, destructive: true },
    ];
  }
  return [
    { label: "Issue new badge", onClick: handlers.onIssueNew },
    { label: "Regenerate PIN", onClick: handlers.onRegeneratePin },
  ];
}

export function QrBadgesPage() {
  const [search, setSearch] = useState("");
  const [badges, setBadges] = useState(badgeRegistry);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<DOMRect | null>(null);
  const [regenerateTarget, setRegenerateTarget] = useState<Badge | null>(null);
  const [issueStep, setIssueStep] = useState<1 | 2 | 3 | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<ClinicianCandidate | null>(null);
  const [issueSearch, setIssueSearch] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [issuedBadgeName, setIssuedBadgeName] = useState("");
  const [issuedBadgeId, setIssuedBadgeId] = useState("");
  const [newPin, setNewPin] = useState("");
  const [exporting, setExporting] = useState(false);
  const [pinCopied, setPinCopied] = useState(false);

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
    return clinicianCandidates.filter(
      (c) => !activeEmails.has(c.email.toLowerCase()),
    );
  }, [badges]);

  const filteredEligible = useMemo(() => {
    const q = issueSearch.trim().toLowerCase();
    if (!q) return eligibleClinicians;
    return eligibleClinicians.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q),
    );
  }, [eligibleClinicians, issueSearch]);

  const openIssueFlow = (candidate?: ClinicianCandidate) => {
    setIssueSearch("");
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
  };

  const completeIssue = (candidate: ClinicianCandidate) => {
    const existing = badges.find(
      (b) => b.id === candidate.id || b.email === candidate.email,
    );

    if (existing) {
      setBadges((prev) =>
        prev.map((b) =>
          b.id === existing.id
            ? { ...b, status: "ACTIVE" as const, lastIssued: "Jun 16, 2026" }
            : b,
        ),
      );
      setIssuedBadgeName(existing.clinicianName);
      setIssuedBadgeId(existing.id);
    } else {
      const newBadge: Badge = {
        id: `badge-${Date.now()}`,
        clinicianName: candidate.name,
        email: candidate.email,
        role: candidate.role,
        status: "ACTIVE",
        lastIssued: "Jun 16, 2026",
      };
      setBadges((prev) => [newBadge, ...prev]);
      setIssuedBadgeName(newBadge.clinicianName);
      setIssuedBadgeId(newBadge.id);
    }

    setNewPin(generatePin());
    setIssueStep(3);
  };

  const handleIssueBadge = (target?: Badge) => {
    if (target) {
      openIssueFlow(badgeToCandidate(target));
      return;
    }
    openIssueFlow();
  };

  const handlePrintBadge = async (name: string, id?: string) => {
    await printBadge(name, id);
  };

  const handleExportPdf = async (name: string, id?: string) => {
    setExporting(true);
    try {
      await downloadBadgePdf(name, id);
    } finally {
      setExporting(false);
    }
  };

  const handleRegenerateConfirm = () => {
    if (regenerateTarget) {
      setIssuedBadgeName(regenerateTarget.clinicianName);
    }
    setNewPin(generatePin());
    setRegenerateTarget(null);
    setShowPinModal(true);
  };

  const handleDeactivate = (badge: Badge) => {
    setBadges((prev) =>
      prev.map((b) =>
        b.id === badge.id ? { ...b, status: "DEACTIVATED" as const } : b,
      ),
    );
  };

  const handleCopyPin = async () => {
    try {
      await navigator.clipboard.writeText(newPin.replace(/\s/g, ""));
      setPinCopied(true);
      setTimeout(() => setPinCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const closePinModal = () => {
    setShowPinModal(false);
    setPinCopied(false);
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
                Badge Registry
              </h2>
              <p className="text-sm text-text-secondary">
                Manage clinician badges and access credentials
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
                {filtered.map((badge) => (
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
                        onClick={(e) => {
                          if (menuOpenId === badge.id) {
                            closeMenu();
                          } else {
                            setMenuOpenId(badge.id);
                            setMenuAnchor(e.currentTarget.getBoundingClientRect());
                          }
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-page"
                        data-menu-trigger
                      >
                        <MoreVertical className="h-4 w-4 text-text-muted" />
                      </button>
                    </td>
                  </tr>
                ))}
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
              onRegeneratePin: () => setRegenerateTarget(openMenuBadge),
              onPrint: () => handlePrintBadge(openMenuBadge.clinicianName, openMenuBadge.id),
              onExportPdf: () =>
                handleExportPdf(openMenuBadge.clinicianName, openMenuBadge.id),
              onDeactivate: () => handleDeactivate(openMenuBadge),
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
                {filteredEligible.length === 0 ? (
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

              <div className="mt-6 flex gap-3 rounded-xl border border-border bg-page px-4 py-4 text-left">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue" />
                <p className="text-sm leading-relaxed text-text-secondary">
                  Please confirm this is the correct clinician for badge issuance. The
                  digital badge will be generated using the information and photo shown
                  above.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border bg-[#f9f9f9] px-6 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIssueStep(1)}
              >
                Back
              </Button>
              <Button
                size="sm"
                onClick={() => completeIssue(selectedCandidate)}
                className="gap-1"
              >
                Confirm &amp; Continue
                <ChevronRight className="h-4 w-4" />
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

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                closeIssueFlow();
                handlePrintBadge(issuedBadgeName, issuedBadgeId);
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
                closeIssueFlow();
                handleExportPdf(issuedBadgeName, issuedBadgeId);
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

      {/* Regenerate PIN confirmation — image 2 */}
      <Modal
        open={!!regenerateTarget}
        onClose={() => setRegenerateTarget(null)}
        bare
        className="max-w-xl"
      >
        <div className="px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#429ee2]">
              <RefreshCw className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-text-primary">
                Regenerate Clinician PIN?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                This will immediately invalidate the current PIN and generate a new one
                for <strong>{regenerateTarget?.clinicianName}</strong>. The clinician
                will need to use the new PIN for identity fallback.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-border bg-[#f9f9f9] px-6 py-4">
          <Button variant="outline" size="sm" onClick={() => setRegenerateTarget(null)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleRegenerateConfirm} className="gap-1">
            Generate New PIN
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </Modal>

      {/* New PIN generated */}
      <Modal
        open={showPinModal}
        onClose={closePinModal}
        bare
        showClose={false}
        className="max-w-lg overflow-hidden"
      >
        <div className="px-6 pb-6 pt-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#76d231]">
            <Check className="h-8 w-8 text-white" strokeWidth={3} />
          </div>
          <h3 className="font-display text-xl font-bold text-text-primary">
            New PIN Generated Successfully
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-text-secondary">
            The security credentials for{" "}
            <strong>{issuedBadgeName}</strong> have been updated and are ready for
            use.
          </p>

          <div className="relative mt-6 rounded-xl border border-[#b8dff5] bg-[#eff7fd] px-5 py-5">
            <p className="text-center font-display text-4xl font-bold tracking-[0.2em] text-text-primary">
              {newPin}
            </p>
            <button
              type="button"
              onClick={handleCopyPin}
              className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-white hover:text-text-primary"
              aria-label={pinCopied ? "PIN copied" : "Copy PIN"}
              title={pinCopied ? "Copied!" : "Copy PIN"}
            >
              {pinCopied ? (
                <Check className="h-5 w-5 text-[#76d231]" strokeWidth={3} />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-[#f5b8c8] bg-[#fce7f3] px-4 py-4 text-left">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#e5649f]" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#e5649f]">
                  Critical Security Notice
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-[#e5649f]">
                  For security, this PIN will only be shown once. Please ensure the
                  clinician records it immediately in a secure manager. It will be
                  hidden as soon as you close this window.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border bg-[#f9f9f9] px-6 py-4">
          <Button
            size="lg"
            onClick={closePinModal}
            className="h-12 w-full rounded-xl bg-[#76d231] text-white hover:bg-[#68bd2b] border-[#76d231]"
          >
            Done
          </Button>
        </div>
      </Modal>
    </>
  );
}
