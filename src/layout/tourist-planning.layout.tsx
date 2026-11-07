import { Outlet, useLocation } from "@aiszlab/bee/router";
import PlanContext from "../contexts/tourist-planning.context";
import { toArray, useCounter, useEvent, useSessionStorageState, useUnmount } from "@aiszlab/relax";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import TouristPlanHeader from "../components/tourist-plan/header";
import TouristPlanFooter from "../components/tourist-plan/footer";
import {
  getTouristPlanningFlowStep,
  TOURIST_PLANNING_FLOW,
} from "../constants/tourist-planning.constant";

const TouristPlanningLayout = () => {
  const { pathname } = useLocation();
  const currentStep = Array.from(TOURIST_PLANNING_FLOW.values()).find(
    ({ path }) => path === pathname,
  );
  const step = currentStep?.step ?? getTouristPlanningFlowStep("districts").step;
  const [headerContainer, setHeaderContainer] = useState<HTMLDivElement | null>(null);
  const [footerContainer, setFooterContainer] = useState<HTMLDivElement | null>(null);
  const [duration, { add, subtract, setCount: setDuration }] = useCounter(1, { min: 1 });
  const [depatureAt, setDepatureAt] = useState(() => dayjs().startOf("day"));

  const [cachedSelectedDistrictCodes, setCachedSelectedDistrictCodes] =
    useSessionStorageState("cabin-cab__plan__districts");

  const selectedDistrictCodes = useMemo(() => {
    return new Set<string>(JSON.parse(cachedSelectedDistrictCodes ?? "[]"));
  }, [cachedSelectedDistrictCodes]);

  const setSelectedDistrictCodes = useEvent((districtCodes: Set<string>) => {
    setCachedSelectedDistrictCodes(JSON.stringify(toArray(districtCodes)));
  });

  const addDuration = () => {
    add();
  };

  const subtractDuration = () => {
    subtract();
  };

  // 上下文卸载时，清除缓存数据
  useUnmount(() => {
    setDuration(1);
    setDepatureAt(() => dayjs().startOf("day"));
    setCachedSelectedDistrictCodes(null);
  });

  return (
    <PlanContext.Provider
      value={{
        headerContainer,
        footerContainer,
        period: {
          duration,
          setDuration,
          addDuration,
          subtractDuration,
          depatureAt,
          setDepatureAt,
        },
        districts: {
          selectedDistrictCodes,
          setSelectedDistrictCodes,
        },
      }}
    >
      <div className="min-h-screen flex flex-col bg-color-surface">
        <TouristPlanHeader step={step} contentRef={setHeaderContainer} />
        <Outlet />
        <TouristPlanFooter contentRef={setFooterContainer} />
      </div>
    </PlanContext.Provider>
  );
};

export default TouristPlanningLayout;
