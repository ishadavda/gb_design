"use client";

import { usePwaInstall } from "@/shared/hooks/usePwaInstall";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";

/** "Add to home screen". Disabled where the browser offers no install prompt. */
export function InstallAppButton() {
  const { canInstall, installed, promptInstall } = usePwaInstall();

  return (
    <Button
      type="button"
      className="py-3.5"
      onClick={() => void promptInstall()}
      disabled={installed || !canInstall}
    >
      <Icon name="download" className="h-4 w-4 text-navy" />
      <span className="font-extrabold uppercase">
        {installed ? "App Installed" : "Install Greenback App"}
      </span>
    </Button>
  );
}
