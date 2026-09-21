"use client";

import { BottomSheet } from "@/shared/ui/BottomSheet";
import { Icon } from "@/shared/ui/Icon";
import { useToast } from "@/shared/ui/Toast";
import { useProfile } from "../../_components/ProfileProvider";

/**
 * Update Profile Details.
 *
 * Writes to `ProfileProvider` and nowhere else - the account row, the cash-out
 * header and the home greeting all read from there, so all three change at once,
 * which is what the prototype did by hand across nine elements.
 *
 * Required fields are the browser's job; the prototype's "fill in all fields"
 * toast is what `required` gives for free.
 */
export function EditProfileSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const profile = useProfile();
  const showToast = useToast();

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      panelClassName="max-h-[88%] overflow-y-auto no-scrollbar rounded-t-[28px] border-t border-slate-700/70 bg-[#101626] p-5 text-white"
    >
      <div className="mb-3 flex items-center justify-between border-b border-slate-700/50 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-md border border-teal/40 bg-teal/20 text-teal">
            <Icon name="user" className="h-3.5 w-3.5" />
          </span>
          <h3 className="text-base font-extrabold text-white">Update Profile Details</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-slate-800 text-slate-400 transition hover:bg-slate-700 hover:text-white"
        >
          <Icon name="x" className="size-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>

      <form
        className="space-y-3.5 text-left"
        onSubmit={(event) => {
          event.preventDefault();

          const data = new FormData(event.currentTarget);

          profile.updateProfile({
            firstName: String(data.get("firstName") ?? "").trim(),
            lastName: String(data.get("lastName") ?? "").trim(),
            phone: String(data.get("phone") ?? "").trim(),
            email: String(data.get("email") ?? "").trim(),
            dob: String(data.get("dob") ?? ""),
            zip: String(data.get("zip") ?? "").trim(),
          });

          onClose();
          showToast("🎉 Profile details updated successfully!", "success");
        }}
      >
        <div className="grid grid-cols-2 gap-2.5">
          <Field label="First Name" name="firstName" defaultValue={profile.firstName} />
          <Field label="Last Name" name="lastName" defaultValue={profile.lastName} />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="edit-phone"
            className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-300"
          >
            Mobile Phone Number
          </label>
          <div className="relative">
            <input
              id="edit-phone"
              name="phone"
              type="tel"
              required
              defaultValue={profile.phone}
              className="w-full rounded-xl border border-slate-700 bg-[#0B1120] py-2.5 pl-9 pr-3.5 text-xs font-semibold text-white transition focus:border-cta-green focus:outline-none"
            />
            <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">+1</span>
          </div>
        </div>

        <Field label="Email Address" name="email" type="email" defaultValue={profile.email} />

        <div className="grid grid-cols-2 gap-2.5">
          <Field label="Date of Birth" name="dob" type="date" defaultValue={profile.dob} />
          <Field
            label="Zip Code"
            name="zip"
            defaultValue={profile.zip}
            maxLength={5}
            inputMode="numeric"
          />
        </div>

        <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2.5 text-[10.5px] leading-snug text-slate-300">
          <Icon name="shield-check" className="h-4 w-4 shrink-0 text-cta-green" />
          <span>Changes are cryptographically synced with your CPG clearinghouse profile.</span>
        </div>

        <div className="flex gap-2 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-xl bg-slate-800 py-3 text-xs font-extrabold uppercase tracking-wider text-slate-300 transition hover:bg-slate-700"
          >
            CANCEL
          </button>
          <button type="submit" className="btn-3d flex-1 py-3 text-xs tracking-wide">
            <span className="relative z-10 font-extrabold uppercase">SAVE CHANGES</span>
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  ...rest
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = `edit-${name}`;

  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-300"
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-slate-700 bg-[#0B1120] px-3.5 py-2.5 text-xs font-semibold text-white transition focus:border-cta-green focus:outline-none"
        {...rest}
      />
    </div>
  );
}
