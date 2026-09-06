import { useNavigate } from "@aiszlab/bee/router";
import TouristPlanHeader from "../../../components/tourist-plan/header";
import { Button, IconButton, Skeleton, Tabs, Tag } from "musae";
import { IconCalendarToday, IconKeyboardArrowLeft, IconKeyboardArrowRight } from "musae/icons";
import { usePlanContext } from "../../../contexts/tourist-planning.context";
import {
  isUndefined,
  range,
  toArray,
  useEvent,
  useInfiniteScroll,
  useRequest,
} from "@aiszlab/relax";
import TouristPlanFooter from "../../../components/tourist-plan/footer";
import { Key, useState } from "react";
import TouristAttractionCard from "../../../components/attraction/card";
import { useMutation } from "@apollo/client/react";
import { CREATE_TOURIST_PLAN } from "../../../api/tourist-plan.api";
import { useAuthStore } from "../../../stores/auth.store";
import { EVENT_BUS_TOKENS, useEventBusStore } from "../../../stores/event-bus.store";
import { queryDistricts } from "../../../api/district.api";
import { queryAttractions } from "../../../api/attraction.api";

function Attractions() {
  const {
    districts: { selectedDistrictCodes },
    period: { duration, depatureAt },
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

  const goBack = () => {
    navigate(-1);
  };

  const { data: districts } = useRequest(
    () =>
      queryDistricts().then((_districts) =>
        new Map(_districts.map(({ code, name }) => [code, name])),
      ),
    {
      auto: true,
    },
  );

  const { data, run } = useRequest(
    async (districtCode?: string) => {
      if (!districtCode) return null;
      return await queryAttractions(districtCode).catch(() => null);
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

  const submit = async () => {
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
  };

  return (
    <div className="min-h-screen flex flex-col" ref={viewportRef}>
      <TouristPlanHeader step={3} title="景点" subTitle="选择您喜欢的景点" />

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
        {attractions.length === 0 &&
          range(1, 10).map((key) => {
            return <Skeleton key={key} className="h-20 rounded-lg" />;
          })}

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

      <TouristPlanFooter>
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
      </TouristPlanFooter>
    </div>
  );
}

export default Attractions;
