import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { createRequire } from "node:module";
import { join } from "node:path";
import assert from "node:assert/strict";
import { after, afterEach, before, beforeEach, test } from "node:test";
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
    code: "330000",
    name: "浙江省",
    level: "province",
    parentCode: "",
    image: "https://example.com/zhejiang.jpg",
  },
  {
    code: "330100",
    name: "杭州市",
    level: "city",
    parentCode: "330000",
    image: "https://example.com/hangzhou.jpg",
  },
  {
    code: "110000",
    name: "北京市",
    level: "province",
    parentCode: "",
    image: "https://example.com/beijing.jpg",
  },
  {
    code: "110100",
    name: "北京市",
    level: "city",
    parentCode: "110000",
    image: "https://example.com/beijing.jpg",
  },
  {
    code: "110101",
    name: "东城区",
    image: "https://example.com/dongcheng.jpg",
  },
  {
    code: "110102",
    name: "西城区",
    image: "https://example.com/xicheng.jpg",
  },
];

const require = createRequire(import.meta.url);
globalThis.__districtTestUsing = require("@aiszlab/relax/react").using;
const cacheDir = await mkdtemp(join(tmpdir(), "cabin-cab-test-"));

let server;
let browserWindow;
let root;
const relaxHooks = new URL("../../../../../node_modules/@aiszlab/relax/dist/hooks/", import.meta.url).pathname;

before(async () => {
  server = await createServer({
    appType: "custom",
    configFile: false,
    cacheDir,
    esbuild: { jsx: "automatic" },
    logLevel: "silent",
    server: { middlewareMode: true },
    ssr: { noExternal: ["@aiszlab/relax", "@aiszlab/bee", "musae"] },
    plugins: [
      {
        name: "district-page-test-dependencies",
        enforce: "pre",
        resolveId(source) {
          if (source === "@aiszlab/relax/react") return "\0district-test:store";
          if (source === "@aiszlab/relax") return "\0district-test:relax";
          if (source === "@aiszlab/relax/class-name") return "\0district-test:class-name";
          if (source === "@aiszlab/bee/router") return "\0district-test:router";
          if (source === "musae") return "\0district-test:musae";
          if (source === "musae/icons") return "\0district-test:icons";
          if (source.endsWith("/utils/geolocation.util")) return "\0district-test:geolocation";
          if (source.endsWith("/api/district.api")) return "\0district-test:district-api";
          if (source === "../../api/amap.api" || source === "../api/amap.api") return "\0district-test:amap-api";
          if (source.endsWith("/api/location.api")) return "\0district-test:location";
          if (source === "../../../components/tourist-plan/header") return "\0district-test:header";
          if (source === "../../../components/tourist-plan/footer") return "\0district-test:footer";
          if (source === "../../../components/district") return "\0district-test:district-card";
        },
        load(id) {
          if (id === "\0district-test:store") return "export const using = globalThis.__districtTestUsing;";
          if (id === "\0district-test:class-name") {
            return `
              export const stringify = (...values) => values.filter(Boolean).join(" ");
            `;
          }

          if (id === "\0district-test:relax") {
            return `
              export { useToggleable } from "${relaxHooks}use-toggleable.mjs";
              export { useRequest } from "${relaxHooks}use-request.mjs";
              export const toArray = Array.from;
              export const useEvent = (handler) => handler;
              export const useBoolean = () => [false, { turnOn: () => {}, turnOff: () => {} }];
            `;
          }

          if (id === "\0district-test:router") {
            return "export const useNavigate = () => () => {};";
          }

          if (id === "\0district-test:geolocation") {
            return `
              export class GeolocationError extends Error {}
              export const getCurrentPosition = async () => ({ latitude: 0, longitude: 0 });
            `;
          }

          if (id === "\0district-test:district-api") {
            return "export const queryDistricts = async () => globalThis.__districts;";
          }

          if (id === "\0district-test:amap-api") {
            return "export const getAmapCredential = async () => { if (globalThis.__amapCredential) return globalThis.__amapCredential(); throw new Error('Unavailable'); };";
          }

          if (id === "\0district-test:location") {
            return "export const reverseGeocode = async () => null;";
          }

          if (id === "\0district-test:musae") {
            return `
              import React from "react";
              export const Checkbox = ({ checked, onChange }) =>
                React.createElement("button", {
                  type: "button",
                  role: "checkbox",
                  "aria-checked": checked,
                  onClick: () => onChange?.(),
                }, checked ? "已选" : "未选");
              export const Button = ({ children, disabled, onClick, prefix, suffix }) =>
                React.createElement("button", { disabled, onClick }, prefix, children, suffix);
              export const BottomSheet = ({ children }) => React.createElement("div", null, children);
              export const Input = ({ label, placeholder, onClick, onChange, value }) =>
                React.createElement("input", { "aria-label": label, placeholder, onClick, onChange, value });
              export const Menu = ({ items, onClick }) =>
                React.createElement("div", null, items?.map((item) =>
                  React.createElement("div", {
                    key: item.key,
                    "data-menu-key": item.key,
                    onClick: () => onClick?.(item.key),
                  },
                    React.createElement("span", null, item.key),
                    React.createElement("span", { onClick: (event) => event.stopPropagation() }, item.leading),
                    item.label,
                    item.trailing,
                  )
                ));
              export const Message = { error: () => {}, success: () => {} };
              export const Typography = {
                Title: ({ children }) => React.createElement("h2", null, children),
                Body: ({ children }) => React.createElement("p", null, children),
                Label: ({ children }) => React.createElement("label", null, children),
              };
              export const Divider = () => React.createElement("hr");
              export const IconButton = ({ children, onClick }) =>
                React.createElement("button", { onClick }, children);
              export const Search = React.forwardRef(({ placeholder }, ref) => {
                const inputRef = React.useRef(null);
                React.useImperativeHandle(ref, () => ({
                  focus: () => inputRef.current?.focus(),
                }));
                return React.createElement("input", { ref: inputRef, "aria-label": placeholder });
              });
              export const Tag = ({ children, closable, onClose }) =>
                React.createElement(
                  "span",
                  { "data-closable": closable || undefined },
                  children,
                  closable && React.createElement("button", { "aria-label": "移除" + children, onClick: onClose }, "移除"),
                );
            `;
          }

          if (id === "\0district-test:icons") {
            return `
              import React from "react";
              const Icon = () => React.createElement("span", { "aria-hidden": "true" });
              export const IconAdd = Icon;
              export const IconAddLocationAlt = Icon;
              export const IconCheck = Icon;
              export const IconCheckCircle = Icon;
              export const IconKeyboardArrowLeft = Icon;
              export const IconKeyboardArrowRight = Icon;
              export const IconLocationOn = Icon;
              export const IconClose = Icon;
              export const IconLocationCity = Icon;
              export const IconMyLocation = Icon;
            `;
          }

          if (id === "\0district-test:header") {
            return `import React from "react"; export default ({ title, subTitle }) => React.createElement("header", null, title, subTitle);`;
          }

          if (id === "\0district-test:footer") {
            return `import React from "react"; export default ({ children }) => React.createElement("footer", null, children);`;
          }

          if (id === "\0district-test:district-card") {
            return `import React from "react"; export default ({ item, onClick }) => React.createElement("button", { onClick: () => onClick(item.code) }, item.name);`;
          }
        },
      },
    ],
  });
});

after(async () => {
  await server.close();
  await rm(cacheDir, { recursive: true, force: true });
});

beforeEach(() => {
  globalThis.__districts = DISTRICTS;
  browserWindow = new Window({ url: "http://localhost/tourist-planning/districts" });
  Object.defineProperties(globalThis, {
    document: { configurable: true, value: browserWindow.document },
    HTMLElement: { configurable: true, value: browserWindow.HTMLElement },
    navigator: { configurable: true, value: browserWindow.navigator },
    window: { configurable: true, value: browserWindow },
  });
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(async () => {
  if (root) await act(async () => root.unmount());
  root = undefined;
  await browserWindow.close();
  delete globalThis.__districts;
});

async function renderDistrictPage(selectedDistrictCodes = new Set()) {
  const [{ default: PlanContext }, { default: PlanDistricts }] = await Promise.all([
    server.ssrLoadModule("/src/contexts/tourist-planning.context.ts"),
    server.ssrLoadModule("/src/pages/tourist-planning/districts/index.tsx"),
  ]);

  const container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  const PageProvider = () => {
    const [selected, setSelected] = React.useState(selectedDistrictCodes);
    return React.createElement(
      PlanContext.Provider,
      {
        value: {
          districts: {
            selectedDistrictCodes: selected,
            setSelectedDistrictCodes: setSelected,
          },
          period: {},
        },
      },
      React.createElement(PlanDistricts),
    );
  };
  await act(async () => root.render(React.createElement(PageProvider)));
  await act(async () => [...container.querySelectorAll("button")].find((button) => button.textContent.includes("添加目的地")).click());
  return container.innerHTML;
}

test("shows selected cities as removable items and completes with the selected count", async () => {
  const html = await renderDistrictPage(new Set(["110100"]));

  assert.match(html, /支持选择多个城市/);
  assert.match(html, /已选城市/);
  assert.match(html, /data-closable="true"[^>]*>北京市/);
  assert.match(html, /完成（1）/);
  assert.doesNotMatch(html, />下一步</);
  const removeButton = document.querySelector('[aria-label="移除北京市"]');
  assert.ok(removeButton);
  await act(async () => removeButton.click());
  assert.equal(document.querySelector('[aria-label="移除北京市"]'), null);
  assert.equal(document.querySelector("footer button").textContent, "完成（1）");
  await act(async () => [...document.querySelectorAll("button")].find((button) => button.textContent === "确认（0）").click());
  const completeButton = document.querySelector("footer button");
  assert.equal(completeButton.textContent, "完成（0）");
  assert.equal(completeButton.disabled, true);
});

test("groups districts by administrative level and hides cities until drilling down", async () => {
  const html = await renderDistrictPage();

  assert.match(html, /全部省份和城市/);
  assert.match(html, /北京市/);
  assert.doesNotMatch(html, />东城区</);
});

test("page selection stores only leaves and syncs parent and child checkbox state", async () => {
  const [{ default: PlanContext }, { default: PlanDistricts }] = await Promise.all([
    server.ssrLoadModule("/src/contexts/tourist-planning.context.ts"),
    server.ssrLoadModule("/src/pages/tourist-planning/districts/index.tsx"),
  ]);
  const container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  const selectedRef = { current: new Set() };
  const PageProvider = () => {
    const [selected, setSelected] = React.useState(new Set());
    selectedRef.current = selected;
    return React.createElement(
      PlanContext.Provider,
      {
        value: {
          districts: {
            selectedDistrictCodes: selected,
            setSelectedDistrictCodes: (codes) => {
              setSelected(new Set(codes));
            },
          },
          period: {},
        },
      },
      React.createElement(PlanDistricts),
    );
  };

  await act(async () => root.render(React.createElement(PageProvider)));
  await act(async () => [...container.querySelectorAll("button")].find((button) => button.textContent.includes("添加目的地")).click());
  const provinceRow = container.querySelector('[data-menu-key="330000"]');
  assert.ok(provinceRow);
  const provinceDrillDown = [...provinceRow.querySelectorAll("button")].find((button) =>
    button.textContent.includes("城市"),
  );
  assert.ok(provinceDrillDown);
  await act(async () => provinceDrillDown.click());

  const parentRow = container.querySelector('[data-menu-key="330100"]');
  assert.ok(parentRow);
  const parentCheckbox = parentRow.querySelector('[role="checkbox"]');
  assert.ok(parentCheckbox);
  await act(async () => parentCheckbox.click());

  assert.deepEqual([...selectedRef.current], []);
  const confirm = [...container.querySelectorAll("button")].find((button) => button.textContent === "确认（1）");
  assert.ok(confirm);
  await act(async () => confirm.click());
  assert.deepEqual([...selectedRef.current], ["330100"]);
  assert.equal(parentRow.querySelector('[role="checkbox"]').getAttribute("aria-checked"), "true");

  const selectedParentCheckbox = parentRow.querySelector('[role="checkbox"]');
  await act(async () => selectedParentCheckbox.click());
  assert.deepEqual([...selectedRef.current], ["330100"]);
  await act(async () => [...container.querySelectorAll("button")].find((button) => button.textContent.includes("添加目的地")).click());
  assert.ok(container.querySelector('[aria-label="移除杭州市"]'));
});

test("exposes each city card as an accessible multi-select toggle", async () => {
  const { default: District } = await server.ssrLoadModule("/src/components/district/index.tsx");

  const selectedHtml = renderToStaticMarkup(
    React.createElement(District, {
      item: DISTRICTS.find(({ code }) => code === "110000"),
      isSelected: true,
      onClick: () => {},
    }),
  );
  const unselectedHtml = renderToStaticMarkup(
    React.createElement(District, {
      item: DISTRICTS.find(({ code }) => code === "330100"),
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

test("route preview reorders cities and keeps the remaining route after removal", async () => {
  await renderDistrictPage(new Set(["330100", "110100"]));
  const route = document.querySelector('[aria-label="城市路线预览"]');
  assert.ok(route);
  const cityNames = () => [...route.querySelectorAll("ol li")].map((item) => item.textContent);
  assert.match(cityNames()[0], /杭州市/);
  await act(async () => document.querySelector('[aria-label="上移北京市"]').click());
  assert.match(cityNames()[0], /北京市/);
  assert.match(cityNames()[1], /杭州市/);
  assert.equal(document.querySelector('[aria-label="上移北京市"]').disabled, true);
  await act(async () => document.querySelector('[aria-label="移除北京市"]').click());
  assert.equal(cityNames().length, 2);
  await act(async () => [...document.querySelectorAll("button")].find((button) => button.textContent === "确认（1）").click());
  assert.equal(cityNames().length, 1);
  assert.match(cityNames()[0], /杭州市/);
});


test("global AMap store retries failures, merges concurrent requests and reuses the key", async () => {
  const { useAmapStore } = await server.ssrLoadModule("/src/stores/amap.store.ts");
  assert.equal(await useAmapStore.state.loadApiKey(), null);
  assert.equal(useAmapStore.state.apiKey, null);
  assert.equal(useAmapStore.state.apiSecret, null);

  let calls = 0;
  let resolveCredential;
  globalThis.__amapCredential = () => {
    calls += 1;
    return new Promise((resolve) => { resolveCredential = resolve; });
  };
  try {
    const first = useAmapStore.state.loadApiKey();
    const second = useAmapStore.state.loadApiKey();
    assert.equal(first, second);
    assert.equal(calls, 1);
    resolveCredential({ apiKey: "test-map-key", apiSecret: "test-map-secret" });
    assert.deepEqual(await Promise.all([first, second]), ["test-map-key", "test-map-key"]);
    assert.equal(useAmapStore.state.apiKey, "test-map-key");
    assert.equal(useAmapStore.state.apiSecret, "test-map-secret");
    assert.equal(await useAmapStore.state.loadApiKey(), "test-map-key");
    assert.equal(calls, 1);
  } finally {
    delete globalThis.__amapCredential;
  }
});

test("city sheet opens by ref and emits city objects only when confirmed", async () => {
  const { default: CitySelectSheet } = await server.ssrLoadModule("/src/components/city-select-sheet/index.tsx");
  const ref = React.createRef();
  const changes = [];
  const city = DISTRICTS.find(({ code }) => code === "330100");
  const container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(React.createElement(CitySelectSheet, {
    ref,
    value: [city],
    onChange: (cities) => changes.push(cities),
  })));
  await act(async () => ref.current.open());
  await act(async () => container.querySelector('[aria-label="移除杭州市"]').click());
  assert.deepEqual(changes, []);
  await act(async () => ref.current.open());
  assert.ok(container.querySelector('[aria-label="移除杭州市"]'));
  await act(async () => [...container.querySelectorAll("button")].find((button) => button.textContent === "确认（1）").click());
  assert.deepEqual(changes, [[city]]);
});


test("step page shows confirmed city names outside the sheet", async () => {
  await renderDistrictPage(new Set(["330100", "110100"]));
  const summary = document.querySelector('[aria-label="已确认的目的城市"]');
  assert.ok(summary);
  assert.match(summary.textContent, /已选城市（2）/);
  assert.match(summary.textContent, /1\. 杭州市/);
  assert.match(summary.textContent, /2\. 北京市/);
  await act(async () => document.querySelector('[aria-label="移除北京市"]').click());
  assert.match(summary.textContent, /北京市/);
  await act(async () => [...document.querySelectorAll("button")].find((button) => button.textContent === "确认（1）").click());
  assert.match(summary.textContent, /已选城市（1）/);
  assert.doesNotMatch(summary.textContent, /北京市/);
});
