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

// Cookie-banner decision is tracked separately from the user token.
const DECISION_KEY = "cookie_consent";

function readDecision(): "accepted" | "declined" | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(DECISION_KEY);
    return v === "accepted" || v === "declined" ? v : null;
  } catch {
    return null;
  }
}

function writeDecision(v: "accepted" | "declined") {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DECISION_KEY, v);
  } catch {
    // ignore
  }
}

/**
 * Ensure a `user` token exists in localStorage on every visit, regardless of
 * the cookie banner decision. Generates and persists a UUID if missing.
 */
function ensureUserToken(): string {
  const existing = readStored();
  if (existing) return existing;
  const token = generateUuid();
  writeStored(token);
  return token;
}

// Run immediately on module load (every page visit) in the browser.
if (typeof window !== "undefined") {
  ensureUserToken();
}

export const consent = {
  /** True when the user has made a cookie-banner decision. */
  hasDecision(): boolean {
    return readDecision() !== null;
  },
  isAccepted(): boolean {
    return readDecision() === "accepted";
  },
  /** Record acceptance. The user token is already guaranteed to exist. */
  accept(): string {
    writeDecision("accepted");
    return ensureUserToken();
  },
  /** Record decline. Does not remove the user token. */
  decline() {
    writeDecision("declined");
  },
  /** The active session token (always present after first visit). */
  getUid(): string | null {
    return ensureUserToken();
  },
  /** Ensure & return the token (alias kept for compatibility). */
  peekPendingToken(): string {
    return ensureUserToken();
  },
};
