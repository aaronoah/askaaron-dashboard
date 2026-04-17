import { useEffect, useState } from "react";
import { Plus, Trash2, Search, Share2, HandCoins, X, ExternalLink } from "lucide-react";
import type { Conversation } from "@/lib/chat-store";
import { formatRelative } from "@/lib/chat-store";
import { cn } from "@/lib/utils";
import aaronAvatar from "@/assets/aaron.jpg";

type Props = {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  open?: boolean;
  onClose?: () => void;
};

export function ConversationSidebar({ conversations, activeId, onSelect, onNew, onDelete, open = false, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    // Prefetch fonts (TanStack Start handles head, but this is a no-op safety).
  }, []);

  const trimmed = query.trim().toLowerCase();
  const isSearching = focused || trimmed.length > 0;
  const filtered = trimmed.length === 0
    ? conversations
    : conversations.filter((c) => {
        if (c.title.toLowerCase().includes(trimmed)) return true;
        return c.messages.some((m) => m.content.toLowerCase().includes(trimmed));
      });

  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={onClose}
        className={cn(
          "md:hidden fixed inset-0 z-30 bg-ink/40 backdrop-blur-sm transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        aria-hidden={!open}
      />
      <aside
        className={cn(
          "flex w-80 shrink-0 flex-col border-r border-border-soft bg-felt/95 md:bg-felt/60 backdrop-blur-sm",
          // mobile: slide-in drawer
          "fixed inset-y-0 left-0 z-40 transition-transform duration-300 md:static md:translate-x-0 md:transition-none",
          open ? "translate-x-0 shadow-felt-lg" : "-translate-x-full",
        )}
      >
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-3 mb-5">
          <div className="size-10 rounded-2xl overflow-hidden shadow-felt ring-1 ring-border-soft shrink-0">
            <img
              src={aaronAvatar}
              alt="Aaron portrait at the Hollywood sign"
              className="size-full object-cover"
            />
          </div>
          <div className="flex flex-col leading-tight flex-1 min-w-0">
            <span className="font-serif italic text-2xl tracking-tight text-ink">Aaron.skill</span>
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-clay/70">
              Distilled Aaron At Your Service
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="md:hidden size-9 rounded-xl border border-border-soft bg-canvas flex items-center justify-center text-clay hover:bg-felt transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <button
          onClick={onNew}
          className="group w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-canvas border border-border-soft shadow-felt transition-all hover:-translate-y-px hover:shadow-felt-lg"
        >
          <span className="text-sm font-medium text-ink">New dialogue</span>
          <Plus className="size-4 text-clay transition-transform group-hover:rotate-90" />
        </button>

        <div
          className={cn(
            "mt-3 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-canvas/70 border transition-all",
            focused
              ? "border-clay/60 shadow-felt ring-2 ring-clay/20"
              : "border-border-soft hover:border-border-soft/80",
          )}
        >
          <Search className={cn("size-4 shrink-0 transition-colors", focused ? "text-clay" : "text-clay/60")} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search conversations…"
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-clay/50 focus:outline-none"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <h3 className="px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-clay/60 mb-2">
          {trimmed.length > 0 ? "Search results" : "Recent chats"}
        </h3>

        {!isSearching && conversations.length === 0 && (
          <div className="px-4 py-6 text-sm text-clay/70 italic font-serif">
            No conversations yet — begin a new dialogue.
          </div>
        )}

        {isSearching && trimmed.length === 0 && (
          <div className="px-4 py-6 text-sm text-clay/70 italic font-serif">
            Type to search your past dialogues…
          </div>
        )}

        {isSearching && trimmed.length > 0 && filtered.length === 0 && (
          <div className="px-4 py-6 text-sm text-clay/70 italic font-serif">
            No matches for “{query}”.
          </div>
        )}

        <ul className="space-y-1">
          {(isSearching && trimmed.length === 0 ? [] : filtered).map((c) => {
            const active = c.id === activeId;
            return (
              <li key={c.id}>
                <button
                  onClick={() => onSelect(c.id)}
                  className={cn(
                    "group w-full text-left flex items-center gap-3 px-4 py-3 rounded-2xl transition-all border",
                    active
                      ? "bg-canvas border-border-soft shadow-felt"
                      : "border-transparent hover:bg-canvas/70 hover:border-border-soft/60",
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full shrink-0",
                      active ? "bg-moss" : "bg-transparent group-hover:bg-clay/30",
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium truncate",
                        active ? "text-ink" : "text-ink/70 group-hover:text-ink",
                      )}
                    >
                      {c.title}
                    </p>
                    <p className="text-[12px] text-clay/70">{formatRelative(c.updatedAt)}</p>
                  </div>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(c.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete(c.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-felt cursor-pointer"
                    aria-label="Delete conversation"
                  >
                    <Trash2 className="size-3.5 text-clay" />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-5 py-3 border-t border-border-soft">
        <div className="flex items-center justify-center gap-3">
          <div className="relative group/share">
            <button
              type="button"
              aria-label="Share on social media"
              onClick={() => {
                const url = typeof window !== "undefined" ? window.location.href : "";
                if (typeof navigator !== "undefined" && navigator.share) {
                  navigator.share({ title: "Arlow", url }).catch(() => {});
                } else if (typeof navigator !== "undefined" && navigator.clipboard) {
                  navigator.clipboard.writeText(url).catch(() => {});
                }
              }}
              className="size-11 rounded-2xl bg-canvas border border-border-soft shadow-felt flex items-center justify-center transition-all hover:-translate-y-px hover:shadow-felt-lg"
            >
              <Share2 className="size-4 text-clay" />
            </button>

            {/* Tooltip */}
            <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 rounded-md bg-ink text-canvas text-[11px] font-medium whitespace-nowrap opacity-0 group-hover/share:opacity-100 transition-opacity duration-150 z-10">
              Share on social media
            </div>

            <div
              className="absolute left-1/2 bottom-full mb-3 -translate-x-1/2 opacity-0 invisible translate-y-1 group-hover/share:opacity-100 group-hover/share:visible group-hover/share:translate-y-0 transition-all duration-200 z-20"
              role="menu"
            >
              <div className="relative bg-canvas border border-border-soft rounded-2xl shadow-felt-lg p-2 flex items-center gap-1 min-w-[180px]">
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}&text=${encodeURIComponent("Arlow — a quiet AI companion")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex flex-col items-center gap-1 px-3 py-2 rounded-xl hover:bg-felt transition-colors"
                >
                  <div className="size-8 rounded-lg bg-ink flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="size-4 fill-canvas" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-medium text-ink">X</span>
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex flex-col items-center gap-1 px-3 py-2 rounded-xl hover:bg-felt transition-colors"
                >
                  <div className="size-8 rounded-lg bg-[#0A66C2] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="size-4 fill-canvas" aria-hidden="true">
                      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27zM5.34 7.43a2.07 2.07 0 110-4.13 2.07 2.07 0 010 4.13zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-medium text-ink">LinkedIn</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    const url = typeof window !== "undefined" ? window.location.href : "";
                    if (typeof navigator !== "undefined" && navigator.share) {
                      navigator.share({ title: "Arlow", url }).catch(() => {});
                    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
                      navigator.clipboard.writeText(url).catch(() => {});
                    }
                  }}
                  className="flex-1 flex flex-col items-center gap-1 px-3 py-2 rounded-xl hover:bg-felt transition-colors"
                >
                  <div className="size-8 rounded-lg bg-clay flex items-center justify-center">
                    <ExternalLink className="size-4 text-canvas" strokeWidth={2.5} />
                  </div>
                  <span className="text-[11px] font-medium text-ink">More</span>
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 top-full">
                  <div className="size-3 rotate-45 bg-canvas border-r border-b border-border-soft -translate-y-1/2" />
                </div>
              </div>
            </div>
          </div>

          <div className="relative group/donate">
            <button
              type="button"
              aria-label="Donate to Aaron"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.open("https://www.paypal.me/aaron", "_blank", "noopener,noreferrer");
                }
              }}
              className="size-11 rounded-2xl bg-canvas border border-border-soft shadow-felt flex items-center justify-center transition-all hover:-translate-y-px hover:shadow-felt-lg"
            >
              <HandCoins className="size-4 text-moss" />
            </button>

            {/* Tooltip */}
            <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 rounded-md bg-ink text-canvas text-[11px] font-medium whitespace-nowrap opacity-0 group-hover/donate:opacity-100 transition-opacity duration-150 z-10">
              Donate to Aaron
            </div>

            <div
              className="absolute left-1/2 bottom-full mb-3 -translate-x-1/2 opacity-0 invisible translate-y-1 group-hover/donate:opacity-100 group-hover/donate:visible group-hover/donate:translate-y-0 transition-all duration-200 z-20"
              role="menu"
            >
              <div className="relative bg-canvas border border-border-soft rounded-2xl shadow-felt-lg p-2 flex items-center gap-1 min-w-[180px]">
                <a
                  href="https://venmo.com/aaron"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex flex-col items-center gap-1 px-3 py-2 rounded-xl hover:bg-felt transition-colors"
                >
                  <div className="size-8 rounded-lg bg-[#3D95CE] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="size-4 fill-canvas" aria-hidden="true">
                      <path d="M19.5 3c.74 1.22 1.07 2.48 1.07 4.07 0 5.06-4.32 11.63-7.83 16.24H4.78L1.5 4.49l7.16-.68 1.74 13.96c1.62-2.64 3.62-6.79 3.62-9.62 0-1.55-.27-2.6-.69-3.47z" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-medium text-ink">Venmo</span>
                </a>
                <a
                  href="https://www.paypal.me/aaron"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex flex-col items-center gap-1 px-3 py-2 rounded-xl hover:bg-felt transition-colors"
                >
                  <div className="size-8 rounded-lg bg-[#003087] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="size-4 fill-canvas" aria-hidden="true">
                      <path d="M7.27 21.5H4.5a.5.5 0 01-.5-.58L6.6 4.42A.6.6 0 017.2 4h6.42c2.95 0 4.93 1.55 4.4 4.79-.6 3.66-3.36 5.24-6.55 5.24H9.05a.6.6 0 00-.6.5l-.58 4.16a.5.5 0 01-.6.41zm9.94-13.34c.4 2.5-1.43 4.4-4.04 4.4h-1.92a.5.5 0 00-.5.42l-.78 5.55a.5.5 0 01-.5.43h-.04c.94.5 2.13.7 3.5.7 3.18 0 5.94-1.58 6.54-5.24.42-2.55-.62-4.13-2.26-5.06-.04-.4-.13-.8-.26-1.2z" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-medium text-ink">PayPal</span>
                </a>
                <div className="absolute left-1/2 -translate-x-1/2 top-full">
                  <div className="size-3 rotate-45 bg-canvas border-r border-b border-border-soft -translate-y-1/2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </aside>
    </>
  );
}
