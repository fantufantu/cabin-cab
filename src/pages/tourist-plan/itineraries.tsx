import Itineraries from "../../components/tourist-plan/itinerary";
import { useDetailPlanContext } from "../../contexts/detail-plan.context";

function TouristPlanItineraries() {
  const { touristPlan } = useDetailPlanContext();

  return (
    <Itineraries
      itineraries={touristPlan?.itineraries}
      isLoading={!touristPlan?.itineraries}
    />
  );
}

export default TouristPlanItineraries;
