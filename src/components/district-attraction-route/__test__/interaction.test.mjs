import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { Window } from "../../../../node_modules/.pnpm/node_modules/happy-dom/lib/index.js";
const { createServer } = await import(
  "../../../../node_modules/.pnpm/node_modules/vite/dist/node/index.js"
);
let server, root, page, Context, browser;
const requests = [];
const maps = [];
const services = [];
let missingMiddle = false;
let noTransit = false;
let deferWalking = false;
let pendingWalking;
const stops = [
  { code: "a", name: "甲景点", districtCode: "110101" },
  { code: "b", name: "乙景点", districtCode: "110101" },
  { code: "c", name: "丙景点", districtCode: "110101" },
];
const makeService = (mode) =>
  class {
    constructor(options) {
      this.map = options.map;
      this.options = options;
      services.push(this);
    }
    clear() {
      this.cleared = true;
    }
    search(origin, destination, callback) {
      requests.push({ mode, origin, destination, options: this.options });
      if (deferWalking && mode === "walking") {
        pendingWalking = () =>
          callback("complete", {
            routes: [
              {
                time: 3600,
                distance: 4000,
                steps: [{ path: [origin, [116.5, 39.2], destination] }],
              },
            ],
          });
        return;
      }
      queueMicrotask(() =>
        callback(
          noTransit && mode === "transit" ? "no_data" : "complete",
          mode === "transit"
            ? {
                plans: [
                  {
                    time: 1800,
                    distance: 5000,
                    path: [origin, [116.5, 39.2], destination],
                    segments: [{ instruction: "乘坐地铁1号线" }],
                  },
                ],
              }
            : {
                routes: [
                  {
                    time: mode === "walking" ? 3600 : 600,
                    distance: 4000,
                    steps: [
                      { path: [origin, [116.5, 39.2], destination], instruction: "沿道路前行" },
                    ],
                  },
                ],
              },
        ),
      );
    }
  };
before(async () => {
  browser = new Window();
  Object.assign(globalThis, {
    window: browser,
    document: browser.document,
    HTMLElement: browser.HTMLElement,
    HTMLButtonElement: browser.HTMLButtonElement,
    getComputedStyle: browser.getComputedStyle.bind(browser),
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  globalThis.__routeSDK = {
    plugin: (_names, done) => done(),
    Map: class {
      constructor() {
        this.overlays = [];
        maps.push(this);
      }
      add(overlays) {
        this.overlays.push(...overlays);
      }
      setFitView() {}
      destroy() {
        this.destroyed = true;
      }
    },
    Marker: class {},
    Pixel: class {},
    Polyline: class {
      constructor(options) {
        this.path = options.path;
      }
    },
    DistrictSearch: class {
      search(name, callback) {
        callback("complete", {
          districtList: [{ name, adcode: "110101", center: { lng: 116, lat: 39 } }],
        });
      }
    },
    PlaceSearch: class {
      search(name, callback) {
        const index = stops.findIndex((stop) => stop.name === name);
        callback("complete", {
          poiList: {
            pois:
              missingMiddle && index === 1
                ? []
                : [
                    {
                      name,
                      adcode: "110101",
                      citycode: "010",
                      location: { lng: 116 + index, lat: 39 },
                    },
                  ],
          },
        });
      }
    },
    Driving: makeService("driving"),
    Transfer: makeService("transit"),
    Walking: makeService("walking"),
  };
  server = await createServer({
    configFile: false,
    esbuild: { jsx: "automatic" },
    appType: "custom",
    logLevel: "silent",
    server: { middlewareMode: true },
    plugins: [
      {
        name: "routing-sdk-boundary",
        enforce: "pre",
        resolveId(source) {
          if (source === "../route-map/amap" || source === "./amap")
            return source === "../route-map/amap" ? "\0route-sdk" : undefined;
        },
        load(id) {
          if (id === "\0route-sdk")
            return "export const loadAMap = async () => globalThis.__routeSDK; export const getCityCenter = async () => [116, 39];";
        },
      },
    ],
  });
  page = (await server.ssrLoadModule("/src/pages/tourist-plan/route.tsx")).default;
  Context = (await server.ssrLoadModule("/src/contexts/tourist-plan.context.ts")).default;
  root = createRoot(document.createElement("div"));
});
after(async () => {
  await act(async () => root?.unmount());
  await server?.close();
  browser?.happyDOM.abort();
});
const flush = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
const click = async (text) => {
  const button = [...document.querySelectorAll("button")].find((button) =>
    button.textContent.includes(text),
  );
  assert.ok(button, `button ${text} exists`);
  await act(async () => button.click());
  await flush();
};
async function mount(attractions = stops) {
  const host = document.createElement("div");
  document.body.replaceChildren(host);
  await act(async () => root.unmount());
  root = createRoot(host);
  await act(async () =>
    root.render(
      React.createElement(
        Context.Provider,
        {
          value: {
            touristPlan: {
              districts: [{ code: "110101", name: "东城区" }],
              attractions,
              itineraries: [],
            },
          },
        },
        React.createElement(page),
      ),
    ),
  );
  await flush();
}

test("district drilldown switches all three routing modes and cleans maps when returning", async () => {
  await mount();
  await click("查看景点路线");
  assert.match(document.body.textContent, /自驾全程约 8.0 公里 · 20 分钟/);
  await click("公共交通");
  assert.match(document.body.textContent, /公共交通全程约 10.0 公里 · 1 小时/);
  assert.match(document.body.textContent, /乘坐地铁1号线/);
  assert.equal(requests[2].options.city, "010");
  await click("步行");
  assert.match(document.body.textContent, /步行全程约 8.0 公里 · 2 小时/);
  assert.deepEqual(
    requests.map((request) => request.mode),
    ["driving", "driving", "transit", "transit", "walking", "walking"],
  );
  assert.ok(
    maps
      .at(-1)
      .overlays.filter((overlay) => overlay.path)
      .every((overlay) => overlay.path.length === 3),
  );
  await click("返回城市总览");
  assert.ok(maps.slice(0, -1).every((map) => map.destroyed));
  assert.ok(services.every((service) => service.cleared));
});

test("a missing middle stop never causes a shortcut or a misleading total", async () => {
  missingMiddle = true;
  requests.length = 0;
  // New names bypass successful location caching from the previous district visit.
  const changed = stops.map((stop, index) => ({
    ...stop,
    code: `new-${index}`,
    name: `${stop.name}新`,
  }));
  const sdk = globalThis.__routeSDK;
  sdk.PlaceSearch = class {
    search(name, callback) {
      const index = changed.findIndex((stop) => stop.name === name);
      callback("complete", {
        poiList: {
          pois:
            index === 1
              ? []
              : [
                  {
                    name,
                    adcode: "110101",
                    citycode: "010",
                    location: { lng: 116 + index, lat: 39 },
                  },
                ],
        },
      });
    }
  };
  await mount(changed);
  await click("查看景点路线");
  assert.match(document.body.textContent, /无法确认该景点位置/);
  assert.equal(requests.length, 0);
  assert.doesNotMatch(document.body.textContent, /自驾全程约/);
});

test("no public transit result displays unavailable legs and allows switching modes", async () => {
  noTransit = true;
  await mount();
  await click("查看景点路线");
  await click("公共交通");
  assert.match(document.body.textContent, /暂无可用路线/);
  assert.doesNotMatch(document.body.textContent, /公共交通全程约/);
  await click("自驾");
  assert.match(document.body.textContent, /自驾全程约/);
});

test("switching modes ignores a late response from the previous mode", async () => {
  noTransit = false;
  await mount();
  await click("查看景点路线");
  deferWalking = true;
  await click("步行");
  const previousMap = maps.at(-1);
  assert.equal(typeof pendingWalking, "function");
  await click("自驾");
  await act(async () => pendingWalking());
  await flush();
  assert.equal(previousMap.destroyed, true);
  assert.equal(previousMap.overlays.filter((overlay) => overlay.path).length, 0);
  assert.match(document.body.textContent, /自驾全程约/);
  deferWalking = false;
});

test("districts with no selected attractions display an empty state", async () => {
  await mount([]);
  await click("查看景点路线");
  assert.match(document.body.textContent, /本次计划未选择该城区的景点/);
  assert.equal(document.querySelector('[aria-label="出行方式"]'), null);
});
