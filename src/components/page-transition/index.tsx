import { AnimatePresence, motion, type Easing } from "framer-motion";
import { useLocation, useNavigationType } from "@aiszlab/bee/router";
import type { ReactNode } from "react";

const VARIANTS = {
  PUSH: {
    initial: { x: "30%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-30%", opacity: 0 },
  },
  POP: {
    initial: { x: "-30%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "30%", opacity: 0 },
  },
} as const;

const TRANSITION = {
  x: { type: "tween" as const, duration: 0.3, ease: ["easeOut", "easeIn"] as Easing[] },
  opacity: { duration: 0.3 },
};

const PageTransition = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  const direction = navigationType === "POP" ? "POP" : "PUSH";
  const variants = VARIANTS[direction];

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={TRANSITION}
        style={{ height: "100%", overflow: "auto" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
export { withPageTransition } from "./with-page-transition";
