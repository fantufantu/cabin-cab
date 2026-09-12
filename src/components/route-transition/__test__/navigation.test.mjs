import assert from "node:assert/strict";
import { test } from "node:test";
import { createNavigation, advanceNavigation, routeGroup } from "../navigation.ts";

const location = (pathname, key) => ({ pathname, key });

test("push, browser back, and browser forward have distinct directions", () => {
  let state = createNavigation(location("/", "home"));
  state = advanceNavigation(state, location("/tourist-planning/districts", "cities"), "PUSH");
  assert.equal(state.transition, "forward");
  state = advanceNavigation(state, location("/tourist-planning/period", "period"), "PUSH");
  assert.equal(state.transition, "forward");
  state = advanceNavigation(state, location("/tourist-planning/districts", "cities"), "POP");
  assert.equal(state.transition, "backward");
  state = advanceNavigation(state, location("/tourist-planning/period", "period"), "POP");
  assert.equal(state.transition, "forward");
});

test("tab switches and replacement redirects fade without implying stack navigation", () => {
  let state = createNavigation(location("/", "home"));
  state = advanceNavigation(state, location("/profile", "profile"), "PUSH");
  assert.equal(state.transition, "fade");
  state = advanceNavigation(state, location("/login", "login"), "PUSH");
  assert.equal(state.transition, "forward");
  state = advanceNavigation(state, location("/", "redirect"), "REPLACE");
  assert.equal(state.transition, "fade");
});

test("the detail back link slides right even though it pushes the list URL", () => {
  const state = advanceNavigation(
    createNavigation(location("/tourist-plan/123", "detail")),
    location("/tourist-plan/list", "list"),
    "PUSH",
  );
  assert.equal(state.transition, "backward");
});

test("detail tabs fade and wizard steps share a persistent layout identity", () => {
  const state = advanceNavigation(
    createNavigation(location("/tourist-plan/123", "proposal")),
    location("/tourist-plan/123/itineraries", "itineraries"),
    "PUSH",
  );
  assert.equal(state.transition, "fade");
  assert.equal(routeGroup("/tourist-planning/districts"), routeGroup("/tourist-planning/period"));
  assert.notEqual(routeGroup("/tourist-plan/123"), routeGroup("/tourist-plan/456"));
});

test("same-page URL updates do not animate or remount the page", () => {
  const state = advanceNavigation(
    createNavigation(location("/profile", "first")),
    location("/profile", "query-change"),
    "PUSH",
  );
  assert.equal(state.transition, "none");
});

test("a new push after back discards the abandoned forward entries", () => {
  let state = createNavigation(location("/", "home"));
  state = advanceNavigation(state, location("/login", "login"), "PUSH");
  state = advanceNavigation(state, location("/", "home"), "POP");
  state = advanceNavigation(state, location("/tourist-planning/districts", "cities"), "PUSH");
  assert.deepEqual(state.keys, ["home", "cities"]);
});

test("browser history indices distinguish unseen forward entries after a reload", () => {
  const state = advanceNavigation(
    createNavigation(location("/tourist-planning/districts", "cities"), 2),
    location("/tourist-planning/period", "period"),
    "POP",
    3,
  );
  assert.equal(state.transition, "forward");
});
