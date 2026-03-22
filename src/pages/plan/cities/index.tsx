import { toArray, useMounted } from "@aiszlab/relax";
import useAmapStore from "../../../stores/amap.store";
import { Button, Search } from "musae";
import styles from "./index.module.css";
import { stringify } from "@aiszlab/relax/class-name";
import { useNavigate } from "@aiszlab/bee/router";
import { usePlanContext } from "../../../contexts/plan.context";

const PlanCities = () => {
  const { queryDistricts, districts } = useAmapStore();
  const {
    cities: { selectedAdCodes, toggleAdCode },
  } = usePlanContext();
  const navigate = useNavigate();

  useMounted(() => {
    queryDistricts();
  });

  const nextStep = () => {
    navigate("/plan/period");
  };

  const prevStep = () => {
    navigate("/");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center shadow p-5">
        <div className="mr-auto">
          <h1>选择目的城市</h1>
          <span>可多选，已选 {selectedAdCodes.size} 个城市</span>
        </div>

        <span>1 / 4</span>
      </div>

      <div className="mx-4">
        <Search />
      </div>

      <div className="mx-4 grid grid-cols-2 gap-3">
        {toArray(districts.values()).map((item) => {
          return (
            <div
              key={item.adcode}
              className={stringify(
                styles.city,
                "bg-cover h-40 rounded-2xl flex flex-col text-color-on-primary",
                "p-3 relative overflow-hidden",
              )}
              onClick={() => toggleAdCode(item.adcode)}
            >
              <span>约3天</span>
              <div className="mt-auto font-medium">
                <h5>{item.name}</h5>
              </div>

              {selectedAdCodes.has(item.adcode) && (
                <div className={stringify(styles["city--selected"], "absolute inset-0 z-50")} />
              )}
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-0 flex items-center px-6 py-4 bg-color-on-primary border-t border-color-outline">
        {selectedAdCodes.size === 0 && <span>请至少选择一个城市</span>}

        {selectedAdCodes.size > 0 && (
          <span>
            已选择 {selectedAdCodes.size} 个城市：
            {toArray(selectedAdCodes).map((code) => {
              return <span key={code}>{districts.get(code)?.name}</span>;
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
