"use client";

import { useLayoutEffect, useState } from "react";

/**
 * True only while this component is on screen.
 *
 * Next 16 keeps visited pages alive (hidden) and shows them again on return. react-leaflet can't
 * reattach a map that was hidden, which crashed the page ("Map container is being reused").
 * Rendering the map only while shown gives it a fresh container every time.
 */
export function useShownOnly(): boolean {
  const [shown, setShown] = useState(false);
  useLayoutEffect(() => {
    // Intentional: this runs only when the page is shown or hidden, not on every render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShown(true);
    return () => setShown(false);
  }, []);
  return shown;
}
