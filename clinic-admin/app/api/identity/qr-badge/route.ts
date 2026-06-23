import { NextResponse } from "next/server";
import { HikigaiApiError } from "@/lib/hikigai/errors";
import { getHikigaiConfig, isHikigaiConfigured } from "@/lib/hikigai/config";
import { issueQrBadge } from "@/lib/hikigai/identity";

export async function POST(request: Request) {
  if (!isHikigaiConfigured()) {
    return NextResponse.json(
      { error: "Hikigai API is not configured on the server" },
      { status: 503 },
    );
  }

  const { appId } = getHikigaiConfig();
  if (!appId) {
    return NextResponse.json(
      { error: "HIKIGAI_APP_ID is not configured on the server" },
      { status: 503 },
    );
  }

  let email: string;
  try {
    const body = (await request.json()) as { email?: string };
    email = body.email?.trim() ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  try {
    const badge = await issueQrBadge(email);
    return NextResponse.json(badge);
  } catch (error) {
    const message =
      error instanceof HikigaiApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Failed to issue QR badge";

    const status = error instanceof HikigaiApiError && error.status ? error.status : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
