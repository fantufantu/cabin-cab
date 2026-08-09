import { useNavigate } from "@aiszlab/bee/router";
import { IconButton } from "musae";
import { IconCheck, IconKeyboardArrowLeft } from "musae/icons";
import { stringify } from "@aiszlab/relax/class-name";

interface Props {
  step: number;
  title: string;
  subTitle: string;
}

const TOURIST_PLAN_STEPS = ["城市", "日期", "景点", "路线"] as const;

/**
 * 旅行计划页头
 *
 * 移动端优先的紧凑步骤导航，用 connected-dot stepper 替代传统的
 * 进度条 + 文本标签的多行布局，将 3 行压缩为 2 行。
 */
const TouristPlanHeader = ({ title, step, subTitle }: Props) => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="px-4 pb-3 safe-pt-3 flex flex-col gap-3 sticky top-0 z-50 bg-color-on-primary border-b border-color-outline-variant">
      {/* 顶部：返回按钮 + 标题区域 */}
      <div className="flex items-center gap-2">
        <IconButton size="small" color="secondary" onClick={goBack}>
          <IconKeyboardArrowLeft size={24} />
        </IconButton>

        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-color-on-surface leading-tight">{title}</h1>
          <p className="text-xs text-color-on-surface-variant truncate">{subTitle}</p>
        </div>
      </div>

      {/* 步骤指示器：connected dots */}
      <nav className="flex items-center justify-between px-1" aria-label="规划步骤">
        {TOURIST_PLAN_STEPS.map((label, index) => {
          const stepNum = index + 1;
          const isActive = stepNum === step;
          const isCompleted = stepNum < step;
          const isLast = index === TOURIST_PLAN_STEPS.length - 1;

          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              {/* Step dot */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={stringify(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors duration-300",
                    isActive && "bg-color-primary text-color-on-primary",
                    isCompleted && "bg-color-primary-container text-color-primary",
                    !isActive &&
                      !isCompleted &&
                      "border border-color-outline-variant text-color-on-surface-variant",
                  )}
                >
                  {isCompleted ? <IconCheck size={14} /> : stepNum}
                </div>
                <span
                  className={stringify(
                    "text-xs whitespace-nowrap transition-colors duration-300",
                    isActive && "text-color-primary font-medium",
                    !isActive && "text-color-on-surface-variant",
                  )}
                >
                  {label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 h-px mx-1 mb-5 transition-colors duration-300">
                  <div
                    className={stringify(
                      "h-full rounded-full transition-colors duration-300",
                      stepNum <= step ? "bg-color-primary" : "bg-color-outline-variant",
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default TouristPlanHeader;
