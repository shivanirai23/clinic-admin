import { NextResponse } from "next/server";
import { HikigaiApiError } from "@/lib/hikigai/errors";
import { isBadgesConfigured } from "@/lib/hikigai/config";
import { signupIdentityUser } from "@/lib/hikigai/identity";
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
  let password: string;
  let display_name: string | undefined;

  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      display_name?: string;
    };
    email = body.email?.trim() ?? "";
    password = body.password ?? "";
    display_name = body.display_name?.trim() || undefined;
  } catch {
    return NextResponse.json({ error: "Invalid request. Please try again." }, { status: 400 });
  }

  if (!email) {
    return NextResponse.json(
      { error: "Please enter the clinician's email address." },
      { status: 400 },
    );
  }

  if (!password) {
    return NextResponse.json(
      { error: "Please enter a password." },
      { status: 400 },
    );
  }

  try {
    const user = await signupIdentityUser({ email, password, display_name });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    const message = formatUserFacingError(error, "badges");

    const status = error instanceof HikigaiApiError && error.status ? error.status : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
