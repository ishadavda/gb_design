"use client";

import { useState } from "react";
import { Icon } from "@/shared/ui/Icon";
import { DEMO_PROFILE } from "../../_components/demoProfile";
import { useProfile } from "../../_components/ProfileProvider";
import { EditProfileSheet } from "./EditProfileSheet";

/** The compliance details, and the button that opens the sheet which edits them. */
export function PersonalDetailsCard() {
  const profile = useProfile();
  const [editing, setEditing] = useState(false);

  return (
    <div className="mx-3.5 mt-3 rounded-2xl border border-border-light bg-white p-4">
      <div className="flex items-center justify-between border-b border-border-light pb-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-border-light bg-slate-page text-claire">
            <Icon name="user-check" className="h-4 w-4" />
          </span>
          <h4 className="text-xs font-extrabold text-navy">Personal Details</h4>
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex cursor-pointer items-center gap-1 text-[11px] font-bold text-teal hover:underline"
        >
          <Icon name="edit-3" className="h-3 w-3" />
          <span>Edit Details</span>
        </button>
      </div>

      <div className="mt-3 space-y-2.5 text-xs">
        <DetailRow label="First Name" value={profile.firstName} />
        <DetailRow label="Last Name" value={profile.lastName} />

        <DetailRow
          label="Phone"
          value={profile.phoneDisplay}
          badge={
            <span className="flex items-center gap-0.5 rounded bg-cta-green/10 px-1.5 py-0.5 text-[9px] font-extrabold text-claire">
              <Icon name="check" className="h-2.5 w-2.5" /> OTP
            </span>
          }
        />

        <DetailRow
          label="Email"
          value={profile.email}
          badge={
            <span className="rounded bg-cta-green/10 px-1.5 py-0.5 text-[9px] font-extrabold text-claire">
              Verified
            </span>
          }
        />

        <DetailRow
          label="Date of Birth"
          value={profile.dobDisplay}
          badge={
            <span className="rounded bg-teal-tint px-1.5 py-0.5 text-[9px] font-extrabold text-teal">
              21+ Gate
            </span>
          }
        />

        <DetailRow
          label="Primary Zip Code"
          value={`${profile.zip} (${DEMO_PROFILE.city})`}
          last
          badge={
            <span className="rounded bg-teal-tint px-1.5 py-0.5 text-[9px] font-extrabold text-teal">
              GPX Active
            </span>
          }
        />
      </div>

      <EditProfileSheet open={editing} onClose={() => setEditing(false)} />
    </div>
  );
}

function DetailRow({
  label,
  value,
  badge,
  last = false,
}: {
  label: string;
  value: string;
  badge?: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-1 ${last ? "" : "border-b border-border-light/60"}`}
    >
      <span className="text-[11px] font-medium text-slate">{label}</span>
      {badge ? (
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-navy">{value}</span>
          {badge}
        </div>
      ) : (
        <span className="font-bold text-navy">{value}</span>
      )}
    </div>
  );
}
