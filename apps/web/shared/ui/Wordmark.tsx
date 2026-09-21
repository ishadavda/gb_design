import Image from "next/image";

/**
 * Brand lockup for the splash screen - the supplied artwork, at the width the
 * approved screen uses (w-60).
 *
 * `priority` because this is the first thing on the first screen: left to lazy
 * load it arrives after the fold has already painted, and the splash flashes
 * empty above the tagline.
 */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/brand/greenback-logo.jpg"
      alt="Greenback Cash - cash back on cannabis"
      width={386}
      height={143}
      priority
      className={`w-60 select-none ${className}`}
    />
  );
}
