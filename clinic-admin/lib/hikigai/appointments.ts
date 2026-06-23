import type { Visit } from "@/lib/types";
import { invokeAgent } from "./client";
import { getHikigaiConfig } from "./config";
import type { ClinicalDecisionSupportInput, ClinicalDecisionSupportOutput } from "./types";

/** Agent slug for IDEXX appointments — defined at the call site for this integration. */
const APPOINTMENTS_AGENT_SLUG = "clinic-agent";

interface IdexxAppointment {
  pimsId?: string;
  pimsIdentifier?: string;
  client?: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
  };
  patient?: {
    name?: string;
    speciesPimsDescription?: string;
    breedPimsDescription?: string;
  };
  resource?: {
    firstName?: string;
    lastName?: string;
    title?: string;
  };
  reason?: {
    name?: string;
    description?: string;
  };
  notes?: string;
  startTime?: string;
  startTimeUtc?: string;
}

interface IdexxAppointmentsPayload {
  response?: IdexxAppointment[];
}

function parseJsonString<T>(raw: string | undefined | null): T | null {
  if (!raw?.trim()) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function parseAgentOutput(content: unknown): ClinicalDecisionSupportOutput | null {
  if (!content) return null;

  if (typeof content === "object" && content !== null) {
    const record = content as Record<string, unknown>;
    if (
      typeof record.appointments_for_today === "string" ||
      typeof record.doctors === "string"
    ) {
      return {
        doctors: String(record.doctors ?? ""),
        appointments_for_today: String(record.appointments_for_today ?? ""),
      };
    }
    if (record.output && typeof record.output === "object") {
      return record.output as ClinicalDecisionSupportOutput;
    }
  }

  if (typeof content === "string") {
    const parsed = parseJsonString<ClinicalDecisionSupportOutput | { output: ClinicalDecisionSupportOutput }>(
      content,
    );
    if (!parsed) return null;
    if ("output" in parsed && parsed.output) return parsed.output;
    if ("appointments_for_today" in parsed) return parsed;
  }

  return null;
}

function formatAppointmentTime(iso?: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatOwnerName(client?: IdexxAppointment["client"]): string {
  if (!client) return "—";
  if (client.displayName?.trim()) return client.displayName.trim();
  const name = [client.firstName, client.lastName].filter(Boolean).join(" ").trim();
  return name || "—";
}

function formatVeterinarian(resource?: IdexxAppointment["resource"]): string {
  if (!resource) return "—";
  const name = [resource.title, resource.firstName, resource.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return name || "—";
}

export function mapIdexxAppointmentsToVisits(appointments: IdexxAppointment[]): Visit[] {
  return appointments.map((apt, index) => ({
    id: apt.pimsId ?? apt.pimsIdentifier ?? `apt-${index}`,
    petName: apt.patient?.name?.trim() || "—",
    ownerName: formatOwnerName(apt.client),
    species: apt.patient?.speciesPimsDescription?.trim() || "—",
    breed: apt.patient?.breedPimsDescription?.trim() || "—",
    veterinarian: formatVeterinarian(apt.resource),
    reason: apt.reason?.name?.trim() || apt.notes?.trim() || "—",
    time: formatAppointmentTime(apt.startTime ?? apt.startTimeUtc),
  }));
}

export async function fetchClinicAppointments(date?: string): Promise<Visit[]> {
  const { siteId } = getHikigaiConfig();
  const input: ClinicalDecisionSupportInput = { site_id: siteId };
  if (date) input.date = date;

  const response = await invokeAgent<
    ClinicalDecisionSupportInput,
    string | ClinicalDecisionSupportOutput
  >(APPOINTMENTS_AGENT_SLUG, input, { timeout: 300 });

  const output = parseAgentOutput(response.content);
  if (!output?.appointments_for_today) {
    return [];
  }

  const payload = parseJsonString<IdexxAppointmentsPayload>(output.appointments_for_today);
  const appointments = payload?.response ?? [];
  return mapIdexxAppointmentsToVisits(appointments);
}
