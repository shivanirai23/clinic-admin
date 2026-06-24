import { NextResponse } from "next/server";
import { fetchClinicAppointments } from "@/lib/hikigai/appointments";
import { isHikigaiConfigured } from "@/lib/hikigai/config";
import { formatUserFacingError } from "@/lib/user-facing-errors";

export async function GET(request: Request) {
  if (!isHikigaiConfigured()) {
    return NextResponse.json(
      { error: "Appointment sync isn't set up yet. Please contact your clinic administrator." },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? undefined;

  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Please use a date in YYYY-MM-DD format." },
      { status: 400 },
    );
  }

  try {
    const visits = await fetchClinicAppointments(date);
    return NextResponse.json({ visits, source: "hikigai" });
  } catch (error) {
    const message = formatUserFacingError(error, "appointments");

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
