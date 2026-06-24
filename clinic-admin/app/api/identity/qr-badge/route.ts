import { NextResponse } from "next/server";
import { HikigaiApiError } from "@/lib/hikigai/errors";
import { isBadgesConfigured } from "@/lib/hikigai/config";
import { issueQrBadge } from "@/lib/hikigai/identity";
import { formatUserFacingError } from "@/lib/user-facing-errors";

export async function POST(request: Request) {
  if (!isBadgesConfigured()) {
    return NextResponse.json(
      {
        error:
          "Badge management isn't set up yet. Please contact your clinic administrator.",
      },
      { status: 503 },
    );
  }

  let email: string;
  try {
    const body = (await request.json()) as { email?: string };
    email = body.email?.trim() ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid request. Please try again." }, { status: 400 });
  }

  if (!email) {
    return NextResponse.json(
      { error: "Please enter the clinician's email address." },
      { status: 400 },
    );
  }

  try {
    const badge = await issueQrBadge(email);
    return NextResponse.json(badge);
  } catch (error) {
    const message = formatUserFacingError(error, "badges");

    const status = error instanceof HikigaiApiError && error.status ? error.status : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
