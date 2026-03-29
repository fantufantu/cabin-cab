import { Dayjs } from "dayjs";
import { createContext, useContext } from "react";

interface PlanContextValue {
  period: {
    dayCount: number;
    addDayCount: () => void;
    subtractDayCount: () => void;
    startFrom: Dayjs;
    setStartFrom: (date: Dayjs) => void;
  };
  cities: {
    selectedAdcodes: Set<string>;
    toggleAdcode: (adcode: string) => void;
  };
}

const PlanContext = createContext<PlanContextValue | null>(null);

const usePlanContext = () => {
  const planContext = useContext(PlanContext);

  if (!planContext) {
    throw new Error("usePlanContext must be used within a PlanContext.Provider");
  }

  return planContext;
};

export default PlanContext;
export { usePlanContext };
