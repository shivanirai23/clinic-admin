import { NextRequest, NextResponse } from "next/server";

const DEFAULT_AUTH_ZONE_URL = "https://auth-zone-6d1073e3.apps.hikigaiplatform.io";

function getAuthZoneOrigin(): string {
  const fromEnv = process.env.AUTH_ZONE_URL?.trim();
  const base =
    fromEnv ||
    (process.env.NODE_ENV === "development" ? "http://localhost:3002" : DEFAULT_AUTH_ZONE_URL);
  return base.replace(/\/$/, "");
}

function isAuthZonePath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/auth-static/")
  );
}

function rewriteLocationHeader(location: string, request: NextRequest, authZoneOrigin: string): string {
  if (location.startsWith(authZoneOrigin)) {
    return location.replace(authZoneOrigin, request.nextUrl.origin);
  }
  return location;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isAuthZonePath(pathname)) {
    return NextResponse.next();
  }

  const authZoneOrigin = getAuthZoneOrigin();
  const target = `${authZoneOrigin}${pathname}${request.nextUrl.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.set("x-forwarded-host", request.headers.get("host") ?? "");
  headers.set("x-forwarded-proto", request.nextUrl.protocol.replace(":", ""));

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
      redirect: "manual",
      cache: "no-store",
    });

    const responseHeaders = new Headers(upstream.headers);
    const location = responseHeaders.get("location");
    if (location) {
      responseHeaders.set("location", rewriteLocationHeader(location, request, authZoneOrigin));
    }

    return new NextResponse(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Auth zone proxy failed";
    return NextResponse.json(
      {
        error: "Auth zone unavailable",
        detail: message,
        authZoneUrl: authZoneOrigin,
        hint: "Ensure auth-zone is deployed and AUTH_ZONE_URL is set on clinic-admin.",
      },
      { status: 502 },
    );
  }
}

export const config = {
  matcher: ["/login", "/signup", "/auth-static/:path*"],
};
