import { toArray, useMounted } from "@aiszlab/relax";
import useAmapStore from "../../../stores/amap.store";
import { Button, Search } from "musae";
import { useNavigate } from "@aiszlab/bee/router";
import { usePlanContext } from "../../../contexts/plan.context";
import City from "../../../components/plan/city";
import PlanHeader from "../../../components/plan/header";

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
    navigate("/plan/period");
  };

  return (
    <div className="flex flex-col gap-3">
      <PlanHeader
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

      <div className="sticky bottom-0 flex items-center px-6 py-4 bg-color-on-primary border-t border-color-outline">
        {selectedAdcodes.size === 0 && <span>请至少选择一个城市</span>}

        {selectedAdcodes.size > 0 && (
          <span>
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

        <Button className="ml-auto" size="small" onClick={nextStep}>
          下一步
        </Button>
      </div>
    </div>
  );
};

export default PlanCities;
