import { Button, Calendar, IconButton, Tag } from "musae";
import { IconAdd, IconRemove, IconCalendarToday, IconKeyboardArrowRight, IconKeyboardArrowLeft } from "musae/icons";
import { usePlanContext } from "../../../contexts/tourist-planning.context";
import { useNavigate } from "@aiszlab/bee/router";
import { createPortal } from "react-dom";
import { useCallback, useMemo } from "react";
import dayjs from "dayjs";
import { useEvent } from "@aiszlab/relax";
import { TouristPlanHeaderContent } from "../../../components/tourist-plan/header";
import {
  getNextTouristPlanningPath,
  getTouristPlanningFlowStep,
} from "../../../constants/tourist-planning.constant";

const PlanPeriod = () => {
  const navigate = useNavigate();
  const {
    districts: { selectedDistrictCodes },
    period: { duration, setDuration, addDuration, depatureAt, subtractDuration, setDepatureAt },
    headerContainer,
    footerContainer,
  } = usePlanContext();

  const goBack = useEvent(() => navigate(-1));

  // 旅游周期截止时间
  const endTo = useMemo(() => {
    return dayjs(depatureAt).add(duration, "day");
  }, [depatureAt, duration]);

  const goNext = useEvent(() => navigate(getNextTouristPlanningPath("period")));

  const disabledDate = useCallback((date: dayjs.Dayjs) => {
    return date.isBefore(dayjs(), "day");
  }, []);

  return (
    <>
      <div className="flex flex-1 flex-col gap-4">
        <div className="mx-5 p-4 shadow-lg rounded-2xl flex flex-col gap-2">
          <h3>旅游天数</h3>

          <div className="flex items-center gap-3">
            {[3, 5, 7, 10, 14].map((_duration) => {
              return (
                <Tag
                  key={_duration}
                  variant={duration === _duration ? "filled" : "outlined"}
                  onClick={() => {
                    setDuration(_duration);
                  }}
                >
                  {_duration}天
                </Tag>
              );
            })}
          </div>

          <div className="px-4 py-2 bg-color-surface-container-low rounded-full flex items-center gap-3">
            <span className="mr-auto">自定义天数</span>

            <IconButton size="small" color="secondary" onClick={() => subtractDuration()}>
              <IconRemove size="small" />
            </IconButton>

            <span>{duration}天</span>

            <IconButton size="small" onClick={() => addDuration()}>
              <IconAdd size="small" />
            </IconButton>
          </div>
        </div>

        <div className="mx-5 p-4 shadow-lg rounded-2xl flex justify-center">
          <Calendar value={[depatureAt, endTo]} onClick={setDepatureAt} disabledDate={disabledDate} />
        </div>

        <div className="mx-5 p-4 bg-color-primary text-color-on-primary rounded-2xl flex flex-col gap-2">
          <h3>行程摘要</h3>

          <div className="bg-color-surface-container-highest rounded-lg p-2 text-color-on-surface text-sm">
            计划旅游 {selectedDistrictCodes.size} 个城市，建议合理分配每城游览时间
          </div>
        </div>
      </div>
      {headerContainer &&
        createPortal(
          <TouristPlanHeaderContent
            title={getTouristPlanningFlowStep("period").title}
            subTitle={getTouristPlanningFlowStep("period").subTitle}
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
              onClick={goNext}
            >
              确认 {duration} 天
            </Button>
          </>,
          footerContainer,
        )}
    </>
  );
};

export default PlanPeriod;
