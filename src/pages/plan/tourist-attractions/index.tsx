import { useNavigate } from "@aiszlab/bee/router";
import PlanHeader from "../../../components/plan/header";
import { Button, Checkbox, IconButton, Tabs } from "musae";
import { CalendarToday, KeyboardArrowLeft, KeyboardArrowRight } from "musae/icons";
import { usePlanContext } from "../../../contexts/plan.context";
import useAmapStore from "../../../stores/amap.store";
import { isUndefined, toArray, useEvent, useMounted } from "@aiszlab/relax";
import PlanFooter from "../../../components/plan/footer";
import { Key, useState } from "react";
import TouristAttractionCard from "../../../components/tourist-attraction/card";

function TouristAttraction() {
  const { queryTouristAttractions, districts, queryDistricts, touristAttractions } = useAmapStore();
  const {
    cities: { selectedAdcodes },
  } = usePlanContext();
  const navigate = useNavigate();
  const [currentAdcode, setCurrentAdcode] = useState(() => selectedAdcodes.values().next().value);
  const [selectedPoiIds, setSelectedPoiIds] = useState(new Set<string>());

  const goBack = () => {
    navigate(-1);
  };

  useMounted(() => {
    Promise.allSettled([
      districts.size === 0 && queryDistricts(),
      queryTouristAttractions(currentAdcode?.toString()),
    ]);
  });

  const selectPoi = useEvent((poiId: string) => {
    setSelectedPoiIds((prev) => new Set(prev).add(poiId));
  });

  const deselectPoi = useEvent((poiId: string) => {
    setSelectedPoiIds((prev) => {
      const next = new Set(prev);
      next.delete(poiId);
      return next;
    });
  });

  return (
    <div>
      <PlanHeader step={3} title="景点" subTitle="选择您喜欢的景点" />

      <Tabs
        activeKey={currentAdcode}
        // @ts-expect-error 在省份选择tab场景下，所选key就是string
        onChange={setCurrentAdcode}
        items={toArray(selectedAdcodes).map((adcode) => {
          return {
            key: adcode,
            label: districts.get(adcode)?.name ?? adcode,
          };
        })}
      />

      <div className="flex flex-col gap-2 p-4">
        {!isUndefined(currentAdcode) &&
          toArray(touristAttractions.get(currentAdcode)?.values())?.map((poi) => (
            <TouristAttractionCard
              key={poi.id}
              poi={poi}
              checked={selectedPoiIds.has(poi.id)}
              onSelect={selectPoi}
              onDeselect={deselectPoi}
            />
          ))}
      </div>

      <PlanFooter className="flex items-center gap-3">
        <IconButton size="small" color="secondary" onClick={goBack}>
          <KeyboardArrowLeft />
        </IconButton>

        <Button className="flex-1" prefix={<CalendarToday />} suffix={<KeyboardArrowRight />}>
          确认天
        </Button>
      </PlanFooter>
    </div>
  );
}

export default TouristAttraction;
