import { NextResponse } from "next/server";
import { fetchClinicAppointments } from "@/lib/hikigai/appointments";
import { HikigaiApiError } from "@/lib/hikigai/client";
import { isHikigaiConfigured } from "@/lib/hikigai/config";

export async function GET(request: Request) {
  if (!isHikigaiConfigured()) {
    return NextResponse.json(
      { error: "Hikigai API is not configured on the server" },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? undefined;

  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "date must be in YYYY-MM-DD format" },
      { status: 400 },
    );
  }

  try {
    const visits = await fetchClinicAppointments(date);
    return NextResponse.json({ visits, source: "hikigai" });
  } catch (error) {
    const message =
      error instanceof HikigaiApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Failed to fetch appointments";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
