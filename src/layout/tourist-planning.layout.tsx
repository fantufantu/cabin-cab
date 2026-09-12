import AnimatedOutlet from "../components/route-transition/outlet";
import PlanContext from "../contexts/tourist-planning.context";
import { toArray, useCounter, useEvent, useSessionStorageState, useUnmount } from "@aiszlab/relax";
import { useMemo, useState } from "react";
import dayjs from "dayjs";

const TouristPlanningLayout = () => {
  const [duration, { add, subtract, setCount: setDuration }] = useCounter(1, { min: 1 });
  const [depatureAt, setDepatureAt] = useState(() => dayjs().startOf("day"));

  const [cachedSelectedDistrictCodes, setCachedSelectedDistrictCodes] =
    useSessionStorageState("cabin-cab__plan__districts");

  const selectedDistrictCodes = useMemo(() => {
    return new Set<string>(JSON.parse(cachedSelectedDistrictCodes ?? "[]"));
  }, [cachedSelectedDistrictCodes]);

  const toggleDistrictCode = useEvent((districtCode: string) => {
    const next = new Set(selectedDistrictCodes);
    next.has(districtCode) ? next.delete(districtCode) : next.add(districtCode);
    setCachedSelectedDistrictCodes(JSON.stringify(toArray(next)));
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
          toggleDistrictCode,
        },
      }}
    >
      <AnimatedOutlet />
    </PlanContext.Provider>
  );
};

export default TouristPlanningLayout;
