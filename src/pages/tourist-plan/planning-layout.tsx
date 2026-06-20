import { Outlet } from "@aiszlab/bee/router";
import PlanContext from "../../contexts/plan.context";
import { toArray, useCounter, useEvent, useSessionStorageState, useUnmount } from "@aiszlab/relax";
import { useMemo, useState } from "react";
import dayjs from "dayjs";

const TouristPlanningLayout = () => {
  const [duration, { add, subtract, setCount: setDuration }] = useCounter(1, { min: 1 });
  const [depatureAt, setDepatureAt] = useState(() => dayjs().startOf("day"));

  const [cachedSelectedCityCodes, setCachedSelectedCityCodes] =
    useSessionStorageState("cabin-cab__plan__cities");

  const selectedCityCodes = useMemo(() => {
    return new Set<string>(JSON.parse(cachedSelectedCityCodes ?? "[]"));
  }, [cachedSelectedCityCodes]);

  const toggleCityCode = useEvent((cityCode: string) => {
    const next = new Set(selectedCityCodes);
    next.has(cityCode) ? next.delete(cityCode) : next.add(cityCode);
    setCachedSelectedCityCodes(JSON.stringify(toArray(next)));
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
    setCachedSelectedCityCodes(null);
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
        cities: {
          selectedCityCodes,
          toggleCityCode,
        },
      }}
    >
      <Outlet />
    </PlanContext.Provider>
  );
};

export default TouristPlanningLayout;
