"use client";

import { useState } from "react";
import {
  Calendar,
  CircleAlert,
  Mic,
  RotateCcw,
  Save,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import { cn } from "@/lib/utils";

const DEFAULT_PHRASE = "Hey Hikigai";

const EXAMPLE_SUFFIXES = [
  "start the visit",
  "end the visit",
  "pause recording",
  "submit visit",
];

const cardClass =
  "rounded-xl border border-[#429ee2]/60 bg-white px-6 py-5 shadow-[0px_1px_8px_0px_rgba(66,158,226,0.25)]";

export function WakePhrasePage() {
  const [phrase, setPhrase] = useState(DEFAULT_PHRASE);
  const [draft, setDraft] = useState(DEFAULT_PHRASE);
  const [lastUpdatedBy] = useState("Siri Reddy");
  const [lastUpdatedAt] = useState("June 11, 2026 at 1:49 PM");
  const [saving, setSaving] = useState(false);
  const [showError, setShowError] = useState(false);

  const hasChanges = draft !== phrase;
  const isEmpty = draft.trim().length === 0;
  const displayPhrase = draft.trim() || DEFAULT_PHRASE;

  const savePhrase = async () => {
    if (isEmpty) {
      setShowError(true);
      return;
    }
    setShowError(false);
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setPhrase(draft.trim());
    setDraft(draft.trim());
    setSaving(false);
  };

  const handleReset = () => {
    setDraft(DEFAULT_PHRASE);
    setShowError(false);
  };

  const handleCancel = () => {
    setDraft(phrase);
    setShowError(false);
  };

  const handleDraftChange = (value: string) => {
    setDraft(value);
    if (value.trim().length > 0) setShowError(false);
  };

  return (
    <>
      <PageHeader title="Wake Phrase" />
      <main className="px-8 py-6">
        <div className="mx-auto max-w-4xl space-y-5">
          {/* Wake phrase */}
          <section className={cardClass}>
            <h2 className="text-base font-bold text-text-primary">Wake Phrase</h2>
            <p className="mt-1 text-sm text-text-muted">
              Staff say this phrase followed by a command to control the robot during a visit.
              Keep it short and distinct.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="flex-1">
                <div className="relative">
                  <label className="absolute -top-2.5 left-3 z-10 bg-white px-1 text-xs text-text-muted">
                    Wake phrase
                  </label>
                  <div
                    className={cn(
                      "flex h-12 items-center gap-2 rounded-lg border bg-white px-3",
                      showError && isEmpty
                        ? "border-danger"
                        : "border-[#429ee2]",
                    )}
                  >
                    <Mic className="h-4 w-4 shrink-0 text-[#429ee2]" />
                    <input
                      type="text"
                      value={draft}
                      onChange={(e) => handleDraftChange(e.target.value)}
                      placeholder="Hey Hikigai"
                      className="min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
                    />
                    {draft.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleDraftChange("")}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-text-muted hover:bg-page hover:text-text-primary"
                        aria-label="Clear wake phrase"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                {showError && isEmpty && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-danger">
                    <CircleAlert className="h-3.5 w-3.5 shrink-0" />
                    The phrase cannot be empty.
                  </p>
                )}
              </div>

              <Button
                size="md"
                onClick={savePhrase}
                disabled={saving}
                className="h-12 shrink-0 px-5"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </section>

          {/* Example commands */}
          <section className={cardClass}>
            <h2 className="text-base font-bold text-text-primary">Example Commands</h2>
            <p className="mt-1 text-sm text-text-muted">
              See how your current phrase will be used by staff in the clinic.
            </p>

            <div className="mt-5 space-y-3">
              {EXAMPLE_SUFFIXES.map((suffix) => (
                <div
                  key={suffix}
                  className="rounded-lg border border-[#e5e0eb] bg-white px-4 py-3 text-sm"
                >
                  <span className="font-medium text-[#429ee2]">{displayPhrase}</span>
                  <span className="text-text-primary">, {suffix}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Last updated */}
          <section
            className={cn(
              cardClass,
              "border-dashed border-[#429ee2]/60 shadow-none",
            )}
          >
            <h2 className="text-base font-bold text-text-primary">Last Updated</h2>
            <div className="mt-4 space-y-2">
              <p className="flex items-center gap-2 text-sm text-text-secondary">
                <User className="h-4 w-4 shrink-0 text-text-muted" />
                Updated by {lastUpdatedBy}
              </p>
              <p className="flex items-center gap-2 text-sm text-text-secondary">
                <Calendar className="h-4 w-4 shrink-0 text-text-muted" />
                {lastUpdatedAt}
              </p>
            </div>
          </section>

          {/* Footer actions */}
          <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="outline"
              size="md"
              onClick={handleReset}
              className="h-10 border-text-primary bg-white px-4 text-text-primary hover:bg-page"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset to Default
            </Button>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={!hasChanges}
                className="text-sm text-text-primary underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
              >
                Cancel Changes
              </button>
              <Button
                size="md"
                onClick={savePhrase}
                disabled={!hasChanges || saving}
                className="h-10 px-5"
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save All Changes"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
