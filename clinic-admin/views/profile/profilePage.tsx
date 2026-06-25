"use client";

import { useEffect, useState } from "react";
import { KeyRound, Pencil, Save } from "lucide-react";
import { getDevSession } from "@/lib/auth/session";
import {
  defaultUserProfile,
  getUserDisplayName,
  getUserInitials,
  type UserProfile,
} from "@/lib/user-profile";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { PageHeader } from "@/shared/ui/page-header";
import { cn } from "@/lib/utils";

const cardClass =
  "rounded-xl border border-[#429ee2]/60 bg-white shadow-[0px_1px_8px_0px_rgba(66,158,226,0.25)]";

const selectClass =
  "h-10 w-full rounded-lg border border-text-muted bg-input-bg px-4 text-sm text-text-primary outline-none transition-colors focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20";

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-sm text-text-secondary">
      {children}
      {required && <span className="ml-0.5 text-danger">*</span>}
    </label>
  );
}

export function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(defaultUserProfile);
  const [draft, setDraft] = useState<UserProfile>(defaultUserProfile);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const session = getDevSession();
    if (session?.email) {
      setDraft((prev) => ({ ...prev, email: session.email }));
      setProfile((prev) => ({ ...prev, email: session.email }));
    }
  }, []);

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(profile);
  const displayName = getUserDisplayName(draft);
  const initials = getUserInitials(draft);

  const updateField = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setProfile(draft);
    setSaving(false);
  };

  const handleCancel = () => {
    setDraft(profile);
  };

  return (
    <>
      <PageHeader
        title="Profile"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={handleCancel}
              disabled={!hasChanges}
            >
              Cancel
            </Button>
            <Button size="md" onClick={handleSave} disabled={!hasChanges || saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        }
      />

      <main className="px-8 py-6">
        <div className={cn(cardClass, "overflow-hidden")}>
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr]">
            {/* Profile sidebar */}
            <aside className="flex flex-col items-center border-b border-border bg-page px-6 py-8 lg:border-b-0 lg:border-r">
              <div className="relative mb-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-blue/10 text-2xl font-bold text-brand-blue">
                  {initials}
                </div>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-text-muted shadow-sm hover:text-brand-blue"
                  aria-label="Edit profile photo"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
              <h2 className="text-center font-display text-lg font-bold text-text-primary">
                {displayName}
              </h2>
              <p className="mt-1 text-center text-sm text-text-muted">{draft.role}</p>

              <Button
                variant="outline"
                size="md"
                className="mt-8 w-full gap-2 border-brand-blue text-brand-blue"
              >
                <KeyRound className="h-4 w-4" />
                Reset Password
              </Button>
            </aside>

            {/* Personal information */}
            <section className="px-6 py-6 lg:px-8">
              <h2 className="font-display text-lg font-bold text-brand-blue">
                Personal Information
              </h2>

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <FieldLabel required>Title</FieldLabel>
                  <select
                    value={draft.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    className={selectClass}
                  >
                    <option value="Mr.">Mr.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Dr.">Dr.</option>
                  </select>
                </div>

                <div>
                  <FieldLabel required>First Name</FieldLabel>
                  <Input
                    value={draft.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                  />
                </div>

                <div>
                  <FieldLabel required>Last Name</FieldLabel>
                  <Input
                    value={draft.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                  />
                </div>

                <div>
                  <FieldLabel required>Gender</FieldLabel>
                  <select
                    value={draft.gender}
                    onChange={(e) => updateField("gender", e.target.value)}
                    className={selectClass}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <FieldLabel required>Contact</FieldLabel>
                  <Input
                    value={draft.contact}
                    onChange={(e) => updateField("contact", e.target.value)}
                    placeholder="+91 9876543210"
                  />
                </div>

                <div>
                  <FieldLabel required>Email</FieldLabel>
                  <Input
                    type="email"
                    value={draft.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                </div>

                <div>
                  <FieldLabel required>Birth date</FieldLabel>
                  <Input
                    type="date"
                    value={draft.birthDate}
                    onChange={(e) => updateField("birthDate", e.target.value)}
                  />
                </div>

                <div>
                  <FieldLabel>Role</FieldLabel>
                  <Input value={draft.role} readOnly className="cursor-not-allowed bg-page" />
                </div>

                <div className="sm:col-span-2">
                  <FieldLabel required>City</FieldLabel>
                  <Input
                    value={draft.city}
                    onChange={(e) => updateField("city", e.target.value)}
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
