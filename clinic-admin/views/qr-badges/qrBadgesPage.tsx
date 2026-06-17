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
  KeyRound,
  MoreVertical,
  Printer,
  QrCode,
  RefreshCw,
  Search,
  ShieldOff,
  X,
} from "lucide-react";
import { badgeRegistry } from "@/lib/mock-data";
import { downloadBadgePdf, printBadge } from "@/lib/badge-export";
import type { Badge } from "@/lib/types";
import { Button } from "@/shared/ui/button";
import { StatusBadge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { DropdownMenu, Modal } from "@/shared/ui/modal";
import { PageHeader } from "@/shared/ui/page-header";
import { StatCard } from "@/shared/ui/stat-card";

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
  const [showIssueSuccess, setShowIssueSuccess] = useState(false);
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

  const handleIssueBadge = (target?: Badge) => {
    if (target) {
      setBadges((prev) =>
        prev.map((b) =>
          b.id === target.id
            ? { ...b, status: "ACTIVE" as const, lastIssued: "Jun 16, 2026" }
            : b,
        ),
      );
      setIssuedBadgeName(target.clinicianName);
      setIssuedBadgeId(target.id);
    } else {
      const newBadge: Badge = {
        id: `badge-${Date.now()}`,
        clinicianName: "Dr. Alex Rivera",
        email: "alex.rivera@clinic.com",
        role: "Veterinarian",
        status: "ACTIVE",
        lastIssued: "Jun 16, 2026",
      };
      setBadges((prev) => [newBadge, ...prev]);
      setIssuedBadgeName(newBadge.clinicianName);
      setIssuedBadgeId(newBadge.id);
    }
    setNewPin(generatePin());
    setShowIssueSuccess(true);
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
            label="Lost / Deactivated"
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
            <Button size="lg" onClick={() => handleIssueBadge()} className="gap-2">
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

      {/* Issue badge success — image 1 */}
      <Modal
        open={showIssueSuccess}
        onClose={() => setShowIssueSuccess(false)}
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
            onClick={() => setShowIssueSuccess(false)}
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
                setShowIssueSuccess(false);
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
                setShowIssueSuccess(false);
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
