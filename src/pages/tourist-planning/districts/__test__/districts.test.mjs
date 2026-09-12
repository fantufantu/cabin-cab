import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { Window } from "../../../../../node_modules/.pnpm/node_modules/happy-dom/lib/index.js";

const { createServer } = await import(
  "../../../../../node_modules/.pnpm/node_modules/vite/dist/node/index.js",
);

const DISTRICTS = [
  {
    code: "110000",
    name: "北京市",
    image: "https://example.com/beijing.jpg",
  },
  {
    code: "330100",
    name: "杭州市",
    image: "https://example.com/hangzhou.jpg",
  },
];

let server;

before(async () => {
  server = await createServer({
    appType: "custom",
    esbuild: { jsx: "automatic" },
    logLevel: "silent",
    server: { middlewareMode: true },
    ssr: { noExternal: ["@aiszlab/relax", "@aiszlab/bee", "musae"] },
    plugins: [
      {
        name: "district-page-test-dependencies",
        enforce: "pre",
        resolveId(source) {
          if (source === "@aiszlab/relax") return "\0district-test:relax";
          if (source === "@aiszlab/relax/class-name") return "\0district-test:class-name";
          if (source === "@aiszlab/bee/router") return "\0district-test:router";
          if (source === "musae") return "\0district-test:musae";
          if (source === "musae/icons") return "\0district-test:icons";
        },
        load(id) {
          if (id === "\0district-test:relax") {
            return `
              export const toArray = Array.from;
              export const useEvent = (handler) => handler;
              export const useRequest = () => globalThis.__districtRequestState;
            `;
          }

          if (id === "\0district-test:class-name") {
            return `
              export const stringify = (...values) => values.filter(Boolean).join(" ");
            `;
          }

          if (id === "\0district-test:router") {
            return "export const useNavigate = () => () => {};";
          }

          if (id === "\0district-test:musae") {
            return `
              import React from "react";
              export const Button = ({ children, disabled }) =>
                React.createElement("button", { disabled }, children);
              export const Divider = () => React.createElement("hr");
              export const IconButton = ({ children }) =>
                React.createElement("button", null, children);
              export const Search = React.forwardRef(({ placeholder }, ref) => {
                const inputRef = React.useRef(null);
                React.useImperativeHandle(ref, () => ({
                  focus: () => inputRef.current?.focus(),
                }));
                return React.createElement("input", { ref: inputRef, "aria-label": placeholder });
              });
              export const Tag = ({ children, closable, onClick }) =>
                React.createElement(
                  "span",
                  { "data-closable": closable || undefined, onClick },
                  children,
                );
            `;
          }

          if (id === "\0district-test:icons") {
            return `
              import React from "react";
              const Icon = () => React.createElement("span", { "aria-hidden": "true" });
              export const IconAdd = Icon;
              export const IconCheck = Icon;
              export const IconCheckCircle = Icon;
              export const IconKeyboardArrowLeft = Icon;
              export const IconKeyboardArrowRight = Icon;
              export const IconLocationOn = Icon;
            `;
          }
        },
      },
    ],
  });
});

after(async () => {
  await server.close();
});

beforeEach(() => {
  globalThis.__districtRequestState = {
    data: DISTRICTS,
    error: null,
    loading: false,
    run: async () => {},
  };
});

async function renderDistrictPage(selectedDistrictCodes = new Set()) {
  const [{ default: PlanContext }, { default: PlanDistricts }] = await Promise.all([
    server.ssrLoadModule("/src/contexts/tourist-planning.context.ts"),
    server.ssrLoadModule("/src/pages/tourist-planning/districts/index.tsx"),
  ]);

  return renderToStaticMarkup(
    React.createElement(
      PlanContext.Provider,
      {
        value: {
          districts: {
            selectedDistrictCodes,
            toggleDistrictCode: () => {},
          },
          period: {},
        },
      },
      React.createElement(PlanDistricts),
    ),
  );
}

test("shows selected cities as removable items and completes with the selected count", async () => {
  const html = await renderDistrictPage(new Set(["110000"]));

  assert.match(html, /支持选择多个城市/);
  assert.match(html, /已选城市/);
  assert.match(html, /data-closable="true"[^>]*>北京市/);
  assert.match(html, /继续添加/);
  assert.match(html, /完成（1）/);
  assert.doesNotMatch(html, />下一步</);
});

test("communicates loading, failure, and empty search-result states", async () => {
  globalThis.__districtRequestState = {
    data: null,
    error: null,
    loading: true,
    run: async () => {},
  };
  const loadingHtml = await renderDistrictPage();
  assert.match(loadingHtml, /正在加载城市/);

  globalThis.__districtRequestState = {
    data: null,
    error: new Error("offline"),
    loading: false,
    run: async () => {},
  };
  const errorHtml = await renderDistrictPage();
  assert.match(errorHtml, /城市加载失败/);
  assert.match(errorHtml, /重新加载/);

  globalThis.__districtRequestState = {
    data: [],
    error: null,
    loading: false,
    run: async () => {},
  };
  const emptyHtml = await renderDistrictPage();
  assert.match(emptyHtml, /没有找到相关城市/);
});

test("moves focus to city search when the user chooses to continue adding", async () => {
  const browserWindow = new Window({ url: "http://localhost/tourist-planning/districts" });
  Object.defineProperties(globalThis, {
    document: { configurable: true, value: browserWindow.document },
    HTMLElement: { configurable: true, value: browserWindow.HTMLElement },
    navigator: { configurable: true, value: browserWindow.navigator },
    window: { configurable: true, value: browserWindow },
  });
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;

  const [{ default: PlanContext }, { default: PlanDistricts }] = await Promise.all([
    server.ssrLoadModule("/src/contexts/tourist-planning.context.ts"),
    server.ssrLoadModule("/src/pages/tourist-planning/districts/index.tsx"),
  ]);
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(
      React.createElement(
        PlanContext.Provider,
        {
          value: {
            districts: {
              selectedDistrictCodes: new Set(["110000"]),
              toggleDistrictCode: () => {},
            },
            period: {},
          },
        },
        React.createElement(PlanDistricts),
      ),
    );
  });

  const continueAdding = [...document.querySelectorAll("span")].find(
    (element) => element.textContent === "继续添加",
  );
  assert.ok(continueAdding);
  continueAdding.click();
  assert.equal(document.activeElement?.getAttribute("aria-label"), "搜索城市");

  await act(async () => root.unmount());
  await browserWindow.close();
});

test("exposes each city card as an accessible multi-select toggle", async () => {
  const { default: District } = await server.ssrLoadModule("/src/components/district/index.tsx");

  const selectedHtml = renderToStaticMarkup(
    React.createElement(District, {
      item: DISTRICTS[0],
      isSelected: true,
      onClick: () => {},
    }),
  );
  const unselectedHtml = renderToStaticMarkup(
    React.createElement(District, {
      item: DISTRICTS[1],
      isSelected: false,
      onClick: () => {},
    }),
  );

  assert.match(selectedHtml, /^<button/);
  assert.match(selectedHtml, /aria-pressed="true"/);
  assert.match(selectedHtml, /aria-label="取消选择北京市"/);
  assert.match(unselectedHtml, /aria-pressed="false"/);
  assert.match(unselectedHtml, /aria-label="选择杭州市"/);
});
