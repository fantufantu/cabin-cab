import { bootstrap } from "@aiszlab/bee";
import "./styles.css";
import Application from "./application";
import { lazy } from "react";

const Home = lazy(() => import("./pages/home"));
const TouristPlanLayout = lazy(() => import("./pages/tourist-plan/layout"));
const TouristPlanProposal = lazy(() => import("./pages/tourist-plan/proposal"));
const TouristPlanItineraries = lazy(() => import("./pages/tourist-plan/itineraries"));
const TouristPlanItineraryEdit = lazy(() => import("./pages/tourist-plan/itinerary-edit"));
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
          Component: TouristPlanLayout,
          children: [
            {
              index: true,
              element: <TouristPlanProposal />,
            },
            {
              path: "itinerary",
              element: <TouristPlanItineraries />,
            },
            {
              path: "itinerary/:itineraryId/edit",
              element: <TouristPlanItineraryEdit />,
            },
          ],
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
  ],
});
