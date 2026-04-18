// Local persistence for conversations + messages. Easy to swap for a backend later.

import { consent } from "./consent";

export type Attachment = {
  id: string;
  name: string;
  size: number;
  type: string;
  // Small text/preview only — we don't persist binary file bytes here.
  textPreview?: string;
  /** In-memory object URL for image previews. Not persisted across reloads. */
  previewUrl?: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  attachments?: Attachment[];
  /** Set on assistant messages when generation failed. */
  error?: string;
  /** Anonymous user ID from consent cookie, if granted. */
  userCookie?: string | null;
  /** For assistant messages: total seconds the server took to fully reply. */
  responseSeconds?: number;
};

export type Conversation = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  /** Anonymous user ID from consent cookie, if granted at creation time. */
  userCookie?: string | null;
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
      userCookie: consent.getUid(),
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
    const stamped: ChatMessage = { ...msg, userCookie: msg.userCookie ?? consent.getUid() };
    list[idx].messages.push(stamped);
    list[idx].updatedAt = Date.now();
    if (list[idx].title === "New dialogue" && stamped.role === "user") {
      list[idx].title = stamped.content.slice(0, 48) || "New dialogue";
    }
    // Backfill conversation cookie if user has since accepted.
    if (!list[idx].userCookie) list[idx].userCookie = consent.getUid();
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
  setLastAssistantSeconds(id: string, seconds: number) {
    const list = read();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const msgs = list[idx].messages;
    const last = msgs[msgs.length - 1];
    if (last && last.role === "assistant") {
      last.responseSeconds = seconds;
      list[idx].updatedAt = Date.now();
      write(list);
    }
  },
};

type RelativeStrings = {
  justNow: string;
  minAgo: (n: number) => string;
  hourAgo: (n: number) => string;
  yesterday: string;
  daysAgo: (n: number) => string;
  shortDate: (ts: number) => string;
};

const defaultStrings: RelativeStrings = {
  justNow: "just now",
  minAgo: (n) => `${n} min ago`,
  hourAgo: (n) => `${n} hour${n > 1 ? "s" : ""} ago`,
  yesterday: "Yesterday",
  daysAgo: (n) => `${n} days ago`,
  shortDate: (ts) => new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
};

export function formatRelative(ts: number, s: RelativeStrings = defaultStrings): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return s.justNow;
  if (min < 60) return s.minAgo(min);
  const hr = Math.floor(min / 60);
  if (hr < 24) return s.hourAgo(hr);
  const d = Math.floor(hr / 24);
  if (d < 7) return d === 1 ? s.yesterday : s.daysAgo(d);
  return s.shortDate(ts);
}

export const NEW_DIALOGUE_TITLE = "New dialogue";

