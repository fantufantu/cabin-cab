import { Dayjs } from "dayjs";
import { createContext, useContext } from "react";

interface PlanContextValue {
  period: {
    duration: number;
    setDuration: (duration: number) => void;
    addDuration: () => void;
    subtractDuration: () => void;
    depatureAt: Dayjs;
    setDepatureAt: (date: Dayjs) => void;
  };
  districts: {
    selectedDistrictCodes: Set<string>;
    toggleDistrictCode: (districtCode: string) => void;
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
