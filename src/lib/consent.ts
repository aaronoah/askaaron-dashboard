// User session token stored in localStorage when the user accepts cookies.
// Key: "user", value: a UUID string generated on first visit.
//
// Flow:
// - On first visit we generate a UUID in memory (pending token).
// - The cookie banner is shown if localStorage["user"] is missing.
// - If the user accepts, we persist the pending token under "user".
// - If the user declines, we do not persist anything (banner will show again next visit).

const STORAGE_KEY = "user";

function generateUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback (non-crypto) — extremely unlikely to be hit in modern browsers.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function readStored(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStored(token: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // ignore quota / disabled storage
  }
}

// Pending token generated for the current visit until the user decides.
let pendingToken: string | null = null;

function getPendingToken(): string {
  if (!pendingToken) pendingToken = generateUuid();
  return pendingToken;
}

export const consent = {
  /** True when a stored session token already exists (banner should be hidden). */
  hasDecision(): boolean {
    return readStored() !== null;
  },
  isAccepted(): boolean {
    return readStored() !== null;
  },
  /** Persist the pending session token under localStorage["user"] and return it. */
  accept(): string {
    const existing = readStored();
    if (existing) return existing;
    const token = getPendingToken();
    writeStored(token);
    return token;
  },
  /** No-op for storage. Banner will appear again on next visit. */
  decline() {
    // intentionally do nothing — we only persist on accept
  },
  /** The active session token, or null if the user hasn't accepted yet. */
  getUid(): string | null {
    return readStored();
  },
  /** The token that *would* be stored on accept (useful for debugging). */
  peekPendingToken(): string {
    return getPendingToken();
  },
};
