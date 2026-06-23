export { getHikigaiConfig, isHikigaiConfigured, isIdentityConfigured } from "./config";
export { invokeAgent } from "./client";
export { buildIdexxMcpConnector, IDEXX_MCP_CONNECTOR_NAME } from "./connectors";
export { HikigaiApiError } from "./errors";
export { getAccessToken, clearAccessTokenCache } from "./auth";
export { issueQrBadge, listIdentityUsers, listIdentityUsersWithBadges } from "./identity";
export {
  deriveQrBadgeInfo,
  listEndUserCredentials,
  revokeEndUserCredential,
} from "./credentials";
export { fetchClinicAppointments, mapIdexxAppointmentsToVisits } from "./appointments";
export type { IdentityUser, IdentityUserWithBadge, IssueQrBadgeResponse } from "./identity";
export type { EndUserCredential, QrBadgeInfo } from "./credentials";
export type {
  ClinicalDecisionSupportInput,
  ClinicalDecisionSupportOutput,
  HikigaiInvokeResponse,
  InvokeAgentOptions,
} from "./types";
