import { type ReactNode, useCallback, useRef, useState } from "react";
import { IconDelete } from "musae/icons";
import { Popconfirm } from "musae";
import { useReducedMotion } from "../../utils/reduced-motion.util";

const SWIPE_THRESHOLD = 20;
const ACTION_WIDTH = 80;
const SPRING_DURATION = 300;

interface SwipeableCardProps {
  /** Called after user confirms deletion via Popconfirm */
  onConfirmDelete: () => void;
  /** Whether the card is currently swiped open */
  open: boolean;
  /** Called when the card's open state should change */
  onOpenChange: (open: boolean) => void;
  deleteLabel?: string;
  children: ReactNode;
  className?: string;
}

const SwipeableCard = ({
  onConfirmDelete,
  open,
  onOpenChange,
  deleteLabel = "删除",
  children,
  className = "",
}: SwipeableCardProps) => {
  const [translateX, setTranslateX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const currentTranslate = useRef(0);
  const isDragging = useRef(false);
  const reducedMotion = useReducedMotion();

  const transitionStyle = reducedMotion
    ? {}
    : dragging
      ? { transition: "none" }
      : { transition: `transform ${SPRING_DURATION}ms ease-in-out` };

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
      currentTranslate.current = open ? -ACTION_WIDTH : 0;
      isDragging.current = false;
      setDragging(false);
    },
    [open],
  );

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    // Detect horizontal swipe (reject vertical scroll)
    if (!isDragging.current && Math.abs(deltaX) > 5 && Math.abs(deltaX) > Math.abs(deltaY)) {
      isDragging.current = true;
      setDragging(true);
    }

    if (!isDragging.current) return;

    // Clamp: can only swipe left (negative), max to -ACTION_WIDTH
    const newTranslate = Math.max(-ACTION_WIDTH, Math.min(0, currentTranslate.current + deltaX));
    setTranslateX(newTranslate);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setDragging(false);

    // Snap: if swiped left past SWIPE_THRESHOLD, open. Else close.
    if (translateX < -SWIPE_THRESHOLD) {
      setTranslateX(-ACTION_WIDTH);
      onOpenChange(true);
    } else {
      setTranslateX(0);
      onOpenChange(false);
    }
  }, [translateX, onOpenChange]);

  // Pointer handlers — enable the same swipe gesture with a mouse on desktop
  // (Tauri macOS). Guarded by pointerType === "mouse" so touch devices keep
  // using the touch handlers above and the two never double-fire.
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      e.currentTarget.setPointerCapture(e.pointerId);
      touchStartX.current = e.clientX;
      touchStartY.current = e.clientY;
      currentTranslate.current = open ? -ACTION_WIDTH : 0;
      isDragging.current = false;
      setDragging(false);
    },
    [open],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const deltaX = e.clientX - touchStartX.current;
    const deltaY = e.clientY - touchStartY.current;

    // Detect horizontal swipe (reject vertical scroll)
    if (!isDragging.current && Math.abs(deltaX) > 5 && Math.abs(deltaX) > Math.abs(deltaY)) {
      isDragging.current = true;
      setDragging(true);
    }

    if (!isDragging.current) return;

    // Clamp: can only swipe left (negative), max to -ACTION_WIDTH
    const newTranslate = Math.max(-ACTION_WIDTH, Math.min(0, currentTranslate.current + deltaX));
    setTranslateX(newTranslate);
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      if (!isDragging.current) return;
      isDragging.current = false;
      setDragging(false);

      // Snap: if swiped left past SWIPE_THRESHOLD, open. Else close.
      if (translateX < -SWIPE_THRESHOLD) {
        setTranslateX(-ACTION_WIDTH);
        onOpenChange(true);
      } else {
        setTranslateX(0);
        onOpenChange(false);
      }
    },
    [translateX, onOpenChange],
  );

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      {/* Delete action — rendered behind the card, wrapped in Popconfirm */}
      <div
        className="absolute top-0 right-0 bottom-0 flex flex-col items-center justify-center gap-1 rounded-r-2xl"
        style={{
          width: ACTION_WIDTH,
          backgroundColor: "var(--color-error)",
          color: "var(--color-on-error)",
        }}
      >
        <Popconfirm
          title="确定删除此行程吗？"
          content="删除后无法恢复。"
          placement="top"
          onConfirm={onConfirmDelete}
        >
          <div className="flex flex-col items-center justify-center gap-1 w-full h-full">
            <IconDelete size={20} />
            <span className="text-xs">{deleteLabel}</span>
          </div>
        </Popconfirm>
      </div>

      {/* Card content — slides over the delete action */}
      <div
        className="relative bg-color-surface-container-low"
        style={{
          ...transitionStyle,
          transform: `translateX(${translateX}px)`,
          touchAction: "pan-y",
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeableCard;
