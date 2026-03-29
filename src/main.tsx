import { bootstrap } from "@aiszlab/bee";
import "./styles.css";
import Application from "./application";
import { lazy } from "react";

const Home = lazy(() => import("./pages/home"));
const Plan = lazy(() => import("./pages/plan"));
const PlanCities = lazy(() => import("./pages/plan/cities"));
const PlanPeriod = lazy(() => import("./pages/plan/period"));
const TouristAttractions = lazy(() => import("./pages/plan/tourist-attractions"));

bootstrap({
  selectors: "#root",
  render: Application,
  routes: [
    {
      path: "/",
      element: <Home />,
    },

    {
      path: "plan",
      Component: Plan,
      children: [
        {
          path: "cities",
          element: <PlanCities />,
        },
        {
          path: "period",
          element: <PlanPeriod />,
        },
        {
          path: "tourist-attractions",
          element: <TouristAttractions />,
        },
      ],
    },
  ],
});
