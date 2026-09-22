import { Icon } from "@/shared/ui/Icon";
import { AccountFooter } from "./_components/AccountFooter";
import { DigitalPassCard } from "./_components/DigitalPassCard";
import { PersonalDetailsCard } from "./_components/PersonalDetailsCard";
import { PreferencesCard } from "./_components/PreferencesCard";
import { ProfileIdentityCard } from "./_components/ProfileIdentityCard";
import { SecurityCard } from "./_components/SecurityCard";

/**
 * My Account - identity, pass, details, payout, consents, security, exit.
 *
 * Seven cards, one component each, because each is independently a thing that
 * will later be fed by a different query. The page itself only stacks them and
 * draws the header, which is why it can stay a server component.
 */
export default function AccountPage() {
  return (
    <div className="no-scrollbar relative min-h-0 w-full flex-1 overflow-y-auto pb-24">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border-light bg-white/95 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#EAF8FF] text-[rgb(27_118_155_/_var(--tw-text-opacity,1))]">
            <Icon name="user" className="h-3.5 w-3.5" />
          </span>
          <h2 className="text-xs font-extrabold uppercase tracking-[0.16em] text-navy">My Account</h2>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-[#BFEAFD] bg-[#EAF8FF] px-2.5 py-0.5 text-[9.5px] font-extrabold uppercase text-[rgb(27_118_155_/_var(--tw-text-opacity,1))]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[rgb(27_118_155_/_var(--tw-bg-opacity,1))]" />
          <span>Active</span>
        </div>
      </div>

      <ProfileIdentityCard />
      <DigitalPassCard />
      <PersonalDetailsCard />

      <div className="mx-3.5 mt-3 rounded-2xl border border-border-light bg-white p-4">
        <div className="flex items-center justify-between border-b border-border-light pb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-border-light bg-slate-page text-[#1D7EE8]">
              <Icon name="landmark" className="h-4 w-4" />
            </span>
            <h4 className="text-xs font-extrabold text-navy">Payout</h4>
          </div>
          <span className="rounded-md border border-[#BFEAFD] bg-[#EAF8FF] px-2 py-0.5 text-[9.5px] font-extrabold uppercase text-[#1D7EE8]">
            Direct Deposit
          </span>
        </div>

        <div className="mt-2.5 flex items-center justify-between px-1 text-xs text-slate">
          <span className="text-[11px]">Payout minimum threshold:</span>
          <span className="font-bold text-navy">$10.00 (Eligible)</span>
        </div>
      </div>

      <PreferencesCard />
      <SecurityCard />
      <AccountFooter />
    </div>
  );
}
