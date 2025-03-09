import { bootstrap } from "@aiszlab/bee";
import "./styles.css";
import Application from "./application";
import { lazy } from "react";
import Tasks from "./pages/tasks";

const Home = lazy(() => import("./pages/home"));

bootstrap({
  selectors: "#root",
  render: Application,
  routes: [
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/tasks",
      element: <Tasks />,
    },
  ],
});
