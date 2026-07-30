"use client";

import { useEffect, useRef } from "react";
import type { BeeField } from "./beeField";

/**
 * Host element for the swarm. The <canvas> and the engine are created after
 * mount and code-split out of the initial bundle, so the swarm costs the first
 * paint nothing at all - the server-rendered markup here is a single empty div.
 */
export function BeeDrift() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let field: BeeField | null = null;
    let cancelled = false;

    const boot = () => {
      if (cancelled) return;
      void import("./beeField").then(({ createBeeField }) => {
        if (cancelled || !hostRef.current) return;
        field = createBeeField(hostRef.current);
      });
    };

    // Wait for the browser to go quiet before measuring the page and baking
    // the sprite atlas.
    const canIdle = typeof window.requestIdleCallback === "function";
    const handle = canIdle
      ? window.requestIdleCallback(boot, { timeout: 500 })
      : window.setTimeout(boot, 120);

    return () => {
      cancelled = true;
      if (canIdle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
      field?.destroy();
      field = null;
    };
  }, []);

  return <div className="bee-drift-field" aria-hidden="true" ref={hostRef} />;
}
