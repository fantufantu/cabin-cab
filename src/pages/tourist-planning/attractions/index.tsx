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
import { queryCities } from "../../../api/city.api";
import { queryAttractions } from "../../../api/attraction.api";

function Attractions() {
  const {
    cities: { selectedCityCodes },
    period: { duration, depatureAt },
  } = usePlanContext();

  const navigate = useNavigate();
  const [currentCityCode, setCurrentCityCode] = useState(
    () => selectedCityCodes.values().next().value,
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

  const { data: cities } = useRequest(
    () => queryCities().then((_cities) => new Map(_cities.map(({ code, name }) => [code, name]))),
    {
      auto: true,
    },
  );

  const { data, run } = useRequest(
    async (cityCode?: string) => {
      if (!cityCode) return null;
      return await queryAttractions(cityCode).catch(() => null);
    },
    {
      auto: true,
      defaultParams: [currentCityCode],
    },
  );
  const attractions = data ?? [];

  const selectAttraction = useEvent((code: string) => {
    if (isUndefined(currentCityCode)) return;

    setSelectedAttractionTree((prev) => {
      const next = new Map(prev);
      const selectedAttractionCodes = next.get(currentCityCode) ?? new Set();
      selectedAttractionCodes.add(code);
      next.set(currentCityCode, selectedAttractionCodes);
      return next;
    });
  });

  const deselectAttraction = useEvent((code: string) => {
    if (isUndefined(currentCityCode)) return;

    setSelectedAttractionTree((prev) => {
      const next = new Map(prev);
      const selectedAttractionCodes = next.get(currentCityCode) ?? new Set();
      selectedAttractionCodes.delete(code);
      next.set(currentCityCode, selectedAttractionCodes);
      return next;
    });
  });

  const changeDistrict = useEvent((activeKey: Key) => {
    const cityCode = activeKey.toString();
    setCurrentCityCode(cityCode);
    run(cityCode);
  });

  const submit = async () => {
    const { data } = await createTouristPlan({
      variables: {
        input: {
          cityCodes: toArray(selectedCityCodes),
          duration,
          depatureAt: depatureAt.valueOf(),
          attractionCodes: toArray(selectedAttractionTree).flatMap(([_cityCode, _attractions]) =>
            toArray(_attractions),
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
        activeKey={currentCityCode}
        onChange={changeDistrict}
        items={toArray(selectedCityCodes).map((cityCode) => {
          return {
            key: cityCode,
            label: (
              <span className="flex items-center">
                <span>{cities?.get(cityCode) ?? cityCode}</span>
                &nbsp;
                <Tag size="small" className="rounded-full">
                  {(!isUndefined(currentCityCode) && selectedAttractionTree.get(cityCode)?.size) ??
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
                  !isUndefined(currentCityCode) &&
                  selectedAttractionTree.get(currentCityCode)?.has(attraction.code)
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
