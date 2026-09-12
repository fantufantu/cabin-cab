import { NavLink, useLocation } from "@aiszlab/bee/router";
import AnimatedOutlet from "../components/route-transition/outlet";
import { Divider, useTheme } from "musae";
import { IconAccountCircle, IconRocketLaunch, IconWbSunny } from "musae/icons";

const TABS = [
  {
    key: "home",
    label: "首页",
    icon: IconWbSunny,
    to: "/",
    match: (pathname: string) => pathname === "/",
  },
  {
    key: "travel",
    label: "旅行",
    icon: IconRocketLaunch,
    to: "/tourist-plan/list",
    match: (pathname: string) => pathname === "/tourist-plan/list",
  },
  {
    key: "profile",
    label: "我的",
    icon: IconAccountCircle,
    to: "/profile",
    match: (pathname: string) => pathname === "/profile",
  },
] as const;

const MainLayout = () => {
  const { colors } = useTheme();
  const location = useLocation();

  return (
    <>
      <div className="pb-24">
        <AnimatedOutlet />
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50">
        <Divider />

        <nav
          className="flex justify-around py-2 safe-pb-4"
          style={{
            backgroundColor: colors["surface-container-low"],
          }}
        >
        {TABS.map(({ key, label, icon: Icon, to, match }) => {
          const isActive = match(location.pathname);

          return (
            <NavLink
              key={key}
              to={to}
              className="flex flex-col items-center gap-0.5 px-4 py-1 no-underline transition-colors"
            >
              <Icon size={24} color={isActive ? colors.primary : colors["on-surface"]} />
              <span
                className={`text-xs ${isActive ? "font-medium" : "font-normal"}`}
                style={{ color: isActive ? colors.primary : colors["on-surface"] }}
              >
                {label}
              </span>
            </NavLink>
          );
        })}
        </nav>
      </div>
    </>
  );
};

export default MainLayout;
