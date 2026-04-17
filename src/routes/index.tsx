import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { chatStore, type Conversation } from "@/lib/chat-store";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { CookieConsent } from "@/components/CookieConsent";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ask Aaron" },
      {
        name: "description",
        content:
          "Chat with a distilled version of Aaron — a conversational portfolio for slower, more thoughtful exchanges.",
      },
      { property: "og:title", content: "Ask Aaron" },
      {
        property: "og:description",
        content:
          "Chat with a distilled version of Aaron — a conversational portfolio for slower, more thoughtful exchanges.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&display=swap",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    const list = chatStore.list();
    setConversations(list);
    setActiveId(list.length > 0 ? list[0].id : null);
  }, []);

  // Re-read store on every change tick.
  useEffect(() => {
    if (tick === 0) return;
    setConversations(chatStore.list());
  }, [tick]);

  const active = activeId ? conversations.find((c) => c.id === activeId) ?? null : null;

  function handleNew() {
    const fresh = chatStore.create();
    setConversations(chatStore.list());
    setActiveId(fresh.id);
    setSidebarOpen(false);
  }

  function handleSelect(id: string) {
    setActiveId(id);
    setSidebarOpen(false);
  }

  function handleDelete(id: string) {
    chatStore.remove(id);
    const list = chatStore.list();
    setConversations(list);
    if (activeId === id) {
      setActiveId(list.length > 0 ? list[0].id : null);
    }
  }

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-canvas text-ink">
      <ConversationSidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelect}
        onNew={handleNew}
        onDelete={handleDelete}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
        className="md:hidden fixed top-4 left-4 z-20 size-10 rounded-2xl bg-canvas border border-border-soft shadow-felt flex items-center justify-center text-ink hover:bg-felt transition-colors"
      >
        <Menu className="size-5" />
      </button>

      {active ? (
        <ChatPanel conversation={active} onChange={() => setTick((t) => t + 1)} />
      ) : (
        <main className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
          <p className="font-serif italic text-2xl md:text-3xl text-ink">No conversations yet</p>
          <p className="text-sm text-clay max-w-sm">
            Start a new dialogue to chat with a distilled version of Aaron.
          </p>
          <button
            onClick={handleNew}
            className="mt-2 px-5 py-2.5 rounded-2xl bg-clay text-canvas text-sm font-semibold shadow-felt hover:brightness-105 active:scale-[0.98] transition-all"
          >
            New dialogue
          </button>
        </main>
      )}

      <CookieConsent />
    </div>
  );
}
