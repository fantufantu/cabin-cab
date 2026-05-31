import { bootstrap } from "@aiszlab/bee";
import "./styles.css";
import Application from "./application";
import { lazy } from "react";
import PageTransitionLayout from "./layout/page-transition.layout";

const Home = lazy(() => import("./pages/home"));
const TouristPlan = lazy(() => import("./pages/tourist-plan/[id]"));
const TouristPlanLayout = lazy(() => import("./pages/tourist-plan/layout"));
const TouristPlanCities = lazy(() => import("./pages/tourist-plan/cities"));
const TouristPlanPeriod = lazy(() => import("./pages/tourist-plan/period"));
const TouristPlanAttractions = lazy(() => import("./pages/tourist-plan/attractions"));
const TouristPlanList = lazy(() => import("./pages/tourist-plan/list"));
const Login = lazy(() => import("./pages/login"));

bootstrap({
  selectors: "#root",
  render: Application,
  routes: [
    {
      Component: PageTransitionLayout,
      children: [
        {
          path: "",
          element: <Home />,
        },
        {
          path: "login",
          element: <Login />,
        },
        {
          path: "tourist-plan",
          children: [
            {
              path: "list",
              element: <TouristPlanList />,
            },
            {
              path: ":id",
              element: <TouristPlan />,
            },
            {
              Component: TouristPlanLayout,
              children: [
                {
                  path: "cities",
                  element: <TouristPlanCities />,
                },
                {
                  path: "period",
                  element: <TouristPlanPeriod />,
                },
                {
                  path: "attractions",
                  element: <TouristPlanAttractions />,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
});
