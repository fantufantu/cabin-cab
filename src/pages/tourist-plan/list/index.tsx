import { useLazyQuery, useMutation } from "@apollo/client/react";
import { TOURIST_PLANS, DELETE_TOURIST_PLAN } from "../../../api/tourist-plan.api";
import { useNavigate } from "@aiszlab/bee/router";
import { Button, IconButton, Skeleton, Tag, Message } from "musae";
import { useMounted, useRequest } from "@aiszlab/relax";
import { useEffect, useMemo, useState } from "react";
import { IconKeyboardArrowLeft, IconLocationOn } from "musae/icons";
import dayjs from "dayjs";
import { useAuthStore } from "../../../stores/auth.store";
import { EVENT_BUS_TOKENS, useEventBusStore } from "../../../stores/event-bus.store";
import SwipeableCard from "../../../components/swipeable-card";
import { useReducedMotion } from "../../../utils/reduced-motion.util";

function TouristPlanList() {
  const [queryTouristPlans] = useLazyQuery(TOURIST_PLANS, {
    fetchPolicy: "no-cache",
  });
  const [deleteTouristPlan] = useMutation(DELETE_TOURIST_PLAN);
  const navigate = useNavigate();
  const { myId } = useAuthStore();
  const { on, emit } = useEventBusStore();
  const reducedMotion = useReducedMotion();
  const [openCardId, setOpenCardId] = useState<string | null>(null);

  const { data, loading, run } = useRequest(
    async () => {
      return (
        await queryTouristPlans({
          variables: { filter: { belongToId: await myId() } },
        })
      ).data;
    },
    { auto: true },
  );

  useMounted(() => {
    return on(EVENT_BUS_TOKENS.REFRESH_TOURIST_PLANS, () => {
      run();
    });
  });

  // Close any open swipe card when the page scrolls (one-open-at-a-time)
  useMounted(() => {
    const handleScroll = () => setOpenCardId(null);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });

  const touristPlans = useMemo(() => {
    return data?.touristPlans.items ?? [];
  }, [data]);

  const toHome = () => {
    navigate("/");
  };

  const handleDelete = async (id: string) => {
    const result = await deleteTouristPlan({ variables: { id } }).catch(() => null);
    if (!result) return;
    Message.success({ description: "行程已删除" });
    emit(EVENT_BUS_TOKENS.REFRESH_TOURIST_PLANS);
  };

  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (touristPlans.length === 0) return;
    if (reducedMotion) {
      setVisibleItems(new Set(touristPlans.map((p) => p.id)));
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    touristPlans.forEach((plan, i) => {
      timers.push(
        setTimeout(() => {
          setVisibleItems((prev) => new Set(prev).add(plan.id));
        }, i * 60),
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [touristPlans, reducedMotion]);

  return (
    <div className="flex flex-col min-h-screen bg-color-surface">
      {/* Header */}
      <div className="bg-color-primary text-color-on-primary p-5 safe-pt-5 flex items-center justify-center sticky top-0 z-50">
        <IconButton size="small" color="secondary" className="absolute left-5" onClick={toHome}>
          <IconKeyboardArrowLeft size={24} />
        </IconButton>
        <h1 className="text-xl font-medium tracking-wide">我的出行计划</h1>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {/* Loading skeletons */}
        {loading &&
          touristPlans.length === 0 &&
          Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-color-surface-container-low p-4 flex flex-col gap-3"
            >
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

        {/* Empty state */}
        {!loading && touristPlans.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-color-on-surface-variant">
            <div className="text-6xl mb-4">🗺️</div>
            <p className="text-lg font-medium text-color-on-surface">还没有出行计划</p>
            <p className="text-sm mt-2 text-color-on-surface-variant">开启你的第一段旅程吧</p>
            <Button className="mt-6" onClick={() => navigate("/tourist-planning/districts")}>
              创建行程
            </Button>
          </div>
        )}

        {/* Plan cards */}
        {touristPlans.length > 0 &&
          touristPlans.map((plan) => (
            <div
              key={plan.id}
              style={{
                opacity: reducedMotion || visibleItems.has(plan.id) ? 1 : 0,
                transform:
                  reducedMotion || visibleItems.has(plan.id) ? "translateY(0)" : "translateY(16px)",
                transition: "opacity 350ms ease-out, transform 350ms ease-out",
              }}
            >
              <SwipeableCard
                onConfirmDelete={() => handleDelete(plan.id)}
                open={openCardId === plan.id}
                onOpenChange={(open) => setOpenCardId(open ? plan.id : null)}
                className="shadow-sm"
              >
                <div
                  className="border-l-4 p-4 flex flex-col gap-3 cursor-pointer active:bg-color-surface-container-high"
                  style={{ borderColor: "var(--color-primary)" }}
                  onClick={() => navigate(`/tourist-plan/${plan.id}`)}
                >
                  {/* Title row */}
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold tracking-wide text-color-on-surface">
                      {plan.duration}天行程
                    </span>
                    <span className="text-sm tabular-nums text-color-on-surface-variant">
                      {dayjs(plan.depatureAt).format("YYYY/MM/DD")}
                      {" - "}
                      {dayjs(plan.depatureAt).add(plan.duration, "day").format("YYYY/MM/DD")}
                    </span>
                  </div>

                  {/* District tags */}
                  <div className="flex flex-wrap gap-2">
                    {plan.districts.map((district) => (
                      <Tag key={district.code}>
                        <IconLocationOn />
                        {district.name}
                      </Tag>
                    ))}
                  </div>

                  {/* Attraction count */}
                  <div className="text-xs text-color-on-surface-variant">
                    {plan.attractions.length}个景点
                  </div>
                </div>
              </SwipeableCard>
            </div>
          ))}
      </div>
    </div>
  );
}

export default TouristPlanList;
