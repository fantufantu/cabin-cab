import assert from "node:assert/strict";
import { after, test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "../../../../../node_modules/.pnpm/node_modules/vite/dist/node/index.js";

const server = await createServer({
  appType: "custom",
  ssr: { noExternal: ["@apollo/client", "@aiszlab/bee", "@aiszlab/relax", "musae"] },
  esbuild: { jsx: "automatic" },
  logLevel: "silent",
  server: { middlewareMode: true },
  plugins: [{
    name: "plan-list-test-dependencies",
    enforce: "pre",
    resolveId(source) {
      if (["@apollo/client/react", "@aiszlab/bee/router", "@aiszlab/relax", "musae", "musae/icons"].includes(source) || source.startsWith("../../../")) {
        return `\0plan-list-test:${encodeURIComponent(source)}`;
      }
    },
    load(id) {
      if (!id.startsWith("\0plan-list-test:")) return;
      const source = decodeURIComponent(id.slice("\0plan-list-test:".length));
      if (source === "@apollo/client/react") return `
        export const useLazyQuery = () => [() => {}, globalThis.__planQuery];
        export const useMutation = () => [() => {}];`;
      if (source === "@aiszlab/relax") return `
        export const useRequest = () => globalThis.__planRequest;
        export const useMounted = () => {};`;
      if (source === "@aiszlab/bee/router") return "export const useNavigate = () => () => {};";
      if (source === "musae") return `
        import React from 'react';
        export const Button = ({children}) => React.createElement('button', null, children);
        export const IconButton = Button;
        export const Tag = Button;
        export const Skeleton = () => React.createElement('div', {'data-skeleton': true});
        export const Message = {};`;
      if (source === "musae/icons") return "export const IconKeyboardArrowLeft = () => null; export const IconLocationOn = () => null;";
      if (source.endsWith("tourist-plan.api")) return "export const TOURIST_PLANS = {}; export const DELETE_TOURIST_PLAN = {};";
      if (source.endsWith("auth.store")) return "export const useAuthStore = () => ({myId: async () => 'guest'});";
      if (source.endsWith("event-bus.store")) return "export const EVENT_BUS_TOKENS = {}; export const useEventBusStore = () => ({});";
      if (source.endsWith("reduced-motion.util")) return "export const useReducedMotion = () => true;";
      return "export default ({children}) => children;";
    },
  }],
});
after(() => server.close());
const { default: List } = await server.ssrLoadModule("/src/pages/tourist-plan/list/index.tsx");

function render({ loading = false, called = true, requestLoading = false, items = [] } = {}) {
  globalThis.__planQuery = { loading, called };
  globalThis.__planRequest = { loading: requestLoading, data: { touristPlans: { items } } };
  return renderToStaticMarkup(React.createElement(List));
}

test("keeps skeletons visible while Apollo is pending after an earlier request finishes", () => {
  const html = render({ loading: true });
  assert.match(html, /data-skeleton/);
  assert.doesNotMatch(html, /还没有出行计划/);
});
test("shows skeletons before the first query starts", () => {
  assert.match(render({ called: false }), /data-skeleton/);
});
test("shows empty state only after an empty query completes", () => {
  const html = render();
  assert.match(html, /还没有出行计划/);
  assert.doesNotMatch(html, /data-skeleton/);
});
test("keeps existing plans visible during refresh", () => {
  const html = render({ loading: true, requestLoading: true, items: [{ id: "1", duration: 3, depatureAt: "2026-10-25", districts: [], attractions: [] }] });
  assert.match(html, /3/);
  assert.doesNotMatch(html, /data-skeleton|还没有出行计划/);
});
