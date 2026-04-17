import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { chatStore, type Conversation } from "@/lib/chat-store";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { ChatPanel } from "@/components/chat/ChatPanel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Arlow — A quiet AI companion" },
      {
        name: "description",
        content:
          "Arlow is a humanist AI chat dashboard for slower, more thoughtful conversations. Save dialogues, attach documents, and think in writing.",
      },
      { property: "og:title", content: "Arlow — A quiet AI companion" },
      {
        property: "og:description",
        content:
          "A humanist AI chat dashboard with sidebar history and document attachments. Designed for slower thinking.",
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

  // Hydrate from localStorage on mount, ensure at least one conversation exists.
  useEffect(() => {
    let list = chatStore.list();
    if (list.length === 0) {
      const fresh = chatStore.create();
      list = [fresh];
    }
    setConversations(list);
    setActiveId(list[0].id);
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
    let list = chatStore.list();
    if (list.length === 0) {
      const fresh = chatStore.create();
      list = [fresh];
    }
    setConversations(list);
    if (activeId === id) setActiveId(list[0].id);
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
        <main className="flex-1 flex items-center justify-center text-clay">Loading…</main>
      )}
    </div>
  );
}
