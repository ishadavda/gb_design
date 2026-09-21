"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts from one value to another over `durationMs`, in cents.
 *
 * The approved screens roll money into place rather than swapping the number -
 * the celebration sheet from zero, the ledger balance from its previous total.
 * Same easing as the prototype (ease-out cubic) and the same use of
 * requestAnimationFrame, so it tracks the display refresh instead of a timer.
 *
 * Returns the current value and whether it has landed, which is what drives the
 * one-shot pulse on the final number.
 */
export function useCountUp(
  from: number,
  to: number,
  { durationMs = 1100, delayMs = 0, run = true }: { durationMs?: number; delayMs?: number; run?: boolean } = {},
): { value: number; done: boolean } {
  const [value, setValue] = useState(from);
  const [done, setDone] = useState(false);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (!run) {
      setValue(from);
      setDone(false);
      return;
    }

    let start: number | null = null;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (now: number) => {
      start ??= now;

      const progress = Math.min((now - start) / durationMs, 1);

      setValue(from + (to - from) * easeOutCubic(progress));

      if (progress < 1) {
        frame.current = requestAnimationFrame(step);
      } else {
        setValue(to);
        setDone(true);
      }
    };

    const timer = window.setTimeout(() => {
      frame.current = requestAnimationFrame(step);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      setDone(false);
    };
  }, [from, to, durationMs, delayMs, run]);

  return { value, done };
}
