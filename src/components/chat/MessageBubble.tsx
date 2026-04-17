import ReactMarkdown from "react-markdown";
import type { ChatMessage } from "@/lib/chat-store";
import { AttachmentChip } from "./Attachment";
import aaronAvatar from "@/assets/aaron.jpg";

export function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    return (
      <div className="flex gap-6 justify-end">
        <div className="max-w-[80%] flex flex-col items-end gap-3">
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-end">
              {message.attachments.map((a) => (
                <AttachmentChip key={a.id} attachment={a} />
              ))}
            </div>
          )}
          {message.content && (
            <div className="px-7 py-5 rounded-[28px] bg-canvas border border-border-soft shadow-felt">
              <p className="text-[17px] leading-relaxed text-ink whitespace-pre-wrap">
                {message.content}
              </p>
            </div>
          )}
        </div>
        <div className="shrink-0 size-10 rounded-2xl bg-clay text-canvas flex items-center justify-center font-serif italic text-lg">
          You
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      <div className="shrink-0 size-10 rounded-2xl bg-felt border border-border-soft flex items-center justify-center font-serif italic text-clay text-lg">
        A
      </div>
      <div className="flex-1 min-w-0 max-w-[65ch]">
        <div className="prose prose-stone prose-lg max-w-none text-ink/90
          prose-p:text-[17px] prose-p:leading-relaxed prose-p:my-3
          prose-strong:text-ink prose-strong:font-semibold
          prose-em:font-serif prose-em:text-ink
          prose-li:text-[17px] prose-li:leading-relaxed
          prose-ul:my-3 prose-ol:my-3
          prose-code:bg-felt prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none">
          {message.content ? (
            <ReactMarkdown>{message.content}</ReactMarkdown>
          ) : (
            <span className="inline-flex gap-1 items-center text-clay">
              <span className="size-1.5 rounded-full bg-clay/60 animate-pulse" />
              <span className="size-1.5 rounded-full bg-clay/60 animate-pulse [animation-delay:150ms]" />
              <span className="size-1.5 rounded-full bg-clay/60 animate-pulse [animation-delay:300ms]" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
