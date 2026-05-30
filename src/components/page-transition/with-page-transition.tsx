import { type ReactNode, createElement } from "react";
import PageTransition from "./index";

interface RouteConfig {
  path?: string;
  element?: ReactNode;
  children?: RouteConfig[];
  Component?: React.ComponentType;
}

/**
 * Wrap a React element with PageTransition.
 */
function wrapElement(element: ReactNode): ReactNode {
  return createElement(PageTransition, null, element);
}

/**
 * Recursively process route config, wrapping each route's element
 * with PageTransition. Routes with only Component (layout shells)
 * are left untouched.
 */
function withPageTransition(routes: RouteConfig[]): RouteConfig[] {
  return routes.map((route) => ({
    ...route,
    element: route.element ? wrapElement(route.element) : route.element,
    children: route.children ? withPageTransition(route.children) : route.children,
  }));
}

export { withPageTransition };
