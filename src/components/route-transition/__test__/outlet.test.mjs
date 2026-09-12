import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import React, { act, lazy, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Window } from "../../../../node_modules/.pnpm/node_modules/happy-dom/lib/index.js";
import { createServer } from "../../../../node_modules/.pnpm/node_modules/vite/dist/node/index.js";

let server;
let browserWindow;
let RouteTransitionLayout;
let AnimatedOutlet;
let createMemoryRouter, RouterProvider, useLocation;

before(async () => {
  browserWindow = new Window({ url: "http://localhost/" });
  for (const name of ["window", "document", "HTMLElement", "Element", "SVGElement", "navigator"]) {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      value: name === "window" ? browserWindow : browserWindow[name],
    });
  }
  globalThis.requestAnimationFrame = browserWindow.requestAnimationFrame.bind(browserWindow);
  globalThis.cancelAnimationFrame = browserWindow.cancelAnimationFrame.bind(browserWindow);
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  server = await createServer({
    appType: "custom",
    esbuild: { jsx: "automatic" },
    logLevel: "silent",
    server: { middlewareMode: true },
    resolve: { alias: {
      "@aiszlab/bee/router": new URL("../../../../node_modules/@aiszlab/bee/dist/router.mjs", import.meta.url).pathname,
    } },
    ssr: { noExternal: ["@aiszlab/bee"] },
  });
  ({ default: RouteTransitionLayout } = await server.ssrLoadModule(
    "/src/components/route-transition/index.tsx",
  ));
  ({ default: AnimatedOutlet } = await server.ssrLoadModule(
    "/src/components/route-transition/outlet.tsx",
  ));
  ({ createMemoryRouter, RouterProvider, useLocation } = await server.ssrLoadModule(
    "/node_modules/@aiszlab/bee/dist/router.mjs",
  ));
});

after(async () => {
  await server?.close();
  await browserWindow?.happyDOM.close();
});

test("nested transitions retain wizard state and freeze the outgoing location", async () => {
  let mounts = 0;
  let unmounts = 0;
  function Wizard() {
    const [duration, setDuration] = useState(1);
    useEffect(() => {
      mounts += 1;
      return () => { unmounts += 1; };
    }, []);
    return React.createElement(React.Fragment, null,
      React.createElement("button", { onClick: () => setDuration(7) }, `${duration} days`),
      React.createElement(AnimatedOutlet),
    );
  }
  function Screen() {
    return React.createElement("p", null, useLocation().pathname);
  }
  const router = createMemoryRouter([{
    Component: RouteTransitionLayout,
    children: [{
      path: "tourist-planning",
      Component: Wizard,
      children: [
        { path: "districts", Component: Screen },
        { path: "period", Component: Screen },
        { path: "attractions", Component: Screen },
      ],
    }],
  }], { initialEntries: ["/tourist-planning/districts"] });
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  await act(async () => root.render(React.createElement(RouterProvider, { router })));
  await act(async () => container.querySelector("button").click());
  await act(async () => router.navigate("/tourist-planning/period"));

  assert.equal(mounts, 1);
  assert.equal(unmounts, 0);
  assert.equal(container.querySelector("button").textContent, "7 days");
  const oldPage = container.querySelector('[data-route-page="content"][data-present="false"]');
  assert.ok(oldPage, "the previous page stays mounted during its exit");
  assert.equal(oldPage.textContent, "/tourist-planning/districts");
  assert.ok(oldPage.hasAttribute("inert"));
  assert.equal(oldPage.getAttribute("aria-hidden"), "true");
  assert.equal(container.querySelector('[data-route-page="content"][data-present="true"]').textContent,
    "/tourist-planning/period");

  await act(async () => router.navigate("/tourist-planning/attractions"));
  await act(async () => router.navigate(-1));
  await act(async () => new Promise((resolve) => setTimeout(resolve, 450)));
  assert.equal(container.querySelectorAll('[data-route-page="content"]').length, 1);
  assert.equal(container.querySelector('[data-route-page="content"]').textContent,
    "/tourist-planning/period");
  assert.equal(mounts, 1);
  assert.equal(unmounts, 0);

  await act(async () => root.unmount());
  router.dispose();
  container.remove();
  assert.equal(unmounts, 1);
});

test("reduced motion switches pages without horizontal movement or an exit delay", async () => {
  browserWindow.happyDOM.settings.device.prefersReducedMotion = "reduce";
  const router = createMemoryRouter([{
    Component: RouteTransitionLayout,
    children: [
      { path: "/", element: React.createElement("p", null, "Home") },
      { path: "/login", element: React.createElement("p", null, "Login") },
    ],
  }]);
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  await act(async () => root.render(React.createElement(RouterProvider, { router })));
  await act(async () => router.navigate("/login"));
  await act(async () => new Promise((resolve) => setTimeout(resolve, 30)));
  assert.equal(container.textContent, "Login");
  assert.equal(container.querySelectorAll('[data-route-page="root"]').length, 1);
  assert.doesNotMatch(container.innerHTML, /translateX\((-?25|100)%\)/);
  await act(async () => root.unmount());
  router.dispose();
  container.remove();
  browserWindow.happyDOM.settings.device.prefersReducedMotion = "no-preference";
});

test("lazy destinations show a local loading state and keep the old page snapshot", async () => {
  let resolvePage;
  const Login = lazy(() => new Promise((resolve) => { resolvePage = resolve; }));
  const router = createMemoryRouter([{
    Component: RouteTransitionLayout,
    children: [
      { path: "/", element: React.createElement("p", null, "Home") },
      { path: "/login", Component: Login },
    ],
  }]);
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  await act(async () => root.render(React.createElement(RouterProvider, { router })));
  await act(async () => router.navigate("/login"));
  assert.equal(container.querySelector('[data-present="false"]').textContent, "Home");
  assert.ok(container.querySelector('[data-present="true"] [role="status"]'));
  await act(async () => resolvePage({ default: () => React.createElement("p", null, "Login") }));
  assert.equal(container.querySelector('[data-present="true"]').textContent, "Login");
  await act(async () => root.unmount());
  router.dispose();
  container.remove();
});
