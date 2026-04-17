// Dedicated Web Worker that owns an EventSource for SSE streaming.
// The main thread posts { type: 'start', url } to begin and { type: 'stop' } to abort.
// The worker emits { type: 'message' | 'error' | 'closed', data? }.

let source: EventSource | null = null;

function close() {
  if (source) {
    source.close();
    source = null;
  }
}

self.onmessage = (event: MessageEvent) => {
  const msg = event.data as { type: "start" | "stop"; url?: string };

  if (msg.type === "start" && msg.url) {
    close();
    source = new EventSource(msg.url);

    source.onmessage = (e) => {
      (self as unknown as Worker).postMessage({ type: "message", data: e.data });
    };

    source.onerror = (e) => {
      (self as unknown as Worker).postMessage({ type: "error", error: String(e) });
    };

    source.addEventListener("end", () => {
      close();
      (self as unknown as Worker).postMessage({ type: "closed" });
    });
  }

  if (msg.type === "stop") {
    close();
    (self as unknown as Worker).postMessage({ type: "closed" });
  }
};

export {};
