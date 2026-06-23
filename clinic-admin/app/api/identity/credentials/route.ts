import { NextResponse } from "next/server";
import { HikigaiApiError } from "@/lib/hikigai/errors";
import { isHikigaiConfigured } from "@/lib/hikigai/config";
import { revokeEndUserCredential } from "@/lib/hikigai/credentials";

export async function DELETE(request: Request) {
  if (!isHikigaiConfigured()) {
    return NextResponse.json(
      { error: "Hikigai API is not configured on the server" },
      { status: 503 },
    );
  }

  let userId: string;
  let credentialId: string;

  try {
    const body = (await request.json()) as { userId?: string; credentialId?: string };
    userId = body.userId?.trim() ?? "";
    credentialId = body.credentialId?.trim() ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!userId || !credentialId) {
    return NextResponse.json(
      { error: "userId and credentialId are required" },
      { status: 400 },
    );
  }

  try {
    await revokeEndUserCredential(userId, credentialId);
    return NextResponse.json({ success: true, message: "Credential revoked" });
  } catch (error) {
    const message =
      error instanceof HikigaiApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Failed to revoke credential";

    const status = error instanceof HikigaiApiError && error.status ? error.status : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
