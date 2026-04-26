import { Outlet } from "@aiszlab/bee/router";
import PlanContext from "../../contexts/plan.context";
import { toArray, useCounter, useEvent, useSessionStorageState } from "@aiszlab/relax";
import { useMemo, useState } from "react";
import dayjs from "dayjs";

const TouristPlan = () => {
  const [duration, { add, subtract }] = useCounter(1, { min: 1 });
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

  return (
    <PlanContext.Provider
      value={{
        period: {
          duration,
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
