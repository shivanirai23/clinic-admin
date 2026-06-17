"use client";

import { useState } from "react";
import { Mic } from "lucide-react";
import { wakePhraseExamples } from "@/lib/mock-data";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { PageHeader } from "@/shared/ui/page-header";

const DEFAULT_PHRASE = "Hey CarePilot";

export function WakePhrasePage() {
  const [phrase, setPhrase] = useState(DEFAULT_PHRASE);
  const [draft, setDraft] = useState(DEFAULT_PHRASE);
  const [lastUpdated] = useState("Jun 15, 2026 at 4:30 PM");
  const [saving, setSaving] = useState(false);

  const hasChanges = draft !== phrase;

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setPhrase(draft);
    setSaving(false);
  };

  const handleReset = () => {
    setDraft(DEFAULT_PHRASE);
  };

  const handleCancel = () => {
    setDraft(phrase);
  };

  return (
    <>
      <PageHeader title="Wake Phrase" />
      <main className="px-8 py-6">
        <div className="rounded-xl border border-border bg-white shadow-sm">
          {/* Current wake phrase */}
          <section className="border-b border-border px-6 py-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgba(41,171,226,0.15)]">
                <Mic className="h-5 w-5 text-[#429ee2]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-text-primary">Current Wake Phrase</h2>
                <p className="text-xs text-text-muted">
                  Clinicians use this phrase to activate voice commands
                </p>
              </div>
            </div>

            <label className="mb-1.5 block text-sm text-text-secondary">Wake phrase</label>
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Hey CarePilot"
              className="bg-white"
            />
            <p className="mt-2 text-xs text-text-muted">Last updated: {lastUpdated}</p>
          </section>

          {/* Example commands */}
          <section className="border-b border-border px-6 py-5">
            <h2 className="mb-1 text-sm font-bold text-text-primary">Example Commands</h2>
            <p className="mb-4 text-xs text-text-muted">
              Sample voice commands clinicians can use after the wake phrase
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {wakePhraseExamples.map((example) => (
                <div
                  key={example}
                  className="rounded-lg border border-border bg-[#fcf9f8] px-4 py-3 text-sm text-text-secondary"
                >
                  &ldquo;{example}&rdquo;
                </div>
              ))}
            </div>
          </section>

          {/* Footer actions */}
          <section className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Reset to Default
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel} disabled={!hasChanges}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={!hasChanges || saving}>
                {saving ? "Saving..." : "Save All Changes"}
              </Button>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
