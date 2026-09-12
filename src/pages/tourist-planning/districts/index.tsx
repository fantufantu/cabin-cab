import { useBoolean, useRequest } from "@aiszlab/relax";
import { BottomSheet, Button, Input, Menu, Typography, type SearchRef } from "musae";
import { useNavigate } from "@aiszlab/bee/router";
import { usePlanContext } from "../../../contexts/tourist-planning.context";
import TouristPlanHeader from "../../../components/tourist-plan/header";
import TouristPlanFooter from "../../../components/tourist-plan/footer";
import { queryDistricts } from "../../../api/district.api";
import type { District as DistrictModel } from "../../../api/district.types";
import { IconKeyboardArrowRight, IconClose, IconLocationCity } from "musae/icons";
import { useMemo, useRef } from "react";

const PlanDistricts = () => {
  const {
    "0": isVisible,
    "1": { turnOn, turnOff },
  } = useBoolean();

  const {
    districts: { selectedDistrictCodes, toggleDistrictCode },
  } = usePlanContext();
  const navigate = useNavigate();

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
          <IconClose size="large" />
        </div>

        <Input placeholder="请搜索省份或城市"></Input>

        <Button prefix={<IconLocationCity />} size="small" variant="outlined" className="w-fit">
          使用当前位置
        </Button>

        <div className="flex flex-col gap-2 overflow-auto">
          <Typography.Title>全部省份和城市</Typography.Title>

          <Menu
            size="large"
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
