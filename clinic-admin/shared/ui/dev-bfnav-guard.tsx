"use client";

import { useEffect } from "react";

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
