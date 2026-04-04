import { useNavigate } from "@aiszlab/bee/router";
import PlanHeader from "../../../components/plan/header";
import { Button, IconButton, Tabs } from "musae";
import { CalendarToday, KeyboardArrowLeft, KeyboardArrowRight } from "musae/icons";
import { usePlanContext } from "../../../contexts/plan.context";
import useAmapStore from "../../../stores/amap.store";
import { isUndefined, toArray, useMounted } from "@aiszlab/relax";
import PlanFooter from "../../../components/plan/footer";
import { Key, useState } from "react";

function TouristAttraction() {
  const { queryTouristAttractions, districts, queryDistricts } = useAmapStore();
  const {
    cities: { selectedAdcodes },
  } = usePlanContext();
  const navigate = useNavigate();
  const [currentAdcode, setCurrentAdcode] = useState<Key | undefined>(
    () => selectedAdcodes.values().next().value,
  );

  const goBack = () => {
    navigate(-1);
  };

  useMounted(() => {
    Promise.allSettled([
      districts.size === 0 && queryDistricts(),
      queryTouristAttractions(currentAdcode?.toString()),
    ]);
  });

  return (
    <div>
      <PlanHeader step={3} title="景点" subTitle="选择您喜欢的景点" />

      <Tabs
        activeKey={currentAdcode}
        onChange={setCurrentAdcode}
        items={toArray(selectedAdcodes).map((adcode) => {
          return {
            key: adcode,
            label: districts.get(adcode)?.name ?? adcode,
          };
        })}
      />

      <div className="mt-auto sticky bottom-0 flex items-center px-6 py-4 gap-3 bg-color-on-primary border-t border-color-outline">
        <IconButton size="small" color="secondary" onClick={goBack}>
          <KeyboardArrowLeft />
        </IconButton>

        <Button className="flex-1" prefix={<CalendarToday />} suffix={<KeyboardArrowRight />}>
          确认天
        </Button>
      </div>

      <PlanFooter></PlanFooter>
    </div>
  );
}

export default TouristAttraction;
