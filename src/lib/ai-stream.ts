// Real backend streaming: POST /prompt → { session_id }, then SSE /conversation?session_id=...
// Drop-in replacement for the previous fake streamer. Same signature so ChatPanel is unchanged.

import type { Attachment } from "./chat-store";

const BASE_URL = process.env.VITE_BACKEND_CORS_ORIGINS as string | undefined;

export async function streamAssistantReply(
  prompt: string,
  _attachments: Attachment[] | undefined,
  onDelta: (chunk: string) => void,
  onDone: (error?: string) => void,
  signal?: AbortSignal,
) {
  if (!BASE_URL) {
    onDone("Missing VITE_BACKEND_CORS_ORIGINS env var.");
    return;
  }

  // 1) POST the prompt to obtain a session_id.
  let sessionId: string;
  try {
    const res = await fetch(`${BASE_URL}/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
      signal,
    });
    if (!res.ok) {
      onDone(`Failed to start conversation (${res.status}).`);
      return;
    }
    const json = (await res.json()) as { session_id?: string };
    if (!json.session_id) {
      onDone("Backend did not return a session_id.");
      return;
    }
    sessionId = json.session_id;
  } catch (err) {
    if (signal?.aborted) {
      onDone();
      return;
    }
    onDone(err instanceof Error ? err.message : "Network error reaching backend.");
    return;
  }

  if (signal?.aborted) {
    onDone();
    return;
  }

  // 2) Spin up a dedicated worker that owns the EventSource.
  const worker = new Worker(new URL("./sseWorker.ts", import.meta.url), { type: "module" });

  const cleanup = () => {
    try {
      worker.postMessage({ type: "stop" });
    } catch {
      /* noop */
    }
    worker.terminate();
    signal?.removeEventListener("abort", onAbort);
  };

  const onAbort = () => {
    cleanup();
    onDone();
  };
  signal?.addEventListener("abort", onAbort);

  worker.onmessage = (event: MessageEvent) => {
    const { type, data } = event.data as { type: string; data?: string };
    if (type === "message" && typeof data === "string") {
      // Match the existing slice convention: append a trailing space between chunks.
      onDelta(data + " ");
    } else if (type === "error") {
      cleanup();
      onDone("Stream interrupted, please try again.");
    } else if (type === "closed") {
      cleanup();
      onDone();
    }
  };

  worker.postMessage({
    type: "start",
    url: `${BASE_URL}/conversation?session_id=${encodeURIComponent(sessionId)}`,
  });
}
