import Itineraries from "../../components/tourist-plan/itinerary";
import { useTouristPlanContext } from "../../contexts/tourist-plan.context";

function TouristPlanItineraries() {
  const { touristPlan } = useTouristPlanContext();

  return (
    <Itineraries
      itineraries={touristPlan?.itineraries}
      isLoading={!touristPlan?.itineraries}
    />
  );
}

export default TouristPlanItineraries;
