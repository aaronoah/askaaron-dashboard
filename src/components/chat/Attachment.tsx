import { Paperclip, X, FileText } from "lucide-react";
import type { Attachment } from "@/lib/chat-store";

function bytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function AttachmentChip({
  attachment,
  onRemove,
}: {
  attachment: Attachment;
  onRemove?: () => void;
}) {
  return (
    <div className="inline-flex items-center gap-2 max-w-xs px-3 py-2 rounded-xl bg-felt border border-border-soft text-ink">
      <div className="size-7 rounded-lg bg-canvas border border-border-soft flex items-center justify-center shrink-0">
        <FileText className="size-3.5 text-clay" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate">{attachment.name}</p>
        <p className="text-[10px] text-clay uppercase tracking-wider">{bytes(attachment.size)}</p>
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="p-1 rounded-md hover:bg-canvas transition-colors"
          aria-label={`Remove ${attachment.name}`}
        >
          <X className="size-3.5 text-clay" />
        </button>
      )}
    </div>
  );
}

export function AttachButton({ onPick }: { onPick: (files: FileList) => void }) {
  return (
    <label className="p-3 rounded-2xl text-clay/70 hover:text-ink hover:bg-felt transition-colors cursor-pointer">
      <Paperclip className="size-5" />
      <input
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) onPick(e.target.files);
          e.target.value = "";
        }}
      />
    </label>
  );
}
