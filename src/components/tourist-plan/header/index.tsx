import { useNavigate } from "@aiszlab/bee/router";
import HeaderIconButton from "../../header-icon-button";
import { IconKeyboardArrowLeft } from "musae/icons";
import { stringify } from "@aiszlab/relax/class-name";
import { Progress } from "musae";
import type { Ref } from "react";
import { TOURIST_PLANNING_FLOW } from "../../../constants/tourist-planning.constant";

interface Props {
  step: number;
  contentRef?: Ref<HTMLDivElement>;
}

interface ContentProps {
  title: string;
  subTitle: string;
}

const TOURIST_PLAN_STEPS = Array.from(TOURIST_PLANNING_FLOW.values(), ({ label }) => label);

/**
 * 旅行计划页头
 *
 * 移动端优先的行程规划页头，突出当前步骤并保持导航轻量。
 */
const TouristPlanHeader = ({ contentRef, step }: Props) => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="sticky top-0 z-50 border-b border-color-outline-variant bg-color-surface/95 px-4 pb-4 backdrop-blur-md safe-pt-2">
      <div className="flex items-center gap-3">
        <HeaderIconButton onClick={goBack} aria-label="返回上一页">
          <IconKeyboardArrowLeft size={24} />
        </HeaderIconButton>
        <div ref={contentRef} className="min-w-0 flex-1" />
        <span className="shrink-0 rounded-full bg-color-primary-container px-2.5 py-1 text-xs font-semibold text-color-primary">
          {String(step).padStart(2, "0")} <span className="opacity-60">/ 04</span>
        </span>
      </div>
      <nav className="mt-4" aria-label="规划步骤">
        <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-color-on-surface-variant">
          {TOURIST_PLAN_STEPS.map((label, index) => (
            <span
              key={label}
              className={stringify(index + 1 === step && "text-color-primary font-semibold")}
            >
              {label}
            </span>
          ))}
        </div>
        <Progress
          min={0}
          max={TOURIST_PLAN_STEPS.length}
          value={step}
          aria-label={`第 ${step} 步，共 ${TOURIST_PLAN_STEPS.length} 步`}
        />
      </nav>
    </div>
  );
};

const TouristPlanHeaderContent = ({ title, subTitle }: ContentProps) => {
  return (
    <>
      <p className="mb-0.5 text-[11px] font-semibold tracking-[0.14em] text-color-primary">
        行程规划
      </p>
      <h1 className="truncate text-lg font-semibold leading-tight text-color-on-surface">
        {title}
      </h1>
      <p className="mt-1 truncate text-xs text-color-on-surface-variant">{subTitle}</p>
    </>
  );
};

export default TouristPlanHeader;
export { TouristPlanHeaderContent };
