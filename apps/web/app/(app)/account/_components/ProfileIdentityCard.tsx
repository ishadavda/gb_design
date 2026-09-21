"use client";

import { Icon } from "@/shared/ui/Icon";
import { DEMO_PROFILE } from "../../_components/demoProfile";
import { useProfile } from "../../_components/ProfileProvider";

/** Name, email and badges - the same identity the cash-out header shows, in light. */
export function ProfileIdentityCard() {
  const profile = useProfile();

  return (
    <div className="mx-3.5 mt-3 overflow-hidden rounded-[22px] border border-slate-700/60 bg-[#0f1d3c] p-4 text-white shadow-[0_8px_18px_rgba(15,23,42,0.15)]">
      <div className="flex items-center gap-3.5">
        <div className="relative shrink-0">
          <div className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-white/10 bg-gradient-to-br from-[#6ed898] to-[#2ea75d] text-xl font-black text-[#0b1f2a] shadow-inner">
            {profile.initials}
          </div>
          <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-0.5 shadow-sm">
            <Icon name="shield-check" className="h-4 w-4 text-[#2ea75d]" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[17px] font-extrabold leading-tight text-white">
              {profile.fullName}
            </h3>
          </div>
          <p className="mt-1 truncate text-[12px] font-medium text-slate-300">{profile.email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.08em]">
            <span className="inline-flex items-center gap-1 rounded-full border border-[#4ade80]/30 bg-[#163f2d] px-2 py-0.5 text-[#9ae6b4]">
              <Icon name="shield-check" className="h-3 w-3 text-[#9ae6b4]" />
              {DEMO_PROFILE.tier}
            </span>
            <span className="text-slate-300">{DEMO_PROFILE.joined}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
