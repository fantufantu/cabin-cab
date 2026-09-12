export type PageTransition = "forward" | "backward" | "fade" | "none";
type Location = { pathname: string; key: string };
type Action = "PUSH" | "POP" | "REPLACE";

export interface NavigationState {
  location: Location;
  keys: string[];
  cursor: number;
  historyIndex?: number;
  transition: PageTransition;
}

export function routeGroup(pathname: string): string {
  if (["/", "/profile", "/tourist-plan/list"].includes(pathname)) return "main";
  if (pathname.startsWith("/tourist-planning/")) return "planning";
  const plan = pathname.match(/^\/tourist-plan\/([^/]+)/);
  return plan ? `plan:${plan[1]}` : pathname;
}

export function createNavigation(location: Location, historyIndex?: number): NavigationState {
  return { location, keys: [location.key], cursor: 0, historyIndex, transition: "none" };
}

export function advanceNavigation(
  previous: NavigationState,
  location: Location,
  action: Action,
  historyIndex?: number,
): NavigationState {
  const knownIndex = previous.keys.indexOf(location.key);
  const delta =
    historyIndex !== undefined && previous.historyIndex !== undefined
      ? historyIndex - previous.historyIndex
      : knownIndex - previous.cursor;
  let transition: PageTransition = action === "POP" && delta <= 0 ? "backward" : "forward";
  const from = routeGroup(previous.location.pathname);
  const to = routeGroup(location.pathname);

  if (previous.location.pathname === location.pathname) {
    transition = "none";
  } else if (action === "REPLACE" || (from === to && to !== "planning")) {
    transition = "fade";
  } else if (action === "PUSH" && to === "main") {
    // Existing back buttons use navigate('/tourist-plan/list'), not navigate(-1).
    transition = "backward";
  }

  let keys = previous.keys;
  let cursor = previous.cursor;
  if (action === "PUSH") {
    keys = [...keys.slice(0, cursor + 1), location.key];
    cursor += 1;
  } else if (action === "REPLACE") {
    keys = keys.map((key, index) => (index === cursor ? location.key : key));
  } else if (knownIndex !== -1) {
    cursor = knownIndex;
  } else if (delta > 0) {
    keys = [...keys, location.key];
    cursor = keys.length - 1;
  } else {
    keys = [location.key, ...keys];
    cursor = 0;
  }

  return { location, keys, cursor, historyIndex, transition };
}
