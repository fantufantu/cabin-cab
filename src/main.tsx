import { bootstrap } from "@aiszlab/bee";
import "./styles.css";
import Application from "./application";
import { lazy } from "react";

const Home = lazy(() => import("./pages/home"));
const TouristPlan = lazy(() => import("./pages/tourist-plan/[id]"));
const TouristPlanLayout = lazy(() => import("./pages/tourist-plan/layout"));
const TouristPlanCities = lazy(() => import("./pages/tourist-plan/cities"));
const TouristPlanPeriod = lazy(() => import("./pages/tourist-plan/period"));
const TouristPlanAttractions = lazy(() => import("./pages/tourist-plan/attractions"));

bootstrap({
  selectors: "#root",
  render: Application,
  routes: [
    {
      path: "/",
      element: <Home />,
    },

    {
      path: "tourist-plan",
      Component: TouristPlanLayout,
      children: [
        {
          path: ":id",
          element: <TouristPlan />,
        },
        {
          path: "cities",
          element: <TouristPlanCities />,
        },
        {
          path: "period",
          element: <TouristPlanPeriod />,
        },
        {
          path: "tourist-attractions",
          element: <TouristPlanAttractions />,
        },
      ],
    },
  ],
});
