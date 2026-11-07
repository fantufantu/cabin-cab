import { useNavigate } from "@aiszlab/bee/router";
import { createPortal } from "react-dom";
import { Button, IconButton, Skeleton, Tabs, Tag } from "musae";
import { IconCalendarToday, IconKeyboardArrowLeft, IconKeyboardArrowRight } from "musae/icons";
import { usePlanContext } from "../../../contexts/tourist-planning.context";
import { TouristPlanHeaderContent } from "../../../components/tourist-plan/header";
import {
  isUndefined,
  range,
  toArray,
  useEvent,
  useInfiniteScroll,
  useRequest,
} from "@aiszlab/relax";
import { Key, useState } from "react";
import TouristAttractionCard from "../../../components/attraction/card";
import { useMutation } from "@apollo/client/react";
import { CREATE_TOURIST_PLAN } from "../../../api/tourist-plan.api";
import { useAuthStore } from "../../../stores/auth.store";
import { EVENT_BUS_TOKENS, useEventBusStore } from "../../../stores/event-bus.store";
import { queryDistricts } from "../../../api/district.api";
import { queryAttractions } from "../../../api/attraction.api";
import { getTouristPlanningFlowStep } from "../../../constants/tourist-planning.constant";

function Attractions() {
  const {
    districts: { selectedDistrictCodes },
    period: { duration, depatureAt },
    headerContainer,
    footerContainer,
  } = usePlanContext();

  const navigate = useNavigate();
  const [currentDistrictCode, setCurrentDistrictCode] = useState(
    () => selectedDistrictCodes.values().next().value,
  );
  const { sentinelRef, viewportRef } = useInfiniteScroll<HTMLElement, HTMLDivElement>();
  const [selectedAttractionTree, setSelectedAttractionTree] = useState(
    () => new Map<string, Set<string>>(),
  );
  const { whoAmI, me } = useAuthStore();
  const { emit } = useEventBusStore();

  const [createTouristPlan] = useMutation(CREATE_TOURIST_PLAN);

  const goBack = useEvent(() => navigate(-1));

  const { data: districts } = useRequest(
    () =>
      queryDistricts().then((_districts) =>
        new Map(_districts.map(({ code, name }) => [code, name])),
      ),
    {
      auto: true,
    },
  );

  const { data, error, loading, run } = useRequest(
    async (districtCode?: string) => {
      if (!districtCode) return null;
      return queryAttractions(districtCode);
    },
    {
      auto: true,
      defaultParams: [currentDistrictCode],
    },
  );
  const attractions = data ?? [];

  const selectAttraction = useEvent((code: string) => {
    if (isUndefined(currentDistrictCode)) return;

    setSelectedAttractionTree((prev) => {
      const next = new Map(prev);
      const selectedAttractionCodes = next.get(currentDistrictCode) ?? new Set();
      selectedAttractionCodes.add(code);
      next.set(currentDistrictCode, selectedAttractionCodes);
      return next;
    });
  });

  const deselectAttraction = useEvent((code: string) => {
    if (isUndefined(currentDistrictCode)) return;

    setSelectedAttractionTree((prev) => {
      const next = new Map(prev);
      const selectedAttractionCodes = next.get(currentDistrictCode) ?? new Set();
      selectedAttractionCodes.delete(code);
      next.set(currentDistrictCode, selectedAttractionCodes);
      return next;
    });
  });

  const changeDistrict = useEvent((activeKey: Key) => {
    const districtCode = activeKey.toString();
    setCurrentDistrictCode(districtCode);
    run(districtCode);
  });

  const submit = useEvent(async () => {
    const { data } = await createTouristPlan({
      variables: {
        input: {
          districtCodes: toArray(selectedDistrictCodes),
          duration,
          depatureAt: depatureAt.valueOf(),
          attractionCodes: toArray(selectedAttractionTree).flatMap(
            ([_districtCode, _attractions]) => toArray(_attractions),
          ),
          belongToId: me!.id,
        },
      },
    });

    if (!data?.createTouristPlan.id) {
      return;
    }

    // 出行计划创建成功，更新用户信息，跳转计划详情生成页面
    Promise.all([
      whoAmI(),
      emit(EVENT_BUS_TOKENS.REFRESH_TOURIST_PLANS),
      navigate(`/tourist-plan/${data.createTouristPlan.id}`),
    ]);
  });

  return (
    <>
      <div className="flex flex-1 flex-col" ref={viewportRef}>
        <Tabs
          activeKey={currentDistrictCode}
          onChange={changeDistrict}
          items={toArray(selectedDistrictCodes).map((districtCode) => {
            return {
              key: districtCode,
              label: (
                <span className="flex items-center">
                  <span>{districts?.get(districtCode) ?? districtCode}</span>
                  &nbsp;
                  <Tag size="small" className="rounded-full">
                    {(!isUndefined(currentDistrictCode) &&
                      selectedAttractionTree.get(districtCode)?.size) ??
                      0}
                  </Tag>
                </span>
              ),
            };
          })}
        />

        <div className="flex flex-col gap-2 p-4">
          {loading &&
            range(1, 10).map((key) => {
              return <Skeleton key={key} className="h-20 rounded-lg" />;
            })}

          {!loading && error && (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="text-sm text-color-on-surface-variant">景点数据加载失败，请重试</p>
              <Button
                size="small"
                color="secondary"
                onClick={() => run(currentDistrictCode)}
              >
                重试
              </Button>
            </div>
          )}

          {!loading && !error && attractions.length === 0 && (
            <section className="my-6 flex flex-col gap-5 rounded-3xl bg-color-surface-container-low p-6">
              <div className="flex flex-col gap-2">
                <Tag size="small" variant="filled" className="w-fit rounded-full">
                  行程灵感
                </Tag>
                <h2 className="text-xl font-semibold text-color-on-surface">
                  {districts?.get(currentDistrictCode) ?? "这座城市"}，慢慢逛也很好
                </h2>
                <p className="text-sm leading-6 text-color-on-surface-variant">
                  这里暂时还没有收录景点。先把行程计划下来，之后也可以按自己的兴趣探索城市。
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-color-surface p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-color-primary-container text-color-primary">
                  <IconCalendarToday />
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-color-on-surface">
                    {depatureAt.format("M月D日")} 出发 · {duration} 天
                  </span>
                  <span className="text-xs text-color-on-surface-variant">
                    不选景点也能继续，AI 会根据你的行程安排生成计划
                  </span>
                </div>
              </div>

              <p className="text-center text-xs text-color-on-surface-variant">
                想加入热门景点？
                <button
                  type="button"
                  className="ml-1 font-medium text-color-primary underline underline-offset-2"
                  onClick={() => navigate("/tourist-planning/districts")}
                >
                  返回第一步更换城市
                </button>
              </p>
            </section>
          )}

          {attractions.length > 0 && (
            <>
              {attractions.map((attraction) => (
                <TouristAttractionCard
                  key={attraction.code}
                  attraction={attraction}
                  checked={
                    !isUndefined(currentDistrictCode) &&
                    selectedAttractionTree.get(currentDistrictCode)?.has(attraction.code)
                  }
                  onSelect={selectAttraction}
                  onDeselect={deselectAttraction}
                />
              ))}

              <span ref={sentinelRef} />
            </>
          )}
        </div>
      </div>
      {headerContainer &&
        createPortal(
          <TouristPlanHeaderContent
            title={getTouristPlanningFlowStep("attractions").title}
            subTitle={getTouristPlanningFlowStep("attractions").subTitle}
          />,
          headerContainer,
        )}
      {footerContainer &&
        createPortal(
          <>
            <IconButton size="small" color="secondary" onClick={goBack}>
              <IconKeyboardArrowLeft />
            </IconButton>

            <Button
              className="flex-1"
              prefix={<IconCalendarToday />}
              suffix={<IconKeyboardArrowRight />}
              onClick={submit}
            >
              生成出行计划
            </Button>
          </>,
          footerContainer,
        )}
    </>
  );
}

export default Attractions;
