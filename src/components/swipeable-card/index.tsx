import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { IconDelete } from "musae/icons";
import { Popconfirm } from "musae";

const SWIPE_THRESHOLD = 20;
const ACTION_WIDTH = 80;
const SPRING_DURATION = 300;

interface SwipeableCardProps {
  /** Called after user confirms deletion via Popconfirm */
  onConfirmDelete: () => void;
  deleteLabel?: string;
  children: ReactNode;
  className?: string;
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return reduced;
}

const SwipeableCard = ({
  onConfirmDelete,
  deleteLabel = "删除",
  children,
  className = "",
}: SwipeableCardProps) => {
  const [translateX, setTranslateX] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
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
      currentTranslate.current = isOpen ? -ACTION_WIDTH : 0;
      isDragging.current = false;
      setDragging(false);
    },
    [isOpen],
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
      setIsOpen(true);
    } else {
      setTranslateX(0);
      setIsOpen(false);
    }
  }, [translateX]);

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
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeableCard;
