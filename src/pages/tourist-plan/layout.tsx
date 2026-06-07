import { Outlet } from "@aiszlab/bee/router";
import PlanContext from "../../contexts/plan.context";
import { toArray, useCounter, useEvent, useSessionStorageState, useUnmount } from "@aiszlab/relax";
import { useMemo, useState } from "react";
import dayjs from "dayjs";

const TouristPlan = () => {
  const [duration, { add, subtract, setCount: setDuration }] = useCounter(1, { min: 1 });
  const [depatureAt, setDepatureAt] = useState(() => dayjs().startOf("day"));

  const [cachedSelectedAdcodes, setCachedSelectedAdcodes] =
    useSessionStorageState("cabin-cab__plan__cities");

  const selectedAdcodes = useMemo(() => {
    return new Set<string>(JSON.parse(cachedSelectedAdcodes ?? "[]"));
  }, [cachedSelectedAdcodes]);

  const toggleAdcode = useEvent((adcode: string) => {
    const next = new Set(selectedAdcodes);
    next.has(adcode) ? next.delete(adcode) : next.add(adcode);
    setCachedSelectedAdcodes(JSON.stringify(toArray(next)));
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
    setCachedSelectedAdcodes(null);
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
          selectedAdcodes,
          toggleAdcode,
        },
      }}
    >
      <Outlet />
    </PlanContext.Provider>
  );
};

export default TouristPlan;
