"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/shared/ui/Icon";

/**
 * Back, to wherever this page was opened from.
 *
 * The prototype tracked the previous view in a variable so the product page
 * could return to Home or to Deals; history does that for us, and correctly for
 * the cases it never handled - a refresh, or a link opened from outside.
 */
export function BackLink({ fallbackHref }: { fallbackHref: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
          return;
        }

        router.push(fallbackHref);
      }}
      className="group flex cursor-pointer items-center gap-1.5 text-xs font-extrabold text-navy transition hover:text-[#2E7D32] active:scale-95"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-border-light bg-slate-page text-navy transition group-hover:bg-[#E8F5E9] group-hover:text-[#2E7D32]">
        <Icon name="arrow-left" className="h-4 w-4" />
      </span>
      <span>Back</span>
    </button>
  );
}
