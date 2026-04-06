import { useNavigate } from "@aiszlab/bee/router";
import PlanHeader from "../../../components/plan/header";
import { Button, IconButton, Skeleton, Tabs, Tag } from "musae";
import { CalendarToday, KeyboardArrowLeft, KeyboardArrowRight } from "musae/icons";
import { usePlanContext } from "../../../contexts/plan.context";
import useAmapStore from "../../../stores/amap.store";
import {
  isUndefined,
  range,
  toArray,
  useEvent,
  useInfiniteScroll,
  useMounted,
} from "@aiszlab/relax";
import PlanFooter from "../../../components/plan/footer";
import { Key, useMemo, useState } from "react";
import TouristAttractionCard from "../../../components/tourist-attraction/card";

function TouristAttraction() {
  const { queryTouristAttractions, districts, queryDistricts, touristAttractions } = useAmapStore();
  const {
    cities: { selectedAdcodes },
  } = usePlanContext();
  const navigate = useNavigate();
  const [currentAdcode, setCurrentAdcode] = useState(() => selectedAdcodes.values().next().value);
  const { sentinelRef, viewportRef } = useInfiniteScroll<HTMLElement, HTMLDivElement>();
  const [selectedPoiTree, setSelectedPoiTree] = useState(() => new Map<string, Set<string>>());

  const currentTouristAttractions = useMemo(() => {
    if (isUndefined(currentAdcode)) return [];
    return toArray(touristAttractions.get(currentAdcode)?.values()) ?? [];
  }, [currentAdcode, touristAttractions]);

  const goBack = () => {
    navigate(-1);
  };

  useMounted(() => {
    Promise.allSettled([queryDistricts(), queryTouristAttractions(currentAdcode)]);
  });

  const selectPoi = useEvent((poiId: string) => {
    if (isUndefined(currentAdcode)) return;

    setSelectedPoiTree((prev) => {
      const next = new Map(prev);
      const selectedPoiIds = next.get(currentAdcode) ?? new Set();
      selectedPoiIds.add(poiId);
      next.set(currentAdcode, selectedPoiIds);
      return next;
    });
  });

  const deselectPoi = useEvent((poiId: string) => {
    if (isUndefined(currentAdcode)) return;

    setSelectedPoiTree((prev) => {
      const next = new Map(prev);
      const selectedPoiIds = next.get(currentAdcode) ?? new Set();
      selectedPoiIds.delete(poiId);
      next.set(currentAdcode, selectedPoiIds);
      return next;
    });
  });

  const changeDistrict = useEvent((activeKey: Key) => {
    const adcode = activeKey.toString();
    setCurrentAdcode(adcode);
    queryTouristAttractions(adcode);
  });

  return (
    <div ref={viewportRef}>
      <PlanHeader step={3} title="景点" subTitle="选择您喜欢的景点" />

      <Tabs
        activeKey={currentAdcode}
        onChange={changeDistrict}
        items={toArray(selectedAdcodes).map((adcode) => {
          return {
            key: adcode,
            label: (
              <span className="flex items-center">
                {districts.get(adcode)?.name ?? adcode}&nbsp;
                <Tag size="small" className="rounded-full">
                  {(!isUndefined(currentAdcode) && selectedPoiTree.get(currentAdcode)?.size) ?? 0}
                </Tag>
              </span>
            ),
          };
        })}
      />

      <div className="flex flex-col gap-2 p-4">
        {currentTouristAttractions.length === 0 &&
          range(1, 10).map((key) => {
            return <Skeleton key={key} className="h-20 rounded-lg" />;
          })}

        {currentTouristAttractions.length > 0 && (
          <>
            {currentTouristAttractions.map((poi) => (
              <TouristAttractionCard
                key={poi.id}
                poi={poi}
                checked={
                  !isUndefined(currentAdcode) && selectedPoiTree.get(currentAdcode)?.has(poi.id)
                }
                onSelect={selectPoi}
                onDeselect={deselectPoi}
              />
            ))}

            <span ref={sentinelRef} />
          </>
        )}
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
