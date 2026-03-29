import { Button, Calendar, IconButton, Tag } from "musae";
import { Add, Remove, CalendarToday, KeyboardArrowRight, KeyboardArrowLeft } from "musae/icons";
import { usePlanContext } from "../../../contexts/plan.context";
import { useNavigate } from "@aiszlab/bee/router";
import { useMemo } from "react";
import dayjs from "dayjs";
import PlanHeader from "../../../components/plan/header";

const PlanPeriod = () => {
  const navigate = useNavigate();
  const {
    cities: { selectedAdcodes },
    period: { dayCount, addDayCount, startFrom, subtractDayCount, setStartFrom },
  } = usePlanContext();

  const goBack = () => {
    navigate(-1);
  };

  // 旅游周期截止时间
  const endTo = useMemo(() => {
    return dayjs(startFrom).add(dayCount, "day");
  }, [startFrom, dayCount]);

  const goNext = () => {
    navigate("/plan/tourist-attractions");
  };

  return (
    <div className="min-h-screen flex flex-col gap-4">
      <PlanHeader title="计划周期" step={2} subTitle="选择旅游周期" />

      <div className="mx-5 p-4 shadow-lg rounded-2xl flex flex-col gap-2">
        <h3>旅游天数</h3>

        <div className="flex items-center gap-3">
          {[3, 5, 7, 10, 14].map((dayCount) => {
            return <Tag key={dayCount}>{dayCount}天</Tag>;
          })}
        </div>

        <div className="px-4 py-2 bg-color-surface-container-low rounded-full flex items-center gap-3">
          <span className="mr-auto">自定义天数</span>

          <IconButton size="small" color="secondary" onClick={() => subtractDayCount()}>
            <Remove size="small" />
          </IconButton>

          <span>{dayCount}天</span>

          <IconButton size="small" onClick={() => addDayCount()}>
            <Add size="small" />
          </IconButton>
        </div>
      </div>

      <div className="mx-5 p-4 shadow-lg rounded-2xl flex justify-center">
        <Calendar value={[startFrom, endTo]} onClick={setStartFrom} />
      </div>

      <div className="mx-5 p-4 bg-color-primary text-color-on-primary rounded-2xl flex flex-col gap-2">
        <h3>行程摘要</h3>

        <div className="bg-color-surface-container-highest rounded-lg p-2 text-color-on-surface text-sm">
          计划旅游 {selectedAdcodes.size} 个城市，建议合理分配每城游览时间
        </div>
      </div>

      <div className="mt-auto sticky bottom-0 flex items-center px-6 py-4 gap-3 bg-color-on-primary border-t border-color-outline">
        <IconButton size="small" color="secondary" onClick={goBack}>
          <KeyboardArrowLeft />
        </IconButton>

        <Button
          className="flex-1"
          prefix={<CalendarToday />}
          suffix={<KeyboardArrowRight />}
          onClick={goNext}
        >
          确认 {dayCount} 天
        </Button>
      </div>
    </div>
  );
};

export default PlanPeriod;
