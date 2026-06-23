import { getHikigaiConfig } from "./config";

export const IDEXX_MCP_CONNECTOR_NAME = "idexx-mcp-server";

/** Build the idexx-mcp-server connector block for agent invoke requests. */
export function buildIdexxMcpConnector(): Record<string, Record<string, string>> {
  const { idexxMcpUrl, idexxApiKey, idexxProjectId } = getHikigaiConfig();
  const base = idexxMcpUrl.replace(/\/$/, "");
  const url = `${base}/?apiKey=${encodeURIComponent(idexxApiKey)}&projectId=${encodeURIComponent(idexxProjectId)}`;

  return {
    [IDEXX_MCP_CONNECTOR_NAME]: {
      url,
      apiKey: idexxApiKey,
      projectId: idexxProjectId,
    },
  };
}
