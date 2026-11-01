import assert from "node:assert/strict";
import { after, test } from "node:test";
const { createServer } = await import(
  "../../../../node_modules/.pnpm/node_modules/vite/dist/node/index.js"
);
const server = await createServer({
  configFile: false,
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "silent",
});
after(() => server.close());
const route = await server.ssrLoadModule("/src/components/district-attraction-route/route.ts");

test("district stops exclude other districts and follow itinerary day and order without mutating inputs", () => {
  const attractions = [
    { code: "a", name: "景点甲", districtCode: "110101" },
    { code: "other", name: "其他城区", districtCode: "110102" },
    { code: "c", name: "未排行程景点", districtCode: "110101" },
    { code: "b", name: "景点乙", districtCode: "110101" },
  ];
  assert.deepEqual(
    route
      .getDistrictStops("110101", attractions, [
        { name: "景点甲", dayFrom: 2, sortOrder: 0 },
        { name: "景点乙", dayFrom: 1, sortOrder: 4 },
      ])
      .map((item) => item.code),
    ["b", "a", "c"],
  );
  assert.equal(attractions[0].code, "a");
});

test("POI matching rejects an ambiguous name or a match in another district", () => {
  const poi = { name: "景点甲", adcode: "110101", location: { lng: 116, lat: 39 } };
  assert.equal(route.matchAttractionPOI([poi], { name: "景点甲", districtCode: "110102" }), null);
  assert.equal(
    route.matchAttractionPOI([{ ...poi, name: "景点甲停车场" }], {
      name: "景点甲",
      districtCode: "110101",
    }),
    null,
  );
  assert.equal(
    route.matchAttractionPOI([poi, { ...poi, location: { lng: 117, lat: 39 } }], {
      name: "景点甲",
      districtCode: "110101",
    }),
    null,
  );
  assert.deepEqual(
    route.matchAttractionPOI([poi], { name: "景点甲", districtCode: "110101" }),
    [116, 39],
  );
});

test("route summaries use transit plans and reject absent or invalid route totals", () => {
  assert.deepEqual(route.getRouteSummary("transit", { plans: [{ time: 1800, distance: 4200 }] }), {
    time: 1800,
    distance: 4200,
  });
  assert.deepEqual(route.getRouteSummary("walking", { routes: [{ time: 900, distance: 1000 }] }), {
    time: 900,
    distance: 1000,
  });
  assert.equal(route.getRouteSummary("driving", { routes: [] }), null);
  assert.equal(route.getRouteSummary("walking", { routes: [{ time: NaN, distance: 200 }] }), null);
});

test("route geometry comes from actual road steps or the full transit path", () => {
  assert.deepEqual(
    route.getRoutePath("driving", {
      routes: [
        {
          steps: [
            {
              path: [
                [1, 2],
                [2, 3],
              ],
            },
            {
              path: [
                [2, 3],
                [3, 4],
              ],
            },
          ],
        },
      ],
    }),
    [
      [1, 2],
      [2, 3],
      [2, 3],
      [3, 4],
    ],
  );
  assert.deepEqual(
    route.getRoutePath("transit", {
      plans: [
        {
          path: [
            [1, 2],
            [3, 4],
          ],
        },
      ],
    }),
    [
      [1, 2],
      [3, 4],
    ],
  );
  assert.deepEqual(route.getRoutePath("walking", { routes: [] }), []);
});
