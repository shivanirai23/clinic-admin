import { NextResponse } from "next/server";
import { HikigaiApiError } from "@/lib/hikigai/errors";
import { isBadgesConfigured } from "@/lib/hikigai/config";
import { listIdentityUsersWithBadges } from "@/lib/hikigai/identity";
import { formatUserFacingError } from "@/lib/user-facing-errors";

export async function GET() {
  if (!isBadgesConfigured()) {
    return NextResponse.json(
      {
        error:
          "Badge management isn't set up yet. Please contact your clinic administrator.",
      },
      { status: 503 },
    );
  }

  try {
    const users = await listIdentityUsersWithBadges();
    return NextResponse.json({ users });
  } catch (error) {
    const message = formatUserFacingError(error, "clinicians");

    const status = error instanceof HikigaiApiError && error.status ? error.status : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
