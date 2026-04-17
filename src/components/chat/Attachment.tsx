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
  const isImage = attachment.type.startsWith("image/") && attachment.previewUrl;

  return (
    <div
      className="relative group size-16 md:size-20 rounded-xl overflow-hidden bg-felt border border-border-soft shrink-0"
      title={`${attachment.name} · ${bytes(attachment.size)}`}
    >
      {isImage ? (
        <img
          src={attachment.previewUrl}
          alt={attachment.name}
          className="size-full object-cover"
        />
      ) : (
        <div className="size-full flex flex-col items-center justify-center gap-1 px-1.5 text-center">
          <FileText className="size-5 text-clay shrink-0" />
          <p className="text-[9px] leading-tight text-ink/80 font-medium truncate w-full">
            {attachment.name}
          </p>
        </div>
      )}
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-1 right-1 size-5 rounded-full bg-ink/80 text-canvas flex items-center justify-center shadow-sm opacity-90 hover:opacity-100 hover:bg-ink transition-opacity"
          aria-label={`Remove ${attachment.name}`}
        >
          <X className="size-3" strokeWidth={2.5} />
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
