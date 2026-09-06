import { toArray, useRequest } from "@aiszlab/relax";
import { Button, Search } from "musae";
import { useNavigate } from "@aiszlab/bee/router";
import { usePlanContext } from "../../../contexts/tourist-planning.context";
import District from "../../../components/district";
import TouristPlanHeader from "../../../components/tourist-plan/header";
import TouristPlanFooter from "../../../components/tourist-plan/footer";
import { queryDistricts } from "../../../api/district.api";
import { useMemo } from "react";

const PlanDistricts = () => {
  const {
    districts: { selectedDistrictCodes, toggleDistrictCode },
  } = usePlanContext();
  const navigate = useNavigate();

  const { data, run: searchDistricts } = useRequest(
    (keyword?: string) =>
      queryDistricts({
        keyword,
      }),
    {
      auto: true,
      defaultParams: [""],
    },
  );

  const nextStep = () => {
    navigate("/tourist-planning/period");
  };

  const districts = useMemo(
    () => new Map((data ?? []).map((district) => [district.code, district])),
    [data],
  );

  return (
    <div className="min-h-screen flex flex-col gap-4">
      <TouristPlanHeader
        title="选择目的城市"
        step={1}
        subTitle={`可多选，已选 ${selectedDistrictCodes.size} 个城市`}
      />

      <div className="mx-4">
        <Search
          onSearch={(keyword) => searchDistricts(keyword)}
          onClear={() => searchDistricts()}
          searchButton="搜索"
        />
      </div>

      <div className="mx-4 grid grid-cols-2 gap-3">
        {districts.values().map((item) => {
          return (
            <District
              key={item.code}
              item={item}
              onClick={toggleDistrictCode}
              isSelected={selectedDistrictCodes.has(item.code)}
            />
          );
        })}
      </div>

      <TouristPlanFooter>
        {selectedDistrictCodes.size === 0 && <span>请至少选择一个城市</span>}

        {selectedDistrictCodes.size > 0 && (
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">
            已选择 {selectedDistrictCodes.size} 个城市：
            {toArray(selectedDistrictCodes).map((code, index) => {
              return (
                <span key={code}>
                  <span>{districts.get(code)?.name ?? code}</span>
                  {index < selectedDistrictCodes.size - 1 && <span>，</span>}
                </span>
              );
            })}
          </span>
        )}

        <Button
          className="ml-auto"
          size="small"
          onClick={nextStep}
          disabled={selectedDistrictCodes.size === 0}
        >
          下一步
        </Button>
      </TouristPlanFooter>
    </div>
  );
};

export default PlanDistricts;
