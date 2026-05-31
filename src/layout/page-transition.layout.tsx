import { AnimatePresence, motion, type Easing } from "framer-motion";
import { Outlet, useLocation, useNavigationType } from "@aiszlab/bee/router";

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
  x: { type: "tween" as const, duration: 0.3, ease: ["easeOut", "easeIn"] satisfies Easing[] },
};

function PageTransitionLayout() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  const direction = navigationType === "POP" ? "POP" : "PUSH";
  const variants = VARIANTS[direction];

  return (
    <AnimatePresence mode="sync" initial={false}>
      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={TRANSITION}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}

export default PageTransitionLayout;
