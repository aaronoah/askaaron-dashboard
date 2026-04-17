import { useEffect, useState } from "react";
import { Plus, Trash2, Search, Share2, HandCoins } from "lucide-react";
import type { Conversation } from "@/lib/chat-store";
import { formatRelative } from "@/lib/chat-store";
import { cn } from "@/lib/utils";

type Props = {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
};

export function ConversationSidebar({ conversations, activeId, onSelect, onNew, onDelete }: Props) {
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
    <aside className="hidden md:flex w-80 shrink-0 flex-col border-r border-border-soft bg-felt/60 backdrop-blur-sm">
      <div className="p-7 pb-4">
        <div className="flex items-center gap-3 mb-9">
          <div className="size-10 rounded-2xl bg-clay flex items-center justify-center text-canvas font-serif italic text-xl shadow-felt">
            A
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-serif italic text-2xl tracking-tight text-ink">Arlow</span>
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-clay/70">
              Quiet Intelligence
            </span>
          </div>
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

      <nav className="flex-1 overflow-y-auto px-4 py-4">
        <h3 className="px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-clay/60 mb-4">
          {trimmed.length > 0 ? "Search results" : "Recent thoughts"}
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

      <div className="p-5 border-t border-border-soft space-y-2">
        <div className="relative group/share">
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
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-canvas border border-border-soft shadow-felt transition-all hover:-translate-y-px hover:shadow-felt-lg"
          >
            <div className="size-9 rounded-xl bg-felt border border-border-soft flex items-center justify-center">
              <Share2 className="size-4 text-clay" />
            </div>
            <span className="flex-1 text-left text-sm font-medium text-ink">Share on social media</span>
          </button>

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
              <button
                type="button"
                onClick={() => {
                  const url = typeof window !== "undefined" ? window.location.href : "";
                  if (typeof navigator !== "undefined" && navigator.clipboard) {
                    navigator.clipboard.writeText(url).catch(() => {});
                  }
                }}
                className="flex-1 flex flex-col items-center gap-1 px-3 py-2 rounded-xl hover:bg-felt transition-colors"
              >
                <div className="size-8 rounded-lg bg-moss flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="size-4 fill-canvas" aria-hidden="true">
                    <path d="M8.69 4C4.66 4 1.5 6.78 1.5 10.2c0 1.94 1.04 3.66 2.68 4.82l-.67 2.02 2.36-1.18c.84.23 1.7.36 2.6.39-.07-.36-.11-.73-.11-1.11 0-3.18 3.05-5.74 6.81-5.74.25 0 .5.01.74.04C15.34 6.4 12.3 4 8.69 4zm-2.5 3.4a.85.85 0 110 1.7.85.85 0 010-1.7zm5 0a.85.85 0 110 1.7.85.85 0 010-1.7zm9.92 3.43c-3.4 0-6.16 2.32-6.16 5.18 0 1.62.89 3.06 2.27 4.03l-.57 1.7 1.99-1.04c.7.18 1.43.29 2.18.29.13 0 .26 0 .39-.01-.05-.27-.08-.55-.08-.83 0-2.55 2.45-4.62 5.47-4.62.13 0 .26 0 .39.01-.4-2.62-2.95-4.71-5.88-4.71zm-2.07 2.83a.71.71 0 110 1.42.71.71 0 010-1.42zm4.14 0a.71.71 0 110 1.42.71.71 0 010-1.42z" />
                  </svg>
                </div>
                <span className="text-[11px] font-medium text-ink">WeChat</span>
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 top-full">
                <div className="size-3 rotate-45 bg-canvas border-r border-b border-border-soft -translate-y-1/2" />
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.open("https://www.paypal.me/aaron", "_blank", "noopener,noreferrer");
            }
          }}
          className="group w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-canvas border border-border-soft shadow-felt transition-all hover:-translate-y-px hover:shadow-felt-lg"
        >
          <div className="size-9 rounded-xl bg-moss/15 border border-moss/30 flex items-center justify-center">
            <HandCoins className="size-4 text-moss" />
          </div>
          <span className="flex-1 text-left text-sm font-medium text-ink">Donate to Aaron</span>
        </button>
      </div>
    </aside>
  );
}
