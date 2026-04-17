// Stubbed assistant. Streams a thoughtful, on-brand reply token-by-token.
// Swap this for a real Lovable AI gateway call when backend is enabled.

import type { Attachment } from "./chat-store";

const OPENERS = [
  "That's a lovely thread to pull on.",
  "There's quiet beauty in this question.",
  "Let me sit with that for a moment.",
  "A worthwhile thought — here's where it leads me.",
];

function craftReply(prompt: string, attachments?: Attachment[]): string {
  const opener = OPENERS[Math.floor(Math.random() * OPENERS.length)];
  const trimmed = prompt.trim();
  const subject = trimmed.length > 80 ? trimmed.slice(0, 80) + "…" : trimmed;

  const attachmentNote = attachments && attachments.length > 0
    ? `\n\nI can see you've shared **${attachments.length} attachment${attachments.length > 1 ? "s" : ""}** — ${attachments.map((a) => `\`${a.name}\``).join(", ")}. I'll keep them in mind as we talk.`
    : "";

  return `${opener}

You wrote: *"${subject}"*

Here are three angles worth considering:

- **The intuition** — what does your gut say before reason intervenes?
- **The structure** — where would this idea sit if it had to live somewhere permanent?
- **The light** — how would this feel if you returned to it tomorrow morning?

${attachmentNote}

When you're ready, tell me which thread feels most alive and we'll follow it deeper.`;
}

export async function streamFakeReply(
  prompt: string,
  attachments: Attachment[] | undefined,
  onDelta: (chunk: string) => void,
  onDone: (error?: string) => void,
  signal?: AbortSignal,
) {
  const full = craftReply(prompt, attachments);

  // 1) Thinking phase — empty assistant bubble shows animated dots.
  const thinkMs = 1100 + Math.random() * 900;
  const start = Date.now();
  while (Date.now() - start < thinkMs) {
    if (signal?.aborted) {
      onDone();
      return;
    }
    await new Promise((r) => setTimeout(r, 60));
  }

  // 2) Simulate occasional failures (~15%) so the failed/retry UI is reachable.
  if (Math.random() < 0.15) {
    onDone("The model could not finish a reply. Please try again.");
    return;
  }

  // 3) Stream word-by-word (client-side simulation).
  const tokens = full.split(/(\s+)/);
  for (const token of tokens) {
    if (signal?.aborted) {
      onDone();
      return;
    }
    await new Promise((r) => setTimeout(r, 18 + Math.random() * 32));
    onDelta(token);
  }
  onDone();
}
