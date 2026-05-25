import { toArray, useMounted } from "@aiszlab/relax";
import useAmapStore from "../../../stores/amap.store";
import { Button, Search } from "musae";
import { useNavigate } from "@aiszlab/bee/router";
import { usePlanContext } from "../../../contexts/plan.context";
import City from "../../../components/city";
import TouristPlanHeader from "../../../components/tourist-plan/header";
import TouristPlanFooter from "../../../components/tourist-plan/footer";

const PlanCities = () => {
  const { queryDistricts, districts } = useAmapStore();
  const {
    cities: { selectedAdcodes, toggleAdcode },
  } = usePlanContext();
  const navigate = useNavigate();

  useMounted(() => {
    queryDistricts();
  });

  const nextStep = () => {
    navigate("/tourist-plan/period");
  };

  return (
    <div className="min-h-screen flex flex-col gap-4">
      <TouristPlanHeader
        title="选择目的城市"
        step={1}
        subTitle={`可多选，已选 ${selectedAdcodes.size} 个城市`}
      />

      <div className="mx-4">
        <Search />
      </div>

      <div className="mx-4 grid grid-cols-2 gap-3">
        {toArray(districts.values()).map((item) => {
          return (
            <City
              key={item.adcode}
              item={item}
              onClick={toggleAdcode}
              isSelected={selectedAdcodes.has(item.adcode)}
            />
          );
        })}
      </div>

      <TouristPlanFooter>
        {selectedAdcodes.size === 0 && <span>请至少选择一个城市</span>}

        {selectedAdcodes.size > 0 && (
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">
            已选择 {selectedAdcodes.size} 个城市：
            {toArray(selectedAdcodes).map((code, index) => {
              return (
                <span key={code}>
                  <span>{districts.get(code)?.name}</span>
                  {index < selectedAdcodes.size - 1 && <span>，</span>}
                </span>
              );
            })}
          </span>
        )}

        <Button
          className="ml-auto"
          size="small"
          onClick={nextStep}
          disabled={selectedAdcodes.size === 0}
        >
          下一步
        </Button>
      </TouristPlanFooter>
    </div>
  );
};

export default PlanCities;
