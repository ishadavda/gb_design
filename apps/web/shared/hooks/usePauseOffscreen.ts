"use client";

import { useEffect, useRef, useState } from "react";

/**
 * True while the element is off screen, so its animations can be parked.
 *
 * The deal cards run two infinite animations each - the chasing lights and the
 * flipping tile - and a list of them repainting below the fold is battery spent
 * on nothing. The prototype solved it with an IntersectionObserver toggling
 * `.anim-paused`; this is the same observer, returning the answer instead of
 * reaching into the DOM.
 *
 * Without the API (older Safari) nothing pauses, which is the prototype's
 * behaviour there too.
 */
export function usePauseOffscreen<T extends HTMLElement>(): {
  ref: React.RefObject<T | null>;
  paused: boolean;
} {
  const ref = useRef<T>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => setPaused(!entry?.isIntersecting),
      { threshold: 0.1 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return { ref, paused };
}
