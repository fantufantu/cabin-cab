import { useBoolean, useRequest, useToggleable } from "@aiszlab/relax";
import {
  BottomSheet,
  Button,
  Checkbox,
  IconButton,
  Input,
  Menu,
  Message,
  Tag,
  Typography,
} from "musae";
import { useNavigate } from "@aiszlab/bee/router";
import { usePlanContext } from "../../../contexts/tourist-planning.context";
import TouristPlanHeader from "../../../components/tourist-plan/header";
import TouristPlanFooter from "../../../components/tourist-plan/footer";
import { queryDistricts } from "../../../api/district.api";
import { type District as DistrictType } from "../../../api/district.types";
import {
  IconAddLocationAlt,
  IconKeyboardArrowRight,
  IconClose,
  IconLocationCity,
  IconMyLocation,
} from "musae/icons";
import { useMemo, useState } from "react";
import { getCurrentPosition, GeolocationError } from "../../../utils/geolocation.util";
import { reverseGeocode } from "../../../api/location.api";
import DistrictCard from "../../../components/district";
import { DISTRICT_LEVELS } from "../../../constants/district.constant";

interface ToggleableDistrict {
  key: string;
  children?: ToggleableDistrict[];
}

const PlanDistricts = () => {
  const {
    "0": isVisible,
    "1": { turnOn, turnOff },
  } = useBoolean();

  const {
    districts: { selectedDistrictCodes, setSelectedDistrictCodes },
  } = usePlanContext();
  const navigate = useNavigate();
  const [isLocating, setIsLocating] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [districtPath, setDistrictPath] = useState<DistrictType[]>([]);

  const { data, run: searchDistricts } = useRequest(
    async (keyword?: string) => {
      const districts = await queryDistricts({
        keyword,
      });

      const { districtMap, cityMap, provinceMap, toggleableDistricts } = districts
        .values()
        .filter(({ level }) => level === DISTRICT_LEVELS.PROVINCE || level === DISTRICT_LEVELS.CITY)
        .reduce(
          (prev, current) => {
            prev.districtMap.set(current.code, current);

            switch (current.level) {
              case DISTRICT_LEVELS.PROVINCE:
                prev.provinceMap.set(current.code, current);
                break;
              case DISTRICT_LEVELS.CITY:
                prev.cityMap.set(current.code, current);
                prev.toggleableDistricts.set(current.parentCode, {
                  key: current.parentCode,
                  children: (
                    prev.toggleableDistricts.get(current.parentCode)?.children ?? []
                  ).concat({
                    key: current.code,
                  }),
                });
                break;
              default:
                break;
            }

            return prev;
          },
          {
            districtMap: new Map<string, DistrictType>(),
            provinceMap: new Map<string, DistrictType>(),
            cityMap: new Map<string, DistrictType>(),
            toggleableDistricts: new Map<string, ToggleableDistrict>(),
          },
        );

      return {
        districts,
        districtMap,
        provinceMap,
        cityMap,
        toggleableDistricts: toggleableDistricts.values().toArray(),
      };
    },
    {
      defaultParams: [""],
      auto: true,
    },
  );

  const nextStep = () => {
    navigate("/tourist-planning/period");
  };

  const {
    toggledKeys: selectedLeafCodes,
    isToggled: isDistrictSelected,
    toggle,
  } = useToggleable(data?.toggleableDistricts ?? [], {
    selectionMode: "leaf",
    toggledKeys: Array.from(selectedDistrictCodes),
    onToggle: (nextCodes) => setSelectedDistrictCodes(new Set(nextCodes.map(String))),
  });

  const toggleDistrict = (code: string) => toggle(code);

  const isSearching = keyword.trim().length > 0;
  const currentParent = districtPath[districtPath.length - 1];
  const visibleDistricts = isSearching
    ? data?.districts
    : currentParent
      ? data?.cityMap
          .values()
          .filter((city) => city.parentCode === currentParent.code)
          .toArray()
      : data?.provinceMap.values().toArray();

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

    if (!selectedLeafCodes.has(matchedCity.code)) toggle(matchedCity.code);
    Message.success({ description: `已添加${matchedCity.name}` });
  };

  const selectedDistricts = Array.from(selectedDistrictCodes)
    .map((code) => data?.districtMap.get(code))
    .filter((district): district is DistrictType => !!district);

  return (
    <div className="min-h-screen flex flex-col bg-color-surface">
      <TouristPlanHeader title="选择目的地" step={1} subTitle="支持选择多个城市，可连续勾选" />

      <main className="flex flex-1 flex-col gap-6 px-4 py-5">
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
          <Button className="mt-5 w-full" onClick={turnOn} prefix={<IconAddLocationAlt />}>
            添加目的地
          </Button>
        </section>

        <button
          type="button"
          className="flex items-center gap-3 rounded-2xl border border-color-outline-variant bg-color-surface-container-low p-4 text-left"
          onClick={selectCurrentCity}
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

        <section className="flex flex-col gap-3">
          <div className="flex items-end justify-between">
            <div>
              <Typography.Title size="medium">已选目的地</Typography.Title>
              <p className="mt-1 text-xs text-color-on-surface-variant">
                {selectedDistrictCodes.size > 0
                  ? `已挑选 ${selectedDistrictCodes.size} 座城市`
                  : "选好城市后会显示在这里"}
              </p>
            </div>
            {selectedDistrictCodes.size > 0 && (
              <Button size="small" variant="text" onClick={turnOn}>
                编辑
              </Button>
            )}
          </div>

          {selectedDistricts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {selectedDistricts.map((district) => (
                <DistrictCard
                  key={district.code}
                  item={district}
                  isSelected
                  onClick={toggleDistrict}
                />
              ))}
            </div>
          ) : (
            <button
              type="button"
              className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-color-outline-variant bg-color-surface-container-low px-5 py-6 text-center"
              onClick={turnOn}
            >
              <IconAddLocationAlt size={28} color="var(--color-primary)" />
              <span className="text-sm font-medium text-color-on-surface">添加第一座城市</span>
              <span className="text-xs text-color-on-surface-variant">可一次选择多个目的地</span>
            </button>
          )}
        </section>
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

      <BottomSheet open={isVisible} onClose={turnOff} height="90vh" panelClassName="p-4 gap-4">
        <div className="flex justify-between items-center">
          <Typography.Title size="large">选择目的城市</Typography.Title>

          <IconButton variant="text" onClick={turnOff}>
            <IconClose size="large" />
          </IconButton>
        </div>

        {selectedDistrictCodes.size > 0 && (
          <section className="flex flex-col gap-2" aria-label="已选城市">
            <Typography.Title>已选城市（{selectedDistrictCodes.size}）</Typography.Title>

            <div className="flex flex-wrap gap-2">
              {Array.from(selectedLeafCodes).map((code) => {
                const district = data?.cityMap.get(code.toString());

                return (
                  <Tag key={code} closable onClose={() => toggle(code)} className="rounded-full">
                    {district?.name ?? code}
                  </Tag>
                );
              })}
            </div>
          </section>
        )}

        <Input
          placeholder="请搜索省份或城市"
          value={keyword}
          onChange={(value: string) => {
            setKeyword(value);
            setDistrictPath([]);
            searchDistricts(value);
          }}
        />

        <Button
          prefix={<IconLocationCity />}
          size="small"
          variant="outlined"
          className="w-fit"
          loading={isLocating}
          onClick={selectCurrentCity}
        >
          使用当前位置
        </Button>

        <div className="flex flex-col gap-2 overflow-auto">
          <div className="flex items-center gap-2">
            {districtPath.length > 0 && (
              <Button
                size="small"
                variant="text"
                onClick={() => setDistrictPath(districtPath.slice(0, -1))}
              >
                返回
              </Button>
            )}
            <Typography.Title>
              {isSearching ? "搜索结果" : (currentParent?.name ?? "全部省份和城市")}
            </Typography.Title>
          </div>

          <Menu
            size="large"
            onClick={(key) => {
              const code = key.toString();
              if (data?.provinceMap.has(code)) {
                const province = data.provinceMap.get(code);
                if (!province) return;
                setKeyword("");
                searchDistricts("");
                setDistrictPath(isSearching ? [province] : [...districtPath, province]);
                return;
              }

              toggleDistrict(code);
            }}
            items={(visibleDistricts ?? []).map(({ code, name }) => {
              const isProvince = data?.provinceMap.has(code);

              return {
                key: code,
                leading: isProvince ? undefined : (
                  <span onClick={(event) => event.stopPropagation()}>
                    <Checkbox
                      checked={isDistrictSelected(code)}
                      onChange={() => toggleDistrict(code)}
                    />
                  </span>
                ),
                label: name,
                trailing: isProvince && (
                  <Button
                    size="small"
                    variant="text"
                    onClick={(event) => {
                      event.stopPropagation();
                      const province = data?.provinceMap.get(code);
                      if (!province) return;
                      setKeyword("");
                      searchDistricts("");
                      setDistrictPath(isSearching ? [province] : [...districtPath, province]);
                    }}
                  >
                    城市 <IconKeyboardArrowRight size="large" />
                  </Button>
                ),
              };
            })}
          />
        </div>
      </BottomSheet>
    </div>
  );
};

export default PlanDistricts;
