import { AnimatePresence, motion, type Easing } from "framer-motion";
import { useLocation, useNavigationType } from "@aiszlab/bee/router";
import type { ReactNode } from "react";

const VARIANTS = {
  PUSH: {
    initial: { x: "100%" },
    animate: { x: 0 },
    exit: { x: 0 },
  },
  POP: {
    initial: { x: 0 },
    animate: { x: 0 },
    exit: { x: "100%" },
  },
} as const;

const TRANSITION = {
  x: { type: "tween" as const, duration: 0.3, ease: ["easeOut", "easeIn"] as Easing[] },
};

const PageTransition = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  const direction = navigationType === "POP" ? "POP" : "PUSH";
  const variants = VARIANTS[direction];

  return (
    <div className="grid overflow-hidden">
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={pathname}
          className="[grid-area:1/1]"
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={TRANSITION}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PageTransition;
export { withPageTransition } from "./with-page-transition";
