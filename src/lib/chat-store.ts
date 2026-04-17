// Local persistence for conversations + messages. Easy to swap for a backend later.

export type Attachment = {
  id: string;
  name: string;
  size: number;
  type: string;
  // Small text/preview only — we don't persist binary file bytes here.
  textPreview?: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  attachments?: Attachment[];
  /** Set on assistant messages when generation failed. */
  error?: string;
};

export type Conversation = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
};

const KEY = "arlow.conversations.v1";

function read(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Conversation[];
  } catch {
    return [];
  }
}

function write(list: Conversation[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
}

export const chatStore = {
  list(): Conversation[] {
    return read().sort((a, b) => b.updatedAt - a.updatedAt);
  },
  get(id: string): Conversation | undefined {
    return read().find((c) => c.id === id);
  },
  create(): Conversation {
    const now = Date.now();
    const conv: Conversation = {
      id: crypto.randomUUID(),
      title: "New dialogue",
      createdAt: now,
      updatedAt: now,
      messages: [],
    };
    const list = read();
    list.unshift(conv);
    write(list);
    return conv;
  },
  update(id: string, patch: Partial<Conversation>): Conversation | undefined {
    const list = read();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    list[idx] = { ...list[idx], ...patch, updatedAt: Date.now() };
    write(list);
    return list[idx];
  },
  remove(id: string) {
    write(read().filter((c) => c.id !== id));
  },
  addMessage(id: string, msg: ChatMessage) {
    const list = read();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return;
    list[idx].messages.push(msg);
    list[idx].updatedAt = Date.now();
    if (list[idx].title === "New dialogue" && msg.role === "user") {
      list[idx].title = msg.content.slice(0, 48) || "New dialogue";
    }
    write(list);
  },
  replaceLastAssistant(id: string, content: string, error?: string) {
    const list = read();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const msgs = list[idx].messages;
    const last = msgs[msgs.length - 1];
    if (last && last.role === "assistant") {
      last.content = content;
      last.error = error;
      list[idx].updatedAt = Date.now();
      write(list);
    }
  },
};

export function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr > 1 ? "s" : ""} ago`;
  const d = Math.floor(hr / 24);
  if (d < 7) return d === 1 ? "Yesterday" : `${d} days ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
