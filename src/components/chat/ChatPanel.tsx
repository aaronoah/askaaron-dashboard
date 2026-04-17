import { useEffect, useRef, useState } from "react";
import { ArrowUp, Square } from "lucide-react";
import type { Conversation, ChatMessage, Attachment } from "@/lib/chat-store";
import { chatStore } from "@/lib/chat-store";
import { streamFakeReply } from "@/lib/fake-ai";
import { MessageBubble } from "./MessageBubble";
import { AttachButton, AttachmentChip } from "./Attachment";

type Props = {
  conversation: Conversation;
  onChange: () => void;
};

export function ChatPanel({ conversation, onChange }: Props) {
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState<Attachment[]>([]);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 240) + "px";
  }, [draft]);

  // Scroll to bottom on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [conversation.messages.length, conversation.id]);

  function handlePick(files: FileList) {
    const additions: Attachment[] = [];
    for (const f of Array.from(files)) {
      additions.push({
        id: crypto.randomUUID(),
        name: f.name,
        size: f.size,
        type: f.type || "application/octet-stream",
      });
    }
    setPending((p) => [...p, ...additions]);
  }

  async function send() {
    const text = draft.trim();
    if (!text && pending.length === 0) return;
    if (streaming) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: Date.now(),
      attachments: pending.length > 0 ? pending : undefined,
    };
    chatStore.addMessage(conversation.id, userMsg);

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      createdAt: Date.now(),
    };
    chatStore.addMessage(conversation.id, assistantMsg);

    setDraft("");
    setPending([]);
    onChange();

    setStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;

    let acc = "";
    await streamFakeReply(
      text,
      userMsg.attachments,
      (chunk) => {
        acc += chunk;
        chatStore.replaceLastAssistant(conversation.id, acc);
        onChange();
      },
      () => {
        setStreaming(false);
        abortRef.current = null;
      },
      controller.signal,
    );
  }

  function stop() {
    abortRef.current?.abort();
    setStreaming(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  const isEmpty = conversation.messages.length === 0;

  return (
    <main className="flex-1 flex flex-col items-center overflow-hidden relative bg-canvas">
      <header className="w-full max-w-3xl px-8 h-20 flex items-center justify-between shrink-0">
        <div className="flex flex-col">
          <h2 className="font-serif italic text-2xl text-ink leading-tight">
            {conversation.title}
          </h2>
          <p className="text-xs text-clay font-medium">
            Quiet dialogue · {conversation.messages.length} message
            {conversation.messages.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="size-2 rounded-full bg-moss/80" aria-hidden />
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-clay">
            {streaming ? "Composing" : "Ready"}
          </span>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 w-full overflow-y-auto">
        <div className="w-full max-w-3xl mx-auto px-8 pb-64 pt-6 space-y-10">
          {isEmpty ? (
            <EmptyState onPick={(p) => setDraft(p)} />
          ) : (
            conversation.messages.map((m) => <MessageBubble key={m.id} message={m} />)
          )}
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 flex justify-center px-6 pb-8 pt-16 bg-gradient-to-t from-canvas via-canvas/95 to-transparent pointer-events-none">
        <div className="w-full max-w-3xl pointer-events-auto">
          {pending.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {pending.map((a) => (
                <AttachmentChip
                  key={a.id}
                  attachment={a}
                  onRemove={() => setPending((p) => p.filter((x) => x.id !== a.id))}
                />
              ))}
            </div>
          )}
          <div className="relative rounded-3xl bg-canvas border border-border-soft shadow-felt-lg focus-within:border-clay/40 transition-colors">
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Share a thought, ask a question, or attach a document..."
              rows={1}
              className="w-full resize-none bg-transparent px-7 pt-6 pb-2 text-[17px] leading-relaxed text-ink placeholder:text-clay/60 focus:outline-none"
            />
            <div className="flex items-center justify-between px-3 pb-3">
              <AttachButton onPick={handlePick} />
              {streaming ? (
                <button
                  onClick={stop}
                  className="flex items-center gap-2 px-5 py-2.5 bg-felt text-ink border border-border-soft rounded-2xl font-semibold text-sm hover:bg-border-soft/40 transition-colors"
                >
                  <Square className="size-4 fill-current" />
                  Stop
                </button>
              ) : (
                <button
                  onClick={() => void send()}
                  disabled={!draft.trim() && pending.length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 bg-clay text-canvas rounded-2xl font-semibold text-sm shadow-felt hover:brightness-105 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Send
                  <ArrowUp className="size-4" />
                </button>
              )}
            </div>
          </div>
          <p className="text-center text-[11px] text-clay/60 mt-3 uppercase tracking-widest">
            Press Enter to send · Shift + Enter for a new line
          </p>
        </div>
      </div>
    </main>
  );
}

function EmptyState({ onPick }: { onPick: (prompt: string) => void }) {
  const prompts = [
    "Help me design a quiet morning ritual.",
    "What does it mean to make a humanist interface?",
    "Summarize the key idea in this attached document.",
    "Brainstorm names for a thoughtful note-taking app.",
  ];
  return (
    <div className="flex flex-col items-center text-center pt-16">
      <div className="size-16 rounded-3xl bg-felt border border-border-soft flex items-center justify-center font-serif italic text-3xl text-clay shadow-felt mb-6">
        A
      </div>
      <h1 className="font-serif italic text-4xl text-ink mb-3">A space for slower thinking.</h1>
      <p className="text-clay text-lg max-w-md mb-10 leading-relaxed">
        Begin a dialogue, attach a document, or start with one of the prompts below.
      </p>
      <div className="grid sm:grid-cols-2 gap-3 w-full max-w-xl">
        {prompts.map((p) => (
          <button
            key={p}
            onClick={() => onPick(p)}
            className="text-left px-5 py-4 rounded-2xl bg-canvas border border-border-soft shadow-felt hover:-translate-y-px hover:shadow-felt-lg transition-all text-ink/80 text-sm leading-relaxed"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
