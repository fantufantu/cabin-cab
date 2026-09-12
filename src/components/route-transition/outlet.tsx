import { UNSAFE_LocationContext as LocationContext, useOutlet } from "@aiszlab/bee/router";
import { AnimatePresence } from "framer-motion";
import { useContext } from "react";
import { useReducedMotion } from "../../utils/reduced-motion.util";
import { TransitionContext } from "./context";
import { routeGroup } from "./navigation";
import Page from "./page";
import styles from "./style.module.css";

export default function AnimatedOutlet({ root = false }: { root?: boolean }) {
  const locationContext = useContext(LocationContext);
  const outlet = useOutlet();
  const direction = useContext(TransitionContext);
  const reducedMotion = useReducedMotion();
  const key = root ? routeGroup(locationContext.location.pathname) : locationContext.location.pathname;

  return (
    <div className={root ? styles.viewport : styles.stack} data-route-transition={direction}>
      <AnimatePresence initial={false} custom={reducedMotion ? "none" : direction}>
        {/* Retain the resolved outlet and location together. A live <Outlet /> would
            switch the exiting page's content/params to the destination mid-animation. */}
        <LocationContext.Provider key={key} value={locationContext}>
          <Page root={root} direction={reducedMotion ? "none" : direction}>
            {outlet}
          </Page>
        </LocationContext.Provider>
      </AnimatePresence>
    </div>
  );
}
