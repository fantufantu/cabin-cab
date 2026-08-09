import { toArray, useRequest } from "@aiszlab/relax";
import { Button, Search } from "musae";
import { useNavigate } from "@aiszlab/bee/router";
import { usePlanContext } from "../../../contexts/tourist-planning.context";
import City from "../../../components/city";
import TouristPlanHeader from "../../../components/tourist-plan/header";
import TouristPlanFooter from "../../../components/tourist-plan/footer";
import { queryCities } from "../../../api/city.api";
import { useMemo } from "react";

const PlanCities = () => {
  const {
    cities: { selectedCityCodes, toggleCityCode },
  } = usePlanContext();
  const navigate = useNavigate();

  const { data, run: searchCities } = useRequest(
    (keyword?: string) =>
      queryCities({
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

  const cities = useMemo(() => new Map((data ?? []).map((city) => [city.code, city])), [data]);

  return (
    <div className="min-h-screen flex flex-col gap-4">
      <TouristPlanHeader
        title="选择目的城市"
        step={1}
        subTitle={`可多选，已选 ${selectedCityCodes.size} 个城市`}
      />

      <div className="mx-4">
        <Search
          onSearch={(keyword) => searchCities(keyword)}
          onClear={() => searchCities()}
          searchButton="搜索"
        />
      </div>

      <div className="mx-4 grid grid-cols-2 gap-3">
        {cities.values().map((item) => {
          return (
            <City
              key={item.code}
              item={item}
              onClick={toggleCityCode}
              isSelected={selectedCityCodes.has(item.code)}
            />
          );
        })}
      </div>

      <TouristPlanFooter>
        {selectedCityCodes.size === 0 && <span>请至少选择一个城市</span>}

        {selectedCityCodes.size > 0 && (
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">
            已选择 {selectedCityCodes.size} 个城市：
            {toArray(selectedCityCodes).map((code, index) => {
              return (
                <span key={code}>
                  <span>{cities.get(code)?.name ?? code}</span>
                  {index < selectedCityCodes.size - 1 && <span>，</span>}
                </span>
              );
            })}
          </span>
        )}

        <Button
          className="ml-auto"
          size="small"
          onClick={nextStep}
          disabled={selectedCityCodes.size === 0}
        >
          下一步
        </Button>
      </TouristPlanFooter>
    </div>
  );
};

export default PlanCities;
