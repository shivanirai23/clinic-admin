"use client";

import { useEffect } from "react";

// Dev-only workaround: the Next.js dev server can stall hydration when a page
// is restored via the browser's back/forward buttons (a hard navigation across
// zones re-enters the page from disk cache). Effects never run and the app
// sits on the AuthGuard spinner forever. Production builds are not affected.
//
// The inline script arms a one-shot reload on back/forward loads; the effect
// below disarms it as soon as hydration actually completes. A reload's
// navigation type is "reload", so this can never loop.
export function DevBfNavGuard() {
  useEffect(() => {
    (window as unknown as { __hydrated?: boolean }).__hydrated = true;
  }, []);

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `if (performance.getEntriesByType("navigation")[0]?.type === "back_forward") {
  setTimeout(function () { if (!window.__hydrated) location.reload(); }, 3000);
}`,
      }}
    />
  );
}
