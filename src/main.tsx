import { bootstrap } from "@aiszlab/bee";
import "./styles.css";
import Application from "./application";
import { lazy } from "react";

const Home = lazy(() => import("./pages/home"));
const MainLayout = lazy(() => import("./layout/main.layout"));
const Profile = lazy(() => import("./pages/profile"));
const TouristPlanLayout = lazy(() => import("./layout/tourist-plan.layout"));
const TouristPlanProposal = lazy(() => import("./pages/tourist-plan/proposal"));
const TouristPlanItineraries = lazy(() => import("./pages/tourist-plan/itineraries"));
const TouristPlanningLayout = lazy(() => import("./layout/tourist-planning.layout"));
const TouristPlanDistricts = lazy(() => import("./pages/tourist-planning/districts"));
const TouristPlanPeriod = lazy(() => import("./pages/tourist-planning/period"));
const TouristPlanAttractions = lazy(() => import("./pages/tourist-planning/attractions"));
const TouristPlanList = lazy(() => import("./pages/tourist-plan/list"));
const Login = lazy(() => import("./pages/login"));

bootstrap({
  selectors: "#root",
  render: Application,
  routes: [
    {
      Component: MainLayout,
      children: [
        {
          index: true,
          element: <Home />,
        },
        {
          path: "profile",
          element: <Profile />,
        },
        {
          path: "tourist-plan/list",
          element: <TouristPlanList />,
        },
      ],
    },
    {
      path: "tourist-plan/:id",
      Component: TouristPlanLayout,
      children: [
        {
          index: true,
          element: <TouristPlanProposal />,
        },
        {
          path: "itineraries",
          element: <TouristPlanItineraries />,
        },
      ],
    },
    {
      path: "tourist-planning",
      Component: TouristPlanningLayout,
      children: [
        {
          path: "districts",
          element: <TouristPlanDistricts />,
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
    {
      path: "login",
      element: <Login />,
    },
  ],
});
