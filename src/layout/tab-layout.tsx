import { NavLink, Outlet, useLocation } from "@aiszlab/bee/router";
import { useTheme } from "musae";
import { AccountCircle, RocketLaunch, WbSunny } from "musae/icons";
import EventBusContext, { Handlers } from "../contexts/event-bus.context";
import { useMemo, useRef } from "react";

const TABS = [
  {
    key: "home",
    label: "首页",
    icon: WbSunny,
    to: "/",
    match: (pathname: string) => pathname === "/",
  },
  {
    key: "travel",
    label: "旅行",
    icon: RocketLaunch,
    to: "/tourist-plan/list",
    match: (pathname: string) => pathname === "/tourist-plan/list",
  },
  {
    key: "profile",
    label: "我的",
    icon: AccountCircle,
    to: "/profile",
    match: (pathname: string) => pathname === "/profile",
  },
] as const;

const TabLayout = () => {
  const { colors } = useTheme();
  const location = useLocation();
  const handlersRef = useRef<Handlers>(new Map());

  const _eventBusContextValue = useMemo(
    () => ({
      handlersRef,
    }),
    [handlersRef],
  );

  return (
    <EventBusContext.Provider value={_eventBusContextValue}>
      <div className="pb-24">
        <Outlet />
      </div>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-around py-2 safe-pb-4 border-t"
        style={{
          backgroundColor: colors["surface-container-low"],
          borderColor: colors.outline,
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
    </EventBusContext.Provider>
  );
};

export default TabLayout;
