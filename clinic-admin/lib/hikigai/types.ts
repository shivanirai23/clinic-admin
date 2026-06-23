export interface HikigaiInvokeResponse<TContent = unknown> {
  content: TContent;
  agent_id?: string;
  session_id?: string;
  latency_ms?: number;
  tokens_used?: number;
  request_id?: string;
}

export interface InvokeAgentOptions {
  timeout?: number;
  connectors?: Record<string, Record<string, unknown>>;
}

export interface ClinicalDecisionSupportInput extends Record<string, unknown> {
  site_id: number;
  date?: string;
}

export interface ClinicalDecisionSupportOutput {
  doctors: string;
  appointments_for_today: string;
}
