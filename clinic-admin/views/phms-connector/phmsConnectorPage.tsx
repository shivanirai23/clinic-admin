"use client";

import { useState } from "react";
import { CheckCircle2, Eye, EyeOff, Save, Stethoscope } from "lucide-react";
import type { PhmsType } from "@/lib/types";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { PageHeader } from "@/shared/ui/page-header";
import { cn } from "@/lib/utils";

export function PhmsConnectorPage() {
  const [phmsType, setPhmsType] = useState<PhmsType>("cornerstone");
  const [username, setUsername] = useState("siri@gmail.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [connected, setConnected] = useState(true);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setConnected(true);
    setTesting(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
  };

  return (
    <>
      <PageHeader title="PHMS Connector" />
      <main className="px-8 py-6">
        <div className="rounded-xl border border-border bg-white shadow-sm">
          {/* PHMS type */}
          <section className="border-b border-border px-6 py-5">
            <h2 className="mb-4 text-sm font-bold text-text-primary">PHMS type</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(["cornerstone", "neo"] as const).map((type) => {
                const selected = phmsType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPhmsType(type)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-5 py-4 text-left transition-colors",
                      selected
                        ? "border-[#429ee2] bg-white"
                        : "border-border bg-white hover:border-[#429ee2]/40",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                        selected ? "border-[#429ee2]" : "border-border",
                      )}
                    >
                      {selected && (
                        <span className="h-2.5 w-2.5 rounded-full bg-[#429ee2]" />
                      )}
                    </span>
                    <span className="text-sm font-semibold capitalize text-text-primary">
                      {type}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Credentials */}
          <section className="border-b border-border px-6 py-5">
            <h2 className="mb-4 text-sm font-bold text-text-primary">Credentials</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm text-text-secondary">
                  Username or Email
                </label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="siri@gmail.com"
                  className="bg-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-text-secondary">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Connection status */}
          {connected && (
            <section className="border-b border-border px-6 py-4">
              <div
                className="flex items-center gap-2 rounded-lg border px-4 py-3"
                style={{ backgroundColor: "#e8f5e9", borderColor: "#81c92f", color: "#2e7d32" }}
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">Connected successfully</span>
              </div>
            </section>
          )}

          {/* Actions */}
          <section className="flex flex-wrap gap-3 px-6 py-5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTest}
              disabled={testing}
              className="gap-2 border-text-primary text-text-primary"
            >
              <Stethoscope className="h-4 w-4" />
              {testing ? "Testing..." : "Test connection"}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save configuration"}
            </Button>
          </section>
        </div>
      </main>
    </>
  );
}
