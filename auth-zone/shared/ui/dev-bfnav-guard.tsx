import Script from "next/script";
import { DevBfNavHydrationMarker } from "@/shared/ui/dev-bfnav-hydration-marker";

// Dev-only workaround: the Next.js dev server can stall hydration when a page
// is restored via the browser's back/forward buttons. Effects never run and
// the app can sit on a spinner forever. Production builds are not affected.
const DEV_BF_NAV_SCRIPT = `if (performance.getEntriesByType("navigation")[0]?.type === "back_forward") {
  setTimeout(function () { if (!window.__hydrated) location.reload(); }, 3000);
}`;

export function DevBfNavGuard() {
  return (
    <>
      {process.env.NODE_ENV === "development" ? (
        <Script
          id="dev-bfnav-guard"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: DEV_BF_NAV_SCRIPT }}
        />
      ) : null}
      <DevBfNavHydrationMarker />
    </>
  );
}
