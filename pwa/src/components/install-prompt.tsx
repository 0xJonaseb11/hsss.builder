"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    const ios =
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !(window.navigator as { standalone?: boolean }).standalone;
    setIsIos(ios);
    setStandalone(window.matchMedia("(display-mode: standalone)").matches);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (standalone || dismissed) return null;

  if (isIos) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
        <p className="font-medium text-navy">Install this app</p>
        <p className="mt-1">
          Tap Share, then Add to Home Screen to install HSSS on your device.
        </p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="mt-3 text-sm font-medium text-navy hover:text-cyan"
        >
          Dismiss
        </button>
      </div>
    );
  }

  if (!deferred) return null;

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setDismissed(true);
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-700">
        Install HSSS on your home screen for quick access on site.
      </p>
      <div className="flex gap-2">
        <Button type="button" onClick={install}>
          Install
        </Button>
        <Button type="button" variant="secondary" onClick={() => setDismissed(true)}>
          Not now
        </Button>
      </div>
    </div>
  );
}
