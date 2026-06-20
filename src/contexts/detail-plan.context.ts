import { createContext, useContext } from "react";
import { TouristPlan } from "../api/tourist-plan.types";

interface DetailPlanContextValue {
  touristPlan?: TouristPlan;
}

const DetailPlanContext = createContext<DetailPlanContextValue | null>(null);

const useDetailPlanContext = () => {
  const context = useContext(DetailPlanContext);

  if (!context) {
    throw new Error("useDetailPlanContext must be used within a DetailPlanContext.Provider");
  }

  return context;
};

export default DetailPlanContext;
export { useDetailPlanContext };
