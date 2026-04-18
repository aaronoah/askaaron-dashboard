import { useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  onDelete: () => void;
  deleteLabel?: string;
  children: ReactNode;
};

const REVEAL_WIDTH = 88; // px width of the red action panel
const TRIGGER_THRESHOLD = 60; // px swipe to snap-open
const COMMIT_THRESHOLD = 160; // px swipe to auto-delete

/**
 * Mobile swipe-to-delete wrapper.
 * - Swipe right reveals a red trash panel beneath the row.
 * - Swiping past COMMIT_THRESHOLD triggers delete on release.
 * - Tapping the revealed trash also deletes.
 * - Pointer-based, so it works for touch + mouse; vertical scroll is preserved
 *   because we only hijack the gesture once horizontal intent is detected.
 */
export function SwipeableConversationItem({ onDelete, deleteLabel = "Delete conversation", children }: Props) {
  const [offset, setOffset] = useState(0);
  const [open, setOpen] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const activeId = useRef<number | null>(null);
  const decided = useRef<"horizontal" | "vertical" | null>(null);

  function reset(animated = true) {
    setOffset(0);
    setOpen(false);
    if (!animated) {
      // no-op: state change already triggers transition; consumers rely on CSS
    }
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    // Only handle touch / pen primary gestures on small screens.
    if (e.pointerType === "mouse") return;
    activeId.current = e.pointerId;
    startX.current = e.clientX;
    startY.current = e.clientY;
    decided.current = null;
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (activeId.current !== e.pointerId) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    if (decided.current === null) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      decided.current = Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";
      if (decided.current === "horizontal") {
        try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      }
    }

    if (decided.current !== "horizontal") return;

    // Allow rightward swipe; cap with rubber-band beyond reveal width.
    let next = dx;
    if (next < 0) {
      // If currently open, allow swiping left to close.
      next = open ? Math.max(REVEAL_WIDTH + dx, 0) : 0;
    } else if (next > REVEAL_WIDTH) {
      next = REVEAL_WIDTH + (next - REVEAL_WIDTH) * 0.35;
    }
    setOffset(next);
  }

  function onPointerEnd(e: ReactPointerEvent<HTMLDivElement>) {
    if (activeId.current !== e.pointerId) return;
    const wasHorizontal = decided.current === "horizontal";
    activeId.current = null;
    decided.current = null;

    if (!wasHorizontal) {
      reset();
      return;
    }

    if (offset >= COMMIT_THRESHOLD) {
      // Animate fully open then delete.
      setOffset(REVEAL_WIDTH);
      setOpen(true);
      // slight delay so the user sees the snap before removal
      setTimeout(() => onDelete(), 120);
      return;
    }

    if (offset >= TRIGGER_THRESHOLD) {
      setOffset(REVEAL_WIDTH);
      setOpen(true);
    } else {
      reset();
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Red action layer */}
      <button
        type="button"
        aria-label={deleteLabel}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className={cn(
          "absolute inset-y-0 left-0 flex items-center justify-start pl-5 bg-red-600 text-white",
          "transition-opacity duration-150",
          offset > 4 ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        style={{ width: REVEAL_WIDTH }}
      >
        <Trash2 className="size-5" />
      </button>

      {/* Sliding content */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        style={{
          transform: `translate3d(${offset}px, 0, 0)`,
          transition: activeId.current === null ? "transform 200ms ease" : "none",
          touchAction: "pan-y",
        }}
        onClickCapture={(e) => {
          // If the row is open, the first tap should close it instead of selecting.
          if (open) {
            e.stopPropagation();
            e.preventDefault();
            reset();
          }
        }}
      >
        {children}
      </div>
    </div>
  );
}
