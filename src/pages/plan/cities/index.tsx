import { useMounted } from "@aiszlab/relax";
import useAmapStore from "../../../stores/amap.store";

const PlanCities = () => {
  const { queryDistricts } = useAmapStore();

  useMounted(() => {
    queryDistricts();
  });

  return <div>plan</div>;
};

export default PlanCities;
