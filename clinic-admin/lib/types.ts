export type BadgeStatus = "ACTIVE" | "DEACTIVATED" | "LOST" | "NO_BADGE";

export type PhmsType = "cornerstone" | "neo";

export type WriteRetryStatus = "pending" | "retrying" | "resolved";

export interface Visit {
  id: string;
  petName: string;
  ownerName: string;
  species: string;
  breed: string;
  veterinarian: string;
  reason: string;
  time: string;
}

export interface PendingWrite {
  id: string;
  petName: string;
  phms: "CORNERSTONE" | "NEO";
  status: WriteRetryStatus;
}

export interface Badge {
  id: string;
  clinicianName: string;
  email: string;
  role: string;
  status: BadgeStatus;
  lastIssued: string | null;
}

export interface ClinicianCandidate {
  id: string;
  name: string;
  role: string;
  email: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface DashboardMetrics {
  visitsToday: number;
  successRate: number;
  pendingWrites: number;
  qrAlerts: number;
}
