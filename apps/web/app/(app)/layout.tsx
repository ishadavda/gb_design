import Image from "next/image";
import { WALLET_SUMMARY } from "@/modules/wallet";
import { ToastProvider } from "@/shared/ui/Toast";
import { BottomNav } from "./_components/BottomNav";
import { DEMO_PROFILE } from "./_components/demoProfile";
import { ProfileProvider } from "./_components/ProfileProvider";
import { ReceiptScannerProvider } from "./_components/ReceiptScannerProvider";
import { WalletProvider } from "./_components/WalletProvider";
import { NotificationCenter } from "./_components/NotificationCenter";

/**
 * The chrome every main screen sits in: the phone frame, the logo header and the
 * bottom navigation.
 *
 * The prototype was one HTML file that showed and hid five `<div id="view-...">`
 * blocks. Here each of those is a route, so the browser's back button, a shared
 * link and a refresh all work - and the parts that did not change between views
 * live here instead of being repeated five times.
 *
 * `overflow-hidden` on the frame with `overflow-y-auto` on each screen is what
 * keeps the header and nav still while the content scrolls under them, exactly
 * as the approved screens behave.
 *
 * The three providers are the prototype's three globals - the balance, the
 * profile, the receipt sheet - each of which outlived a view change there and
 * has to outlive a navigation here.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <WalletProvider
        availableCents={WALLET_SUMMARY.availableCents}
        pendingCents={WALLET_SUMMARY.pendingCents}
        lifetimeCents={WALLET_SUMMARY.lifetimeCents}
        goalCents={WALLET_SUMMARY.goalCents}
      >
        <ProfileProvider
          initial={{
            firstName: DEMO_PROFILE.firstName,
            lastName: DEMO_PROFILE.lastName,
            phone: DEMO_PROFILE.phone,
            email: DEMO_PROFILE.email,
            dob: DEMO_PROFILE.dob,
            zip: DEMO_PROFILE.zip,
          }}
        >
          <main className="mobile-frame relative flex min-h-screen w-full flex-col overflow-hidden bg-slate-page md:h-[900px] md:max-h-[900px] md:min-h-[900px]">
            <ReceiptScannerProvider>
              <header className="relative z-20 flex w-full shrink-0 items-center justify-between border-b border-border-light bg-white px-4 py-2">
                <div className="w-8" />
                <Image
                  src="/brand/greenback-logo.jpg"
                  alt="Greenback Cash"
                  width={386}
                  height={143}
                  priority
                  className="h-9 w-auto object-contain md:h-[4.25rem]"
                />
                <NotificationCenter />
              </header>

              {children}

              <BottomNav />
            </ReceiptScannerProvider>
          </main>
        </ProfileProvider>
      </WalletProvider>
    </ToastProvider>
  );
}
