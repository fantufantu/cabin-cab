import { useLazyQuery } from "@apollo/client/react";
import { TOURIST_PLANS } from "../../../api/tourist-plan.api";
import { useNavigate } from "@aiszlab/bee/router";
import { IconButton, Skeleton, Tag } from "musae";
import { useMounted } from "@aiszlab/relax";
import { useMemo } from "react";
import { KeyboardArrowLeft, LocationOn } from "musae/icons";
import dayjs from "dayjs";
import useAppStore from "../../../stores/app.store";

function TouristPlanList() {
  const [queryTouristPlans, { data, loading }] = useLazyQuery(TOURIST_PLANS);
  const navigate = useNavigate();
  const { getAppId } = useAppStore();

  useMounted(async () => {
    const belongToId = await getAppId();
    await queryTouristPlans({ variables: { filter: { belongToId } } }).catch(() => null);
  });

  const touristPlans = useMemo(() => {
    return data?.touristPlans.items ?? [];
  }, [data]);

  const toHome = () => {
    navigate("/");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-color-primary text-color-on-primary p-5 safe-pt-5 flex items-center justify-center relative">
        <IconButton size="small" color="secondary" className="absolute left-5" onClick={toHome}>
          <KeyboardArrowLeft size={24} />
        </IconButton>

        <h1 className="text-xl">我的出行计划</h1>
      </div>

      <div className="flex flex-col gap-3 p-4">
        {loading &&
          touristPlans.length === 0 &&
          Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-color-outline p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-20 rounded" />
                <Skeleton className="h-4 w-40 rounded" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded" />
                <Skeleton className="h-6 w-16 rounded" />
                <Skeleton className="h-6 w-14 rounded" />
              </div>
              <Skeleton className="h-4 w-16 rounded" />
            </div>
          ))}

        {!loading && touristPlans.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-color-secondary">
            <p className="text-lg">暂无出行计划</p>
            <p className="text-sm mt-2">快去创建一个吧</p>
          </div>
        )}

        {touristPlans.length > 0 &&
          touristPlans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-xl border border-color-outline p-4 flex flex-col gap-3 active:bg-color-surface-container"
              onClick={() => navigate(`/tourist-plan/${plan.id}`)}
            >
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">{plan.duration}天行程</span>
                <span className="text-sm text-color-secondary">
                  {dayjs(plan.depatureAt).format("YYYY/MM/DD")}
                  {" - "}
                  {dayjs(plan.depatureAt).add(plan.duration, "day").format("YYYY/MM/DD")}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {plan.cities.map((city) => (
                  <Tag key={city.code}>
                    <LocationOn />
                    {city.name}
                  </Tag>
                ))}
              </div>

              <div className="text-sm text-color-secondary">{plan.attractions.length}个景点</div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default TouristPlanList;
