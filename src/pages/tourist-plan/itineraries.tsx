import Itineraries from "../../components/tourist-plan/itinerary";
import { useTouristPlanContext } from "../../contexts/tourist-plan.context";

function TouristPlanItineraries() {
  const { touristPlan } = useTouristPlanContext();
  const isEmpty = (touristPlan?.itineraries ?? []).length === 0;

  return <Itineraries itineraries={touristPlan?.itineraries} isLoading={isEmpty} />;
}

export default TouristPlanItineraries;
