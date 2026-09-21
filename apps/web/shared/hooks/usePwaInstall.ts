"use client";

import { useEffect, useState } from "react";

/**
 * The browser's install prompt, which can only be raised from a user gesture and
 * only after the browser has fired `beforeinstallprompt`.
 *
 * A device API, so it lives here rather than in modules/ - it fetches nothing and
 * knows nothing about the domain. Safari never fires the event, so `canInstall`
 * stays false there and callers should fall back to the manual instructions.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    if (window.matchMedia("(display-mode: standalone)").matches) setInstalled(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function promptInstall(): Promise<void> {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") setInstalled(true);
    setDeferredPrompt(null);
  }

  return { canInstall: deferredPrompt !== null, installed, promptInstall };
}
