import { createContext, useContext } from "react";
import { TouristPlan } from "../api/tourist-plan.types";

interface TouristPlanContextValue {
  touristPlan?: TouristPlan;
  setTouristPlan?: (touristPlan: TouristPlan) => void;
}

const TouristPlanContext = createContext<TouristPlanContextValue | null>(null);

const useTouristPlanContext = () => {
  const context = useContext(TouristPlanContext);

  if (!context) {
    throw new Error("useTouristPlanContext must be used within a TouristPlanContext.Provider");
  }

  return context;
};

export default TouristPlanContext;
export { useTouristPlanContext };
