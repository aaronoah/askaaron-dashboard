// Cookie-based user consent + anonymous user ID.
// When the user accepts, we set two cookies:
//   arlow_consent=accepted
//   arlow_uid=<uuid>
// The uid is then attached to every new conversation and every message.

const CONSENT_COOKIE = "arlow_consent";
const UID_COOKIE = "arlow_uid";
const ONE_YEAR = 60 * 60 * 24 * 365;

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax${secure}`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export const consent = {
  hasDecision(): boolean {
    return getCookie(CONSENT_COOKIE) !== null;
  },
  isAccepted(): boolean {
    return getCookie(CONSENT_COOKIE) === "accepted";
  },
  accept(): string {
    setCookie(CONSENT_COOKIE, "accepted", ONE_YEAR);
    let uid = getCookie(UID_COOKIE);
    if (!uid) {
      uid = crypto.randomUUID();
      setCookie(UID_COOKIE, uid, ONE_YEAR);
    }
    return uid;
  },
  decline() {
    setCookie(CONSENT_COOKIE, "declined", ONE_YEAR);
  },
  getUid(): string | null {
    if (!this.isAccepted()) return null;
    return getCookie(UID_COOKIE);
  },
};
