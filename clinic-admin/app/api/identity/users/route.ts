import { NextResponse } from "next/server";
import { HikigaiApiError } from "@/lib/hikigai/errors";
import { isIdentityConfigured } from "@/lib/hikigai/config";
import { listIdentityUsersWithBadges } from "@/lib/hikigai/identity";

export async function GET() {
  if (!isIdentityConfigured()) {
    return NextResponse.json(
      { error: "Hikigai Identity is not configured on the server (HIKIGAI_APP_ID required)" },
      { status: 503 },
    );
  }

  try {
    const users = await listIdentityUsersWithBadges();
    return NextResponse.json({ users });
  } catch (error) {
    const message =
      error instanceof HikigaiApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Failed to load identity users";

    const status = error instanceof HikigaiApiError && error.status ? error.status : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
