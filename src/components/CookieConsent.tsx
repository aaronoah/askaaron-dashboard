import { useEffect, useState } from "react";
import { Cookie } from "lucide-react";
import { consent } from "@/lib/consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!consent.hasDecision()) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 md:px-6 md:pb-6 pointer-events-none">
      <div
        role="dialog"
        aria-live="polite"
        aria-label="Cookie consent"
        className="pointer-events-auto mx-auto max-w-3xl rounded-2xl border border-border-soft bg-canvas shadow-felt-lg p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-3 md:gap-5"
      >
        <div className="flex items-start gap-3 flex-1">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-felt text-ink">
            <Cookie className="size-4" strokeWidth={2} />
          </span>
          <p className="text-xs md:text-sm leading-snug md:leading-relaxed text-ink/80">
            This website uses cookies to ensure you get the best experience on our website.
            To learn more about our privacy practices review our{" "}
            <a
              href="#"
              className="underline decoration-clay/40 underline-offset-2 hover:text-ink"
            >
              Privacy Policy
            </a>
            . Please review your choices.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              consent.decline();
              setVisible(false);
            }}
            className="px-4 py-2 rounded-xl text-xs md:text-sm font-medium text-ink/70 hover:text-ink hover:bg-felt transition-colors"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => {
              consent.accept();
              setVisible(false);
            }}
            className="px-4 py-2 rounded-xl bg-clay text-canvas text-xs md:text-sm font-semibold shadow-felt hover:brightness-105 active:scale-[0.98] transition-all"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
