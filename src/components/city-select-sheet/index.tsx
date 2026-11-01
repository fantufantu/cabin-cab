import { useBoolean, useRequest, useToggleable } from "@aiszlab/relax";
import { BottomSheet, Button, Checkbox, Input, Menu, Message, Tag, Typography } from "musae";
import { IconKeyboardArrowRight, IconClose, IconLocationCity } from "musae/icons";
import { useImperativeHandle, useRef, useState, type Ref } from "react";
import { queryDistricts } from "../../api/district.api";
import { type District as DistrictType } from "../../api/district.types";
import { DISTRICT_LEVELS } from "../../constants/district.constant";
import { getCurrentPosition, GeolocationError } from "../../utils/geolocation.util";
import { reverseGeocode } from "../../api/location.api";
import HeaderIconButton from "../header-icon-button";

export interface CitySelectSheetRef {
  open: () => void;
}

interface CitySelectSheetProps {
  ref?: Ref<CitySelectSheetRef>;
  value: DistrictType[];
  onChange: (cities: DistrictType[]) => void;
}

interface ToggleableDistrict {
  key: string;
  children?: ToggleableDistrict[];
}

const CitySelectSheet = ({ ref, value, onChange }: CitySelectSheetProps) => {
  const [isVisible, { turnOn, turnOff }] = useBoolean();
  const [draftDistrictCodes, setDraftDistrictCodes] = useState(
    () => new Set(value.map(({ code }) => code)),
  );
  const [isLocating, setIsLocating] = useState(false);
  const cityCache = useRef(new Map(value.map((city) => [city.code, city])));
  const [keyword, setKeyword] = useState("");
  const [districtPath, setDistrictPath] = useState<DistrictType[]>([]);
  const { data, run: searchDistricts } = useRequest(
    async (keyword?: string) => {
      const districts = await queryDistricts({
        keyword,
      });

      districts.filter(({ level }) => level === DISTRICT_LEVELS.CITY).forEach((city) => cityCache.current.set(city.code, city));

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

  useImperativeHandle(ref, () => ({
    open: () => {
      setDraftDistrictCodes(new Set(value.map(({ code }) => code)));
      setKeyword("");
      setDistrictPath([]);
      searchDistricts("");
      turnOn();
    },
  }));

  const confirmCities = () => {
    value.forEach((city) => cityCache.current.set(city.code, city));
    const cities = Array.from(draftDistrictCodes)
      .map((code) => cityCache.current.get(code))
      .filter((city): city is DistrictType => !!city);
    onChange(cities);
    turnOff();
  };

  const {
    toggledKeys: selectedLeafCodes,
    isToggled: isDistrictSelected,
    toggle,
  } = useToggleable(data?.toggleableDistricts ?? [], {
    selectionMode: "leaf",
    toggledKeys: Array.from(draftDistrictCodes),
    onToggle: (nextCodes) => {
      const next = new Set(nextCodes.map(String));
      const retained = Array.from(draftDistrictCodes).filter((code) => next.has(code));
      const added = Array.from(next).filter((code) => !draftDistrictCodes.has(code));
      setDraftDistrictCodes(new Set([...retained, ...added]));
    },
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

    setDraftDistrictCodes((codes) => new Set([...codes, matchedCity.code]));
    Message.success({ description: `已添加${matchedCity.name}` });
  };

  return (
      <BottomSheet open={isVisible} onClose={turnOff} height="90vh" panelClassName="p-4 gap-4 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center">
          <Typography.Title size="large">选择目的城市</Typography.Title>

          <HeaderIconButton onClick={turnOff} aria-label="关闭城市选择">
            <IconClose size={24} />
          </HeaderIconButton>
        </div>

        {draftDistrictCodes.size > 0 && (
          <section className="flex flex-col gap-2" aria-label="已选城市">
            <Typography.Title>已选城市（{draftDistrictCodes.size}）</Typography.Title>

            <div className="flex flex-wrap gap-2">
              {Array.from(selectedLeafCodes).map((code) => {
                const district = cityCache.current.get(code.toString());

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
          onClick={() => selectCurrentCity()}
        >
          使用当前位置
        </Button>

        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto">
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
        <div className="shrink-0 pb-[env(safe-area-inset-bottom)]">
          <Button className="w-full" onClick={confirmCities}>
            确认（{draftDistrictCodes.size}）
          </Button>
        </div>
      </BottomSheet>
  );
};

export default CitySelectSheet;
