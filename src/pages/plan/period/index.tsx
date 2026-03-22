import { Button, Calendar, IconButton, Tag } from "musae";
import { Add, Remove, CalendarToday, KeyboardArrowRight, KeyboardArrowLeft } from "musae/icons";
import { usePlanContext } from "../../../contexts/plan.context";
import { useNavigate } from "@aiszlab/bee/router";
import { useMemo } from "react";
import dayjs from "dayjs";

const PlanPeriod = () => {
  const navigate = useNavigate();
  const {
    period: { dayCount, addDayCount, startFrom, subtractDayCount },
  } = usePlanContext();

  const prevStep = () => {
    navigate("/plan/cities");
  };

  // 旅游周期截止时间
  const endTo = useMemo(() => {
    return dayjs(startFrom).add(dayCount, "day").endOf("date");
  }, [startFrom, dayCount]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center shadow p-5">
        <div className="mr-auto">
          <h1>计划周期</h1>
        </div>

        <span>2 / 4</span>
      </div>

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
        <Calendar value={[startFrom, endTo]} />
      </div>

      <div className="mx-5 p-4">
        <h3>行程摘要</h3>
      </div>

      <div className="mt-auto sticky bottom-0 flex items-center px-6 py-4 gap-3 bg-color-on-primary border-t border-color-outline">
        <IconButton size="small" color="secondary" onClick={prevStep}>
          <KeyboardArrowLeft />
        </IconButton>

        <Button className="flex-1" prefix={<CalendarToday />} suffix={<KeyboardArrowRight />}>
          确认 {dayCount} 天
        </Button>
      </div>
    </div>
  );
};

export default PlanPeriod;
