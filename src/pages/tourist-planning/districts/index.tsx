import { useRequest } from "@aiszlab/relax";
import { Button, Message, Tag, Typography } from "musae";
import { useNavigate } from "@aiszlab/bee/router";
import { usePlanContext } from "../../../contexts/tourist-planning.context";
import TouristPlanHeader from "../../../components/tourist-plan/header";
import TouristPlanFooter from "../../../components/tourist-plan/footer";
import { queryDistricts } from "../../../api/district.api";
import { type District as DistrictType } from "../../../api/district.types";
import {
  IconAddLocationAlt,
  IconKeyboardArrowRight,
  IconLocationCity,
  IconMyLocation,
} from "musae/icons";
import { useRef, useState } from "react";
import { getCurrentPosition, GeolocationError } from "../../../utils/geolocation.util";
import { reverseGeocode } from "../../../api/location.api";
import CitySelectSheet, { type CitySelectSheetRef } from "../../../components/city-select-sheet";
import RouteMap from "../../../components/route-map";
import { DISTRICT_LEVELS } from "../../../constants/district.constant";

const PlanDistricts = () => {
  const {
    districts: { selectedDistrictCodes, setSelectedDistrictCodes },
  } = usePlanContext();
  const navigate = useNavigate();
  const citySheetRef = useRef<CitySelectSheetRef>(null);
  const [isLocating, setIsLocating] = useState(false);
  const { data } = useRequest(
    async () => {
      const districts = await queryDistricts({ keyword: "" });
      const cityMap = new Map(
        districts
          .filter(({ level }) => level === DISTRICT_LEVELS.CITY)
          .map((city) => [city.code, city]),
      );
      return { cityMap, districtMap: cityMap };
    },
    { auto: true },
  );
  const nextStep = () => navigate("/tourist-planning/period");

  const selectCurrentCity = async () => {
    if (isLocating) return;
    setIsLocating(true);

    const result = await getCurrentPosition()
      .then((coordinates) => reverseGeocode(coordinates))
      .catch((error: unknown) => {
        const description =
          error instanceof GeolocationError
            ? {
                unsupported: "当前环境不支持定位",
                "permission-denied": "请允许应用访问位置信息后重试",
                "position-unavailable": "暂时无法获取当前位置",
                timeout: "定位超时，请重试",
              }[error.code]
            : "无法解析当前位置，请稍后重试";
        Message.error({ description });
        return null;
      })
      .finally(() => setIsLocating(false));

    if (!result) return;

    const matchedCity = data?.cityMap.get(result.districtCode);

    if (!matchedCity) {
      Message.error({ description: "当前位置对应的城市暂不支持选择" });
      return;
    }

    setSelectedDistrictCodes(new Set([...selectedDistrictCodes, matchedCity.code]));
    Message.success({ description: `已添加${matchedCity.name}` });
  };

  const selectedDistricts = Array.from(selectedDistrictCodes)
    .map((code) => data?.districtMap.get(code))
    .filter((district): district is DistrictType => !!district);

  return (
    <div className="min-h-screen flex flex-col bg-color-surface">
      <TouristPlanHeader title="选择目的地" step={1} subTitle="支持选择多个城市，可连续勾选" />

      <main className="flex flex-1 flex-col gap-6 px-4 py-5 z-0">
        <section className="rounded-3xl bg-color-primary-container p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Typography.Label>开启一段新旅程</Typography.Label>
              <Typography.Title size="large">这次想去哪里？</Typography.Title>
              <p className="mt-2 text-sm text-color-on-surface-variant">
                先选几座城市，剩下的交给我们规划
              </p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-color-surface text-color-primary">
              <IconLocationCity size={26} />
            </div>
          </div>
          <section className="mt-5" aria-label="已确认的目的城市" aria-live="polite">
            <p className="text-sm font-medium text-color-on-surface">
              已选城市（{selectedDistrictCodes.size}）
            </p>
            {selectedDistricts.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedDistricts.map((city, index) => (
                  <Tag key={city.code} className="rounded-full">
                    {index + 1}. {city.name}
                  </Tag>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-color-on-surface-variant">
                {selectedDistrictCodes.size > 0
                  ? "正在加载已选城市…"
                  : "还未选择城市，点击下方添加目的地"}
              </p>
            )}
          </section>
          <Button
            className="mt-5 w-full"
            onClick={() => citySheetRef.current?.open()}
            prefix={<IconAddLocationAlt />}
          >
            添加目的地
          </Button>
        </section>

        <button
          type="button"
          className="flex items-center gap-3 rounded-2xl border border-color-outline-variant bg-color-surface-container-low p-4 text-left"
          onClick={() => selectCurrentCity()}
          disabled={isLocating}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-color-surface text-color-primary">
            <IconMyLocation size={21} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-medium text-color-on-surface">
              {isLocating ? "正在定位…" : "从当前位置开始"}
            </span>
            <span className="mt-0.5 block text-xs text-color-on-surface-variant">
              自动添加你所在的城市
            </span>
          </span>
          <IconKeyboardArrowRight className="text-color-on-surface-variant" />
        </button>

        {selectedDistricts.length > 0 && (
          <RouteMap
            cities={selectedDistricts}
            onReorder={(codes) => setSelectedDistrictCodes(new Set(codes))}
          />
        )}
      </main>

      <TouristPlanFooter>
        <Button
          className="flex-1"
          onClick={nextStep}
          disabled={selectedDistrictCodes.size === 0}
          suffix={<IconKeyboardArrowRight />}
        >
          完成（{selectedDistrictCodes.size}）
        </Button>
      </TouristPlanFooter>

      <CitySelectSheet
        ref={citySheetRef}
        value={selectedDistricts}
        onChange={(cities) => setSelectedDistrictCodes(new Set(cities.map(({ code }) => code)))}
      />
    </div>
  );
};

export default PlanDistricts;
