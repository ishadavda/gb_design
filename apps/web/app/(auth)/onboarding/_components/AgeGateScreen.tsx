"use client";

import { useState } from "react";
import { Icon } from "@/shared/ui/Icon";
import { AgeGateForm } from "./AgeGateForm";
import { SetupShell } from "./SetupShell";
import { SplashScreen } from "./SplashScreen";

/**
 * Splash and age gate are one route, exactly as in the approved screens: "Get
 * Started" swaps the view rather than navigating, so there is no page transition
 * between the pitch and the first question.
 *
 * `resumed` is true when someone walked back here from the phone step - they
 * have seen the pitch already, so go straight to the form.
 */
export function AgeGateScreen({ resumed = false }: { resumed?: boolean }) {
  const [started, setStarted] = useState(resumed);

  if (!started) return <SplashScreen onStart={() => setStarted(true)} />;

  return (
    <SetupShell step={1} totalSteps={6}>
      <div className="w-full space-y-6">
        <div className="px-2 text-center">
          <Icon name="shield-alert" className="mx-auto mb-2.5 h-11 w-11 animate-bounce text-claire" />
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-navy md:text-base">
            Age Gate Compliance
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-slate md:text-sm">
            You must be 21 or older to join the CPG rewards network. Please select your birth date.
          </p>
        </div>

        <AgeGateForm />
      </div>
    </SetupShell>
  );
}
