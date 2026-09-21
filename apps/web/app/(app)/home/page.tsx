import { redirect } from "next/navigation";
import { getSessionAccount } from "@/modules/auth";
import { FEATURED_OFFERS } from "@/modules/offers";
import { isStubOnboarding } from "@/modules/onboarding";
import { payoutProgressPercent, WALLET_SUMMARY } from "@/modules/wallet";
import { formatRebate } from "@/shared/money";
import { DealCard } from "../_components/DealCard";
import { DEMO_PROFILE } from "../_components/demoProfile";
import { BalanceCard } from "./_components/BalanceCard";
import { LiveClaimTicker } from "./_components/LiveClaimTicker";
import { PromoGrid } from "./_components/PromoGrid";
import { ScanReceiptButton } from "./_components/ScanReceiptButton";
import { WelcomeActions } from "./_components/WelcomeActions";

/**
 * The screen after onboarding: what you have, how to earn more, what is nearby.
 *
 * The shape is ARCHITECTURE.md §6 - guard, fetch, decide, hand down props. The
 * fetch is `modules/offers` and `modules/wallet`, which read from memory today
 * and from Supabase when there is something to read; the decide is
 * `payoutProgressPercent`, a pure function. Nothing on this page knows either.
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  // ONBOARDING_MODE=stub finishes onboarding without a session, so the last
  // screen's "Enter App Now" has somewhere to land instead of bouncing back.
  if (!isStubOnboarding()) {
    const account = await getSessionAccount();
    if (!account) redirect("/");
  }

  const progressPercent = payoutProgressPercent(WALLET_SUMMARY);
  const { welcome } = await searchParams;

  return (
    <div className="relative w-full flex-1 overflow-y-auto pb-24 no-scrollbar">
      {welcome === "1" && <WelcomeActions />}
      <BalanceCard progressPercent={progressPercent} />

      <ScanReceiptButton />

      <LiveClaimTicker />

      <div className="mx-3.5 mt-3 flex flex-col gap-2.5">
        {FEATURED_OFFERS.map((offer) => (
          <DealCard
            key={offer.id}
            id={offer.id}
            title={offer.title}
            brand={offer.brand}
            brandShort={offer.brandShort}
            rebateLabel={`${formatRebate(offer.rebateCents)} back`}
            rebateCents={offer.rebateCents}
            dealsLeft={offer.dealsLeft}
            dispensary={offer.dispensary}
            art={offer.art}
          />
        ))}
      </div>

      <PromoGrid referralLink={DEMO_PROFILE.referralLink} />
    </div>
  );
}
