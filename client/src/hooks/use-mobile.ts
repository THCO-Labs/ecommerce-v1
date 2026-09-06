
import * as React from "react";

const MOBILE_BREAKPOINT = 768;

/** True while the viewport is below the `md` breakpoint. */
export function useIsMobile() {
  return React.useSyncExternalStore(
    (onChange) => { const query=window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);query.addEventListener("change",onChange);return()=>query.removeEventListener("change",onChange); },
    () => window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches,
    () => false,
  );
}
