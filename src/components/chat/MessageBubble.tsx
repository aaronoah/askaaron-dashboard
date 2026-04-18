import ReactMarkdown from "react-markdown";
import { AlertCircle, RefreshCw } from "lucide-react";
import type { ChatMessage } from "@/lib/chat-store";
import { AttachmentChip } from "./Attachment";
import aaronAvatar from "@/assets/aaron.jpg";

type Props = {
  message: ChatMessage;
  onRetry?: () => void;
  /** When set, the assistant is actively streaming and we show a live timer. */
  liveSeconds?: number;
};

export function MessageBubble({ message, onRetry, liveSeconds }: Props) {
  if (message.role === "user") {
    return (
      <div className="flex gap-3 md:gap-6 justify-end">
        <div className="max-w-[80%] flex flex-col items-end gap-2 md:gap-3">
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-end">
              {message.attachments.map((a) => (
                <AttachmentChip key={a.id} attachment={a} />
              ))}
            </div>
          )}
          {message.content && (
            <div className="px-4 py-2.5 md:px-5 md:py-3 rounded-2xl md:rounded-[22px] bg-canvas border border-border-soft shadow-felt">
              <p className="text-sm md:text-[17px] leading-snug md:leading-relaxed text-ink whitespace-pre-wrap">
                {message.content}
              </p>
            </div>
          )}
        </div>
        <div className="shrink-0 size-8 md:size-10 rounded-xl md:rounded-2xl bg-clay text-canvas flex items-center justify-center font-serif italic text-sm md:text-lg">
          You
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 md:gap-6">
      <div className="shrink-0 size-8 md:size-10 rounded-xl md:rounded-2xl overflow-hidden ring-1 ring-border-soft shadow-felt">
        <img src={aaronAvatar} alt="Aaron.skill" className="size-full object-cover" />
      </div>
      <div className="flex-1 min-w-0 max-w-[65ch]">
        <div className="prose prose-stone max-w-none text-ink/90
          prose-p:text-sm md:prose-p:text-[17px] prose-p:leading-snug md:prose-p:leading-relaxed prose-p:my-2 md:prose-p:my-3
          prose-strong:text-ink prose-strong:font-semibold
          prose-em:font-serif prose-em:text-ink
          prose-li:text-sm md:prose-li:text-[17px] prose-li:leading-snug md:prose-li:leading-relaxed prose-li:my-0.5
          prose-ul:my-2 md:prose-ul:my-3 prose-ol:my-2 md:prose-ol:my-3
          prose-code:bg-felt prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs md:prose-code:text-sm prose-code:before:content-none prose-code:after:content-none">
          {message.error ? (
            <div className="flex flex-col items-start gap-3">
              <div className="flex items-start gap-2 px-4 py-3 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive">
                <AlertCircle className="size-4 mt-0.5 shrink-0" />
                <p className="text-sm leading-snug">{message.error}</p>
              </div>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-canvas border border-border-soft shadow-felt text-sm font-medium text-ink hover:-translate-y-px hover:shadow-felt-lg transition-all"
                >
                  <RefreshCw className="size-3.5" />
                  Retry
                </button>
              )}
            </div>
          ) : message.content ? (
            <>
              <ReactMarkdown>{message.content}</ReactMarkdown>
              {typeof message.responseSeconds === "number" && (
                <p className="not-prose text-[11px] md:text-xs text-clay/60 mt-2">
                  Replied in {message.responseSeconds}s
                </p>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-1.5">
              <span className="inline-flex gap-1 items-center text-clay">
                <span className="size-1.5 rounded-full bg-clay/60 animate-pulse" />
                <span className="size-1.5 rounded-full bg-clay/60 animate-pulse [animation-delay:150ms]" />
                <span className="size-1.5 rounded-full bg-clay/60 animate-pulse [animation-delay:300ms]" />
              </span>
              {typeof liveSeconds === "number" && (
                <span className="text-[11px] md:text-xs text-clay/60 font-mono">
                  {liveSeconds}s
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
