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
    code: "330000",
    name: "浙江省",
    image: "https://example.com/zhejiang.jpg",
  },
  {
    code: "330100",
    name: "杭州市",
    image: "https://example.com/hangzhou.jpg",
  },
  {
    code: "110000",
    name: "北京市",
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
          if (source === "../../../utils/geolocation.util") return "\0district-test:geolocation";
          if (source === "../../../api/location.api") return "\0district-test:location";
          if (source === "../../../components/tourist-plan/header") return "\0district-test:header";
          if (source === "../../../components/tourist-plan/footer") return "\0district-test:footer";
          if (source === "../../../components/district") return "\0district-test:district-card";
        },
        load(id) {
          if (id === "\0district-test:class-name") {
            return `
              export const stringify = (...values) => values.filter(Boolean).join(" ");
            `;
          }

          if (id === "\0district-test:relax") {
            return `
              export { useToggleable } from "/Users/tutu/workspace/cabin-cab/node_modules/@aiszlab/relax/dist/hooks/use-toggleable.mjs";
              export const toArray = Array.from;
              export const useEvent = (handler) => handler;
              export const useRequest = () => globalThis.__districtRequestState;
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
                  ref: (element) => {
                    if (element) element.__triggerChange = onChange;
                  },
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
            setSelectedDistrictCodes: () => {},
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
  assert.match(html, /完成（1）/);
  assert.doesNotMatch(html, />下一步</);
});

test("groups districts by administrative level and allows selecting a parent before drilling down", async () => {
  const html = await renderDistrictPage();

  assert.match(html, /全部省份和城市/);
  assert.match(html, /北京市/);
  assert.doesNotMatch(html, />东城区</);
});

test("page selection stores only leaves and syncs parent and child checkbox state", async () => {
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
  const provinceRow = container.querySelector('[data-menu-key="330000"]');
  assert.ok(provinceRow);
  const provinceDrillDown = [...provinceRow.querySelectorAll("button")].find((button) =>
    button.textContent.includes("下级"),
  );
  assert.ok(provinceDrillDown);
  await act(async () => provinceDrillDown.click());

  const parentRow = container.querySelector('[data-menu-key="330100"]');
  assert.ok(parentRow);
  const parentCheckbox = parentRow.querySelector('[role="checkbox"]');
  assert.ok(parentCheckbox);
  await act(async () => parentCheckbox.__triggerChange());

  assert.deepEqual([...selectedRef.current], ["330100"]);
  assert.equal(parentRow.querySelector('[role="checkbox"]').getAttribute("aria-checked"), "true");

  const selectedParentCheckbox = parentRow.querySelector('[role="checkbox"]');
  await act(async () => selectedParentCheckbox.__triggerChange());
  assert.deepEqual([...selectedRef.current], []);

  await act(async () => root.unmount());
  await browserWindow.close();
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
