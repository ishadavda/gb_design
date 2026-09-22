"use client";

import { Icon } from "@/shared/ui/Icon";
import { DEMO_PROFILE } from "../../_components/demoProfile";
import { useProfile } from "../../_components/ProfileProvider";

/** Name, email and badges - the same identity the cash-out header shows, in light. */
export function ProfileIdentityCard() {
  const profile = useProfile();

  return (
    <div className="mx-3.5 mt-3 overflow-hidden rounded-[22px] border border-slate-700/60 bg-navy-hero p-4 text-white shadow-md">
      <div className="flex items-center gap-3.5">
        <div className="relative shrink-0">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-white/20 bg-gradient-to-tr from-claire to-cta-green text-xl font-extrabold text-navy shadow-md">
            {profile.initials}
          </div>
          <div className="absolute -bottom-1 -right-1 rounded-full border border-slate-700 bg-navy-hero p-0.5 shadow-sm">
            <Icon name="shield-check" className="h-4 w-4 text-cta-green" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-base font-extrabold leading-tight text-white">
              {profile.fullName}
            </h3>
          </div>
          <p className="mt-0.5 truncate text-xs font-medium text-slate-300">{profile.email}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-2.5 py-0.5 text-[9.5px] font-extrabold text-slate-200">
              <Icon name="award" className="h-3 w-3 text-cta-green" />
              {DEMO_PROFILE.tier}
            </span>
            <span className="text-[9.5px] font-semibold text-slate-400">{DEMO_PROFILE.joined}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
