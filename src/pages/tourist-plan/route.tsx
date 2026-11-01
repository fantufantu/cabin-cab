import { useState } from "react";
import RouteMap from "../../components/route-map";
import DistrictAttractionRoute from "../../components/district-attraction-route";
import { getDistrictStops } from "../../components/district-attraction-route/route";
import { useTouristPlanContext } from "../../contexts/tourist-plan.context";

function TouristPlanRoute() {
  const { touristPlan } = useTouristPlanContext();
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const district = touristPlan?.districts.find((item) => item.code === selectedCode);

  if (district) {
    return (
      <DistrictAttractionRoute
        key={district.code}
        district={district}
        stops={getDistrictStops(
          district.code,
          touristPlan?.attractions ?? [],
          touristPlan?.itineraries ?? [],
        )}
        onBack={() => setSelectedCode(null)}
      />
    );
  }

  return <RouteMap cities={touristPlan?.districts ?? []} onSelectCity={setSelectedCode} />;
}

export default TouristPlanRoute;
