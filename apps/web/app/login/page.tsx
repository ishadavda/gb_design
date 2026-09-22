"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import { Wordmark } from "@/shared/ui/Wordmark";
import { SmsAlertBanner } from "../(auth)/onboarding/_components/SmsAlertBanner";

const RESEND_SECONDS = 33;

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function LoginPage() {
  const [phone, setPhone] = useState("(312) 555-0192");
  const [otp, setOtp] = useState("4821");
  const [otpRequested, setOtpRequested] = useState(false);
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [alertKey, setAlertKey] = useState(0);

  useEffect(() => {
    if (!otpRequested || secondsLeft <= 0) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [otpRequested, secondsLeft]);

  function requestCode() {
    if (phone.replace(/\D/g, "").length !== 10) {
      setError("Please enter a valid 10-digit mobile number!");
      return;
    }

    setError("");
    setOtpRequested(true);
    setSecondsLeft(RESEND_SECONDS);
    setAlertKey((current) => current + 1);
  }

  function resendCode() {
    if (secondsLeft > 0) return;

    setSecondsLeft(RESEND_SECONDS);
    setAlertKey((current) => current + 1);
  }

  function verifyCode() {
    if (otp.trim().length !== 4) {
      setError("Please enter the 4-digit passcode.");
      return;
    }

    window.location.href = "/home";
  }

  return (
    <main className="mobile-frame relative flex min-h-screen w-full flex-col overflow-hidden bg-slate-page text-navy md:h-[900px] md:max-h-[900px] md:min-h-[900px]">
      {otpRequested && <SmsAlertBanner key={alertKey} passcode={otp} />}

      <div className="flex h-full flex-col justify-between overflow-y-auto px-5 pb-6 pt-2">
        <div className="flex w-full flex-col items-center text-center">
          <Link href="/onboarding" className="inline-block transition hover:opacity-90">
            <Wordmark className="mb-0 w-48" />
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md py-3">
          <div className="space-y-5">
            <div className="px-2 text-center">
              <Icon name="smartphone" className="mx-auto mb-2.5 h-11 w-11 text-claire" />
              <h1 className="text-sm font-extrabold uppercase tracking-wide text-navy md:text-base">
                Sign In
              </h1>
              <p className="mt-1.5 text-xs leading-relaxed text-slate md:text-sm">
                Enter your registered mobile number to receive your secure login passcode.
              </p>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label
                  htmlFor="login-phone"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate"
                >
                  Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-sm font-bold text-slate">
                    +1
                  </span>
                  <input
                    id="login-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    value={phone}
                    onChange={(event) => setPhone(formatPhone(event.target.value))}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") requestCode();
                    }}
                    className="w-full rounded-2xl border border-border-light bg-white px-4 py-3.5 pl-10 text-sm font-semibold text-navy shadow-sm transition focus:border-cta-green focus:outline-none md:text-base"
                  />
                </div>
              </div>

              {otpRequested && (
                <div className="space-y-2">
                  <label
                    htmlFor="login-otp"
                    className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate"
                  >
                    <span>4-Digit Passcode</span>
                    <span className="text-[10px]">Mock OTP Code Sent</span>
                  </label>
                  <input
                    id="login-otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={4}
                    value={otp}
                    onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 4))}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") verifyCode();
                    }}
                    className="w-full rounded-2xl border border-border-light bg-white px-4 py-3.5 text-center text-base font-extrabold tracking-widest text-claire shadow-sm focus:border-cta-green focus:outline-none"
                  />
                  <div className="flex items-center justify-between pt-1 text-xs text-slate">
                    <span>Didn&apos;t receive code?</span>
                    <button
                      type="button"
                      onClick={resendCode}
                      disabled={secondsLeft > 0}
                      className={`flex items-center gap-1.5 transition focus:outline-none ${
                        secondsLeft > 0
                          ? "cursor-not-allowed font-bold text-slate"
                          : "cursor-pointer font-extrabold text-claire hover:underline"
                      }`}
                    >
                      <Icon name="rotate-cw" className="h-3.5 w-3.5" />
                      <span>
                        {secondsLeft > 0
                          ? `Resend in 0:${String(secondsLeft).padStart(2, "0")}`
                          : "Resend Passcode"}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <p className={`min-h-4 text-center text-[11px] font-bold text-red-500 ${error ? "" : "invisible"}`}>
              {error || "No error"}
            </p>

            <div className="mt-5 w-full">
              <Button type="button" onClick={otpRequested ? verifyCode : requestCode}>
                {otpRequested ? "Verify Passcode & Sign In" : "Send Verification Code"}
              </Button>
            </div>

            <p className="pt-2 text-center text-xs font-semibold text-slate">
              Don&apos;t have an account?
              <Link href="/onboarding" className="ml-1 font-extrabold text-teal underline hover:text-navy">
                Sign-up
              </Link>
            </p>
          </div>
        </div>

        <div className="h-4" />
      </div>
    </main>
  );
}
