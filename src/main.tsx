import { bootstrap } from "@aiszlab/bee";
import "./styles.css";
import Application from "./application";
import { lazy } from "react";

const Home = lazy(() => import("./pages/home"));
const PlanCities = lazy(() => import("./pages/plan/cities"));

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
      children: [
        {
          path: "cities",
          element: <PlanCities />,
        },
      ],
    },
  ],
});
