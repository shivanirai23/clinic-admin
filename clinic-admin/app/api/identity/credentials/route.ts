import { NextResponse } from "next/server";
import { HikigaiApiError } from "@/lib/hikigai/errors";
import { isHikigaiConfigured } from "@/lib/hikigai/config";
import { revokeEndUserCredential } from "@/lib/hikigai/credentials";
import { formatUserFacingError } from "@/lib/user-facing-errors";

export async function DELETE(request: Request) {
  if (!isHikigaiConfigured()) {
    return NextResponse.json(
      {
        error:
          "Badge management isn't set up yet. Please contact your clinic administrator.",
      },
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
    return NextResponse.json({ error: "Invalid request. Please try again." }, { status: 400 });
  }

  if (!userId || !credentialId) {
    return NextResponse.json(
      { error: "We couldn't deactivate this badge because required details were missing." },
      { status: 400 },
    );
  }

  try {
    await revokeEndUserCredential(userId, credentialId);
    return NextResponse.json({ success: true, message: "Badge deactivated" });
  } catch (error) {
    const message = formatUserFacingError(error, "badges");

    const status = error instanceof HikigaiApiError && error.status ? error.status : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
