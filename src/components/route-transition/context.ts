import { createContext } from "react";
import type { PageTransition } from "./navigation";

export const TransitionContext = createContext<PageTransition>("none");
export const ScrollContext = createContext(new Map<string, number>());
