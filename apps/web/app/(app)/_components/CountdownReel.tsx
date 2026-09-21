"use client";

import { useEffect, useState } from "react";

/**
 * The two-digit "deals left" reel, which spins like a slot machine before
 * settling on the real number.
 *
 * Ten to fifteen random frames at 70ms, then the answer - the prototype's
 * timings. It starts on the true number so the server-rendered HTML and the
 * first client paint agree; the spin begins after mount.
 */
const FRAME_MS = 70;

export function CountdownReel({ dealsLeft }: { dealsLeft: number }) {
  const target = String(dealsLeft).padStart(2, "0");
  const [digits, setDigits] = useState(target);

  useEffect(() => {
    const maxSpins = 10 + Math.floor(Math.random() * 6);
    let spins = 0;

    const timer = window.setInterval(() => {
      spins += 1;

      if (spins >= maxSpins) {
        window.clearInterval(timer);
        setDigits(target);
        return;
      }

      setDigits(String(Math.floor(Math.random() * 100)).padStart(2, "0"));
    }, FRAME_MS);

    return () => window.clearInterval(timer);
  }, [target]);

  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${dealsLeft} deals left`}>
      {digits.split("").map((digit, index) => (
        <span key={index} className="digit-tile" aria-hidden="true">
          {digit}
        </span>
      ))}
    </span>
  );
}
