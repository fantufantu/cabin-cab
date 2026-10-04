import { useBoolean, useRequest } from "@aiszlab/relax";
import {
  BottomSheet,
  Button,
  IconButton,
  Input,
  Menu,
  Message,
  Tag,
  Typography,
  type SearchRef,
} from "musae";
import { useNavigate } from "@aiszlab/bee/router";
import { usePlanContext } from "../../../contexts/tourist-planning.context";
import TouristPlanHeader from "../../../components/tourist-plan/header";
import TouristPlanFooter from "../../../components/tourist-plan/footer";
import { queryDistricts } from "../../../api/district.api";
import type { District as DistrictModel } from "../../../api/district.types";
import { IconKeyboardArrowRight, IconClose, IconLocationCity } from "musae/icons";
import { useMemo, useRef, useState } from "react";
import { getCurrentPosition, GeolocationError } from "../../../utils/geolocation.util";
import { reverseGeocode } from "../../../api/location.api";

const PlanDistricts = () => {
  const {
    "0": isVisible,
    "1": { turnOn, turnOff },
  } = useBoolean();

  const {
    districts: { selectedDistrictCodes, toggleDistrictCode },
  } = usePlanContext();
  const navigate = useNavigate();
  const [isLocating, setIsLocating] = useState(false);

  const searchRef = useRef<SearchRef>(null);
  const districtLookupRef = useRef(new Map<string, DistrictModel>());

  const {
    data,
    error,
    loading,
    run: searchDistricts,
  } = useRequest(
    (keyword?: string) =>
      queryDistricts({
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

  const districts = useMemo(
    () => new Map((data ?? []).map((district) => [district.code, district])),
    [data],
  );

  const focusSearch = () => {
    searchRef.current?.focus();
  };

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

    const district = districts.get(result.districtCode);
    if (!district) {
      Message.error({ description: "当前位置对应的城市暂不支持选择" });
      return;
    }

    if (!selectedDistrictCodes.has(district.code)) toggleDistrictCode(district.code);
    Message.success({ description: `已添加${district.name}` });
  };

  return (
    <div className="min-h-screen flex flex-col bg-color-surface">
      <TouristPlanHeader title="选择目的地" step={1} subTitle="支持选择多个城市，可连续勾选" />

      <main className="px-4 py-4 flex flex-col gap-5">
        <Typography.Title>你想去哪里？</Typography.Title>

        <Typography.Body>选择目的地后，为您推荐合适行程</Typography.Body>

        <Input label="目的城市" placeholder="请选择一个或多个城市" onClick={turnOn}></Input>

        <Typography.Label>为您推荐的城市</Typography.Label>
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
              {Array.from(selectedDistrictCodes).map((code) => {
                const district = districts.get(code);

                return (
                  <Tag
                    key={code}
                    closable
                    onClose={() => toggleDistrictCode(code)}
                    className="rounded-full"
                  >
                    {district?.name ?? code}
                  </Tag>
                );
              })}
            </div>
          </section>
        )}

        <Input placeholder="请搜索省份或城市"></Input>

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
          <Typography.Title>全部省份和城市</Typography.Title>

          <Menu
            size="large"
            selectedKeys={Array.from(selectedDistrictCodes)}
            onClick={(code) => toggleDistrictCode(String(code))}
            items={(data ?? []).map(({ code, name }) => ({
              key: code,
              label: name,
              trailing: <IconKeyboardArrowRight size="large" />,
            }))}
          />
        </div>
      </BottomSheet>
    </div>
  );
};

export default PlanDistricts;
