import type { OfferArt } from "@/modules/offers";

/**
 * The product illustration on the back face of a deal tile.
 *
 * Drawn rather than photographed, exactly as in the approved screens: eight
 * pieces of art, one per product form, each 60x60 and self-contained.
 *
 * The gradient ids are shared across every instance on purpose. Two cards
 * showing the same art define the same gradient twice with identical stops, so a
 * duplicate id costs nothing - and giving each card its own would mean making
 * this a client component to get a unique one.
 */
export function DealArt({ art }: { art: OfferArt }) {
  return ART[art];
}

const flower = (
  <svg width="58" height="58" viewBox="0 0 60 60">
    <defs>
      <radialGradient id="gb-bud" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stopColor="#8BC34A" />
        <stop offset="45%" stopColor="#4A8C2A" />
        <stop offset="100%" stopColor="#1F4A12" />
      </radialGradient>
      <linearGradient id="gb-jar" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#2E7D32" />
        <stop offset="100%" stopColor="#0A3D0F" />
      </linearGradient>
    </defs>
    <rect width="60" height="60" fill="url(#gb-jar)" />
    <ellipse cx="30" cy="46" rx="20" ry="6" fill="#153D0C" />
    <path
      d="M14 22c3-6 9-4 12-8 2 5 8 3 11 9 3 6 1 15-11 16-13 1-15-11-12-17z"
      fill="url(#gb-bud)"
    />
    <path
      d="M20 20c2 3 2 7 0 10M30 15c1 4 0 8-1 11M38 24c-1 3-3 6-6 8"
      stroke="#0F2E08"
      strokeWidth="1"
      fill="none"
      opacity="0.6"
    />
    <circle cx="22" cy="24" r="1.1" fill="#D8F79E" opacity="0.7" />
    <circle cx="27" cy="19" r="1" fill="#D8F79E" opacity="0.6" />
    <circle cx="34" cy="27" r="1.1" fill="#D8F79E" opacity="0.7" />
    <circle cx="24" cy="31" r="0.9" fill="#D8F79E" opacity="0.5" />
    <ellipse cx="24" cy="18" rx="10" ry="4" fill="#fff" opacity="0.08" />
  </svg>
);

const preroll = (
  <svg width="58" height="58" viewBox="0 0 60 60">
    <defs>
      <linearGradient id="gb-preroll-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#2E1A3D" />
        <stop offset="100%" stopColor="#120814" />
      </linearGradient>
      <linearGradient id="gb-paper" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F3E7C9" />
        <stop offset="50%" stopColor="#D9C79A" />
        <stop offset="100%" stopColor="#A88F5E" />
      </linearGradient>
      <radialGradient id="gb-ember" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stopColor="#FFE082" />
        <stop offset="45%" stopColor="#FF7043" />
        <stop offset="100%" stopColor="#B71C1C" />
      </radialGradient>
    </defs>
    <rect width="60" height="60" fill="url(#gb-preroll-bg)" />
    <g transform="rotate(-35 30 30)">
      <rect x="10" y="26" width="34" height="9" rx="4.5" fill="url(#gb-paper)" />
      <rect x="10" y="30" width="34" height="3" fill="#00000022" />
      <rect x="10" y="26" width="34" height="2" fill="#ffffff55" />
      <path
        d="M15 26v9M20 26v9M25 26v9M30 26v9M35 26v9"
        stroke="#8a6f3f"
        strokeWidth="0.4"
        opacity="0.5"
      />
      <circle cx="47" cy="30.5" r="5.5" fill="url(#gb-ember)" />
      <circle cx="47" cy="30.5" r="2" fill="#FFF3E0" />
    </g>
    <path
      d="M42 12c2 3 1 6-1 8M46 16c2 2 1 5-1 7"
      stroke="#ffffff55"
      strokeWidth="1.4"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

const wax = (
  <svg width="58" height="58" viewBox="0 0 60 60">
    <defs>
      <linearGradient id="gb-wax-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#3D2E0A" />
        <stop offset="100%" stopColor="#150F02" />
      </linearGradient>
      <radialGradient id="gb-wax" cx="40%" cy="30%" r="75%">
        <stop offset="0%" stopColor="#FFD54F" />
        <stop offset="55%" stopColor="#E0A320" />
        <stop offset="100%" stopColor="#8A5A00" />
      </radialGradient>
      <linearGradient id="gb-glass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
      </linearGradient>
    </defs>
    <rect width="60" height="60" fill="url(#gb-wax-bg)" />
    <rect x="17" y="20" width="26" height="26" rx="4" fill="url(#gb-wax)" />
    <rect x="17" y="20" width="26" height="26" rx="4" fill="url(#gb-glass)" />
    <rect x="20" y="14" width="20" height="7" rx="2" fill="#C9C9C9" />
    <rect x="20" y="14" width="20" height="2.5" fill="#ffffff88" />
    <ellipse cx="24" cy="27" rx="4" ry="7" fill="#fff" opacity="0.25" />
    <path d="M17 33h26" stroke="#00000022" strokeWidth="1" />
  </svg>
);

const resin = (
  <svg width="58" height="58" viewBox="0 0 60 60">
    <defs>
      <linearGradient id="gb-resin-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1E1B4B" />
        <stop offset="100%" stopColor="#0F0C29" />
      </linearGradient>
      <radialGradient id="gb-resin" cx="45%" cy="40%" r="70%">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#B45309" />
      </radialGradient>
    </defs>
    <rect width="60" height="60" fill="url(#gb-resin-bg)" />
    <polygon points="30,12 46,24 40,46 20,46 14,24" fill="url(#gb-resin)" />
    <polygon points="30,12 46,24 30,28" fill="#FEF08A" opacity="0.6" />
    <polygon points="14,24 30,12 30,28" fill="#FBBF24" opacity="0.4" />
    <polygon points="30,28 46,24 40,46" fill="#D97706" opacity="0.5" />
    <polygon points="30,28 40,46 20,46" fill="#B45309" opacity="0.7" />
    <circle cx="30" cy="20" r="1.5" fill="#FFF" opacity="0.8" />
  </svg>
);

const vape = (
  <svg width="58" height="58" viewBox="0 0 60 60">
    <defs>
      <linearGradient id="gb-vape-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#18181B" />
        <stop offset="100%" stopColor="#09090B" />
      </linearGradient>
      <linearGradient id="gb-oil" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
    <rect width="60" height="60" fill="url(#gb-vape-bg)" />
    <rect
      x="23"
      y="12"
      width="14"
      height="36"
      rx="4"
      fill="#27272A"
      stroke="#3F3F46"
      strokeWidth="0.8"
    />
    <rect x="26" y="20" width="8" height="14" rx="2" fill="url(#gb-oil)" />
    <circle cx="30" cy="40" r="2" fill="#10B981" />
    <path d="M27 12V8h6v4" fill="#3F3F46" />
  </svg>
);

const edible = (
  <svg width="58" height="58" viewBox="0 0 60 60">
    <defs>
      <linearGradient id="gb-edible-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#4C0519" />
        <stop offset="100%" stopColor="#1F0208" />
      </linearGradient>
      <linearGradient id="gb-gummy" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FB7185" />
        <stop offset="50%" stopColor="#E11D48" />
        <stop offset="100%" stopColor="#9F1239" />
      </linearGradient>
    </defs>
    <rect width="60" height="60" fill="url(#gb-edible-bg)" />
    <rect x="18" y="18" width="24" height="24" rx="6" fill="url(#gb-gummy)" />
    <rect x="18" y="18" width="24" height="24" rx="6" fill="#ffffff" opacity="0.12" />
    <circle cx="23" cy="23" r="1" fill="#fff" opacity="0.8" />
    <circle cx="32" cy="22" r="1.2" fill="#fff" opacity="0.6" />
    <circle cx="36" cy="31" r="0.9" fill="#fff" opacity="0.7" />
    <circle cx="25" cy="35" r="1" fill="#fff" opacity="0.8" />
    <circle cx="30" cy="30" r="4" fill="#BE123C" opacity="0.6" />
    <ellipse cx="26" cy="22" rx="5" ry="2" fill="#fff" opacity="0.3" />
  </svg>
);

const cart = (
  <svg width="58" height="58" viewBox="0 0 60 60">
    <defs>
      <linearGradient id="gb-cart-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#022C22" />
        <stop offset="100%" stopColor="#064E3B" />
      </linearGradient>
      <linearGradient id="gb-amber" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="50%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
    <rect width="60" height="60" fill="url(#gb-cart-bg)" />
    <rect
      x="24"
      y="18"
      width="12"
      height="26"
      rx="2"
      fill="url(#gb-amber)"
      stroke="#FDE68A"
      strokeWidth="0.8"
    />
    <path d="M26 18V10h8v8" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="0.6" />
    <rect x="25" y="44" width="10" height="6" rx="1" fill="#D1D5DB" />
    <rect x="29" y="18" width="2" height="26" fill="#9CA3AF" opacity="0.6" />
    <circle cx="27" cy="28" r="1" fill="#fff" opacity="0.7" />
  </svg>
);

/** `flower2` is the same jar from the same angle; the prototype drew both alike. */
const ART: Record<OfferArt, React.ReactElement> = {
  flower,
  flower2: flower,
  preroll,
  edible,
  resin,
  wax,
  cart,
  vape,
};
