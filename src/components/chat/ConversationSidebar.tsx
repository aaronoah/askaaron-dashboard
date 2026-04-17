import { useEffect } from "react";
import { Plus, MessageCircle, Trash2 } from "lucide-react";
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
  useEffect(() => {
    // Prefetch fonts (TanStack Start handles head, but this is a no-op safety).
  }, []);

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
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-4">
        <h3 className="px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-clay/60 mb-4">
          Recent thoughts
        </h3>

        {conversations.length === 0 && (
          <div className="px-4 py-6 text-sm text-clay/70 italic font-serif">
            No conversations yet — begin a new dialogue.
          </div>
        )}

        <ul className="space-y-1">
          {conversations.map((c) => {
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

      <div className="p-6 border-t border-border-soft">
        <div className="flex items-center gap-3 px-2">
          <div className="size-9 rounded-xl bg-felt border border-border-soft flex items-center justify-center">
            <MessageCircle className="size-4 text-clay" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink">Studio space</p>
            <p className="text-[11px] font-medium text-clay/70 uppercase tracking-wider">
              Local sessions
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
