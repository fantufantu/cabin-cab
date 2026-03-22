import { Outlet } from "@aiszlab/bee/router";
import PlanContext from "../../contexts/plan.context";
import { useCounter } from "@aiszlab/relax";
import { useState } from "react";
import dayjs from "dayjs";

const Plan = () => {
  const [planDayCount, { add, subtract }] = useCounter(1, { min: 1 });
  const [selectedAdCodes, setSelectedAdCodes] = useState<Set<string>>(new Set());
  const [startFrom, setStartFrom] = useState(() => dayjs().startOf("day"));

  const toggleAdCode = (adcode: string) => {
    setSelectedAdCodes((prev) => {
      const next = new Set(prev);
      next.has(adcode) ? next.delete(adcode) : next.add(adcode);
      return next;
    });
  };

  const addDayCount = () => {
    add();
  };

  const subtractDayCount = () => {
    subtract();
  };

  return (
    <PlanContext.Provider
      value={{
        period: {
          dayCount: planDayCount,
          addDayCount,
          subtractDayCount,
          startFrom,
        },
        cities: {
          selectedAdCodes,
          toggleAdCode,
        },
      }}
    >
      <Outlet />
    </PlanContext.Provider>
  );
};

export default Plan;
