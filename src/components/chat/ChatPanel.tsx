import { useEffect, useRef, useState } from "react";
import { ArrowUp, Square, Briefcase, Video, Monitor, Heart } from "lucide-react";
import type { Conversation, ChatMessage, Attachment } from "@/lib/chat-store";
import { chatStore, formatRelative } from "@/lib/chat-store";
import { streamFakeReply } from "@/lib/fake-ai";
import { MessageBubble } from "./MessageBubble";
import { AttachButton, AttachmentChip } from "./Attachment";
import aaronAvatar from "@/assets/aaron.jpg";

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

  async function runAssistant(prompt: string, attachments?: Attachment[]) {
    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      createdAt: Date.now(),
    };
    chatStore.addMessage(conversation.id, assistantMsg);
    onChange();

    setStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;

    let acc = "";
    await streamFakeReply(
      prompt,
      attachments,
      (chunk) => {
        acc += chunk;
        chatStore.replaceLastAssistant(conversation.id, acc);
        onChange();
      },
      (error) => {
        if (error) {
          // Persist the failure on the assistant message so the bubble can show
          // the failed state + Retry control.
          chatStore.replaceLastAssistant(conversation.id, "", error);
          onChange();
        }
        setStreaming(false);
        abortRef.current = null;
      },
      controller.signal,
    );
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

    setDraft("");
    setPending([]);

    await runAssistant(text, userMsg.attachments);
  }

  function retryAssistantAt(index: number) {
    if (streaming) return;
    // The user message is the one immediately preceding the failed assistant.
    const prev = conversation.messages[index - 1];
    if (!prev || prev.role !== "user") return;

    // Drop the failed assistant message, then run a fresh attempt.
    const remaining = conversation.messages.slice(0, index);
    chatStore.update(conversation.id, { messages: remaining });
    onChange();

    void runAssistant(prev.content, prev.attachments);
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
      <header className="w-full max-w-3xl pl-20 pr-5 md:px-8 h-16 md:h-20 flex items-center justify-between shrink-0">
        <div className="flex flex-col">
          <h2 className="font-serif italic text-lg md:text-2xl text-ink leading-tight">
            {conversation.title}
          </h2>
          <p className="text-[10px] md:text-xs text-clay font-medium">
            {conversation.messages.length} message
            {conversation.messages.length === 1 ? "" : "s"} · {formatRelative(conversation.updatedAt)}
          </p>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 w-full overflow-y-auto">
        <div className="w-full max-w-3xl mx-auto px-5 md:px-8 pb-56 md:pb-64 pt-4 md:pt-6 space-y-6 md:space-y-10">
          {isEmpty ? (
            <EmptyState onPick={(p) => setDraft(p)} />
          ) : (
            conversation.messages.map((m, i) => (
              <MessageBubble
                key={m.id}
                message={m}
                onRetry={m.role === "assistant" && m.error ? () => retryAssistantAt(i) : undefined}
              />
            ))
          )}
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 flex justify-center px-4 md:px-6 pb-5 md:pb-8 pt-10 md:pt-16 bg-gradient-to-t from-canvas via-canvas/95 to-transparent pointer-events-none">
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
              className="w-full resize-none bg-transparent px-5 md:px-7 pt-4 md:pt-6 pb-2 text-sm md:text-[17px] leading-snug md:leading-relaxed text-ink placeholder:text-clay/60 focus:outline-none"
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
          <p className="text-center text-[10px] md:text-[11px] text-clay/60 mt-2 md:mt-3 uppercase tracking-widest">
            Press Enter to send · Shift + Enter for a new line
          </p>
        </div>
      </div>
    </main>
  );
}

function EmptyState({ onPick }: { onPick: (prompt: string) => void }) {
  const prompts: { text: string; icon?: React.ReactNode }[] = [
    {
      text: "Book an Adplist career coach session with Aaron",
      icon: (
        <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-md bg-ink text-canvas">
          <Briefcase className="size-3" strokeWidth={2.5} />
        </span>
      ),
    },
    {
      text: "Book an mock interview with Aaron",
      icon: (
        <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-md bg-[#2D8CFF] text-white">
          <Video className="size-3" strokeWidth={2.5} />
        </span>
      ),
    },
    {
      text: "Consult tech, AI or movie questions with Aaron",
      icon: (
        <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-md bg-ink text-canvas">
          <Monitor className="size-3" strokeWidth={2.5} />
        </span>
      ),
    },
    { text: "Date with Aaron" },
  ];
  return (
    <div className="flex flex-col items-center text-center pt-8 md:pt-16">
      <div className="size-12 md:size-16 rounded-3xl overflow-hidden ring-1 ring-border-soft shadow-felt mb-4 md:mb-6">
        <img src={aaronAvatar} alt="Aaron" className="size-full object-cover" />
      </div>
      <h1 className="font-serif italic text-2xl md:text-4xl text-ink mb-2 md:mb-3 leading-tight">Distilled Aaron at your service</h1>
      <p className="text-clay text-sm md:text-lg max-w-md mb-6 md:mb-10 leading-snug md:leading-relaxed">
        Begin a dialogue, attach a document, or start with one of the prompts below.
      </p>
      <div className="grid sm:grid-cols-2 gap-3 w-full max-w-xl">
        {prompts.map((p) => (
          <button
            key={p.text}
            onClick={() => onPick(p.text)}
            className="flex items-center gap-2 text-left px-4 md:px-5 py-3 md:py-4 rounded-2xl bg-canvas border border-border-soft shadow-felt hover:-translate-y-px hover:shadow-felt-lg transition-all text-ink/80 text-xs md:text-sm leading-snug md:leading-relaxed"
          >
            {p.icon}
            <span>{p.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
