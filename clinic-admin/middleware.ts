import { NextRequest, NextResponse } from "next/server";

const DEFAULT_AUTH_ZONE_URL = "https://auth-zone-6d1073e3.apps.hikigaiplatform.io";

function getAuthZoneOrigin(): string {
  const fromEnv = process.env.AUTH_ZONE_URL?.trim();
  const base =
    fromEnv ||
    (process.env.NODE_ENV === "development" ? "http://localhost:3002" : DEFAULT_AUTH_ZONE_URL);
  return base.replace(/\/$/, "");
}

/** Legacy proxy for auth-zone static assets only. Login/signup are served by clinic-admin. */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/auth-static/")) {
    return NextResponse.next();
  }

  const authZoneOrigin = getAuthZoneOrigin();
  const target = `${authZoneOrigin}${pathname}${request.nextUrl.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      cache: "no-store",
    });

    return new NextResponse(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: upstream.headers,
    });
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/auth-static/:path*"],
};
