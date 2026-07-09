import { bootstrap } from "@aiszlab/bee";
import "./styles.css";
import Application from "./application";
import { lazy } from "react";

const Home = lazy(() => import("./pages/home"));
const TabLayout = lazy(() => import("./layout/tab-layout"));
const Profile = lazy(() => import("./pages/profile"));
const TouristPlanLayout = lazy(() => import("./pages/tourist-plan/layout"));
const TouristPlanProposal = lazy(() => import("./pages/tourist-plan/proposal"));
const TouristPlanItineraries = lazy(() => import("./pages/tourist-plan/itineraries"));
const TouristPlanningLayout = lazy(() => import("./pages/tourist-planning/layout"));
const TouristPlanCities = lazy(() => import("./pages/tourist-planning/cities"));
const TouristPlanPeriod = lazy(() => import("./pages/tourist-planning/period"));
const TouristPlanAttractions = lazy(() => import("./pages/tourist-planning/attractions"));
const TouristPlanList = lazy(() => import("./pages/tourist-plan/list"));
const Login = lazy(() => import("./pages/login"));

bootstrap({
  selectors: "#root",
  render: Application,
  routes: [
    {
      Component: TabLayout,
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
    {
      path: "login",
      element: <Login />,
    },
  ],
});
