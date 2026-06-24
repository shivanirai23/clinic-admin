"use client";

import { useEffect } from "react";

/** Marks client hydration complete so the dev back/forward reload guard can disarm. */
export function DevBfNavHydrationMarker() {
  useEffect(() => {
    (window as unknown as { __hydrated?: boolean }).__hydrated = true;
  }, []);

  return null;
}
