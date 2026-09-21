"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

/**
 * The profile the screens print, and the edits made to it while the app is open.
 *
 * Three screens show the same name, initials and email - home greets with the
 * first name, account lists every field, cash-out puts it in the header - and
 * the edit sheet changes all of them at once. The prototype did that by rewriting
 * nine elements by id; here they all read this.
 *
 * Nothing is persisted. When `modules/accounts` can answer, the seed comes from
 * the session and the save becomes a Server Action.
 */

export interface EditableProfile {
  firstName: string;
  lastName: string;
  /** National digits as typed: "(312) 555-0192". The +1 is decoration. */
  phone: string;
  email: string;
  /** ISO yyyy-mm-dd. */
  dob: string;
  zip: string;
}

interface ProfileState extends EditableProfile {
  fullName: string;
  initials: string;
  /** "+1 (312) 555-0192" - how the account screen prints it. */
  phoneDisplay: string;
  /** "June 15, 1998" - how the account screen prints the date of birth. */
  dobDisplay: string;
  updateProfile: (next: EditableProfile) => void;
}

const ProfileContext = createContext<ProfileState | null>(null);

export function ProfileProvider({
  initial,
  children,
}: {
  initial: EditableProfile;
  children: ReactNode;
}) {
  const [profile, setProfile] = useState<EditableProfile>(initial);

  const updateProfile = useCallback((next: EditableProfile) => setProfile(next), []);

  const value = useMemo<ProfileState>(
    () => ({
      ...profile,
      fullName: `${profile.firstName} ${profile.lastName}`,
      initials: `${profile.firstName[0] ?? ""}${profile.lastName[0] ?? ""}`.toUpperCase(),
      phoneDisplay: profile.phone.startsWith("+1") ? profile.phone : `+1 ${profile.phone}`,
      dobDisplay: formatDob(profile.dob),
      updateProfile,
    }),
    [profile, updateProfile],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileState {
  const profile = useContext(ProfileContext);

  if (!profile) throw new Error("useProfile must be used inside <ProfileProvider>");

  return profile;
}

/**
 * "1998-06-15" -> "June 15, 1998".
 *
 * Built from the parts rather than `new Date("1998-06-15")`, which parses as UTC
 * midnight and prints the day before in any timezone west of Greenwich.
 */
function formatDob(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);

  if (!year || !month || !day) return iso;

  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
