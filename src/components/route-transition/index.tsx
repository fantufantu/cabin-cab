import { useLocation, useNavigationType } from "@aiszlab/bee/router";
import { useState } from "react";
import { ScrollContext, TransitionContext } from "./context";
import { advanceNavigation, createNavigation } from "./navigation";
import AnimatedOutlet from "./outlet";

export default function RouteTransitionLayout() {
  const location = useLocation();
  const action = useNavigationType();
  const historyIndex = window.history.state?.idx as number | undefined;
  const [navigation, setNavigation] = useState(() => createNavigation(location, historyIndex));
  const [scrollPositions] = useState(() => new Map<string, number>());
  let current = navigation;

  if (navigation.location.key !== location.key) {
    current = advanceNavigation(navigation, location, action, historyIndex);
    setNavigation(current);
  }

  return (
    <ScrollContext.Provider value={scrollPositions}>
      <TransitionContext.Provider value={current.transition}>
        <AnimatedOutlet root />
      </TransitionContext.Provider>
    </ScrollContext.Provider>
  );
}
