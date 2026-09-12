import { useLocation, useNavigationType } from "@aiszlab/bee/router";
import { motion, useIsPresent, usePresenceData, type Variants } from "framer-motion";
import { Suspense, useContext, useLayoutEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "../../utils/reduced-motion.util";
import { ScrollContext } from "./context";
import type { PageTransition } from "./navigation";
import styles from "./style.module.css";

const timing = { duration: 0.3, ease: [0.22, 0.68, 0, 1] as const };
const variants: Variants = {
  enter: (direction: PageTransition) => ({
    x: direction === "forward" ? "100%" : direction === "backward" ? "-25%" : 0,
    opacity: direction === "fade" ? 0 : 1,
  }),
  center: (direction: PageTransition) => ({
    x: 0,
    opacity: 1,
    transition: direction === "none" ? { duration: 0 } : timing,
  }),
  exit: (direction: PageTransition) => ({
    x: direction === "forward" ? "-25%" : direction === "backward" ? "100%" : 0,
    opacity: direction === "fade" ? 0 : 1,
    transition: direction === "none" ? { duration: 0 } : timing,
  }),
};

export default function Page({
  children,
  root,
  direction,
}: {
  children: ReactNode;
  root: boolean;
  direction: PageTransition;
}) {
  const present = useIsPresent();
  const exitDirection = usePresenceData() as PageTransition;
  const scroller = useRef<HTMLDivElement>(null);
  const scrollContent = useRef<HTMLDivElement>(null);
  const restoringScroll = useRef(false);
  const scrollPositions = useContext(ScrollContext);
  const location = useLocation();
  const action = useNavigationType();
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const element = scroller.current;
    const content = scrollContent.current;
    if (!root || !element || !content) return;
    const offset = action === "POP" ? (scrollPositions.get(location.key) ?? 0) : 0;
    let observer: ResizeObserver | undefined;
    const stop = () => {
      restoringScroll.current = false;
      observer?.disconnect();
    };
    const restore = () => {
      element.scrollTop = offset;
      if (Math.abs(element.scrollTop - offset) < 1) stop();
    };
    restoringScroll.current = true;
    restore();
    // Lazy modules and API results can arrive after the first layout. Retry once
    // the content is tall enough, but never fight a user's own scrolling.
    if (restoringScroll.current && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(restore);
      observer.observe(content);
    }
    const events = ["pointerdown", "touchstart", "wheel", "keydown"] as const;
    events.forEach((event) => element.addEventListener(event, stop, { passive: true }));
    return () => {
      stop();
      events.forEach((event) => element.removeEventListener(event, stop));
    };
  }, [root, location.key, action, scrollPositions]);

  return (
    <motion.div
      className={root ? styles.page : styles.content}
      data-route-page={root ? "root" : "content"}
      data-present={present}
      inert={!present}
      aria-hidden={!present || undefined}
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      // Keep fixed descendants anchored to this viewport, including after the animation.
      transformTemplate={
        root
          ? (_, generated) => (generated === "none" ? "translateX(0px)" : generated)
          : undefined
      }
      style={{ zIndex: present ? 1 : exitDirection === "backward" ? 2 : 0 }}
    >
      <div
        ref={scroller}
        className={root ? styles.scroller : undefined}
        onScroll={
          root
            ? (event) => {
                if (!restoringScroll.current) {
                  scrollPositions.set(location.key, event.currentTarget.scrollTop);
                }
              }
            : undefined
        }
      >
        <div ref={scrollContent}>
          <Suspense
            fallback={
              <div className={styles.loading} role="status">
                正在加载页面…
              </div>
            }
          >
            {children}
          </Suspense>
        </div>
      </div>
      {!reducedMotion && (
        <motion.div
          className={styles.shade}
          aria-hidden="true"
          initial={{ opacity: direction === "backward" ? 0.12 : 0 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: exitDirection === "forward" ? 0.12 : 0 }}
          transition={timing}
        />
      )}
    </motion.div>
  );
}
