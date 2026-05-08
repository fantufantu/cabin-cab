import { useNavigate } from "@aiszlab/bee/router";
import { Button, IconButton, Progress } from "musae";
import { KeyboardArrowLeft } from "musae/icons";

interface Props {
  step: number;
  title: string;
  subTitle: string;
}

const TOURIST_PLAN_STEP: { title: string }[] = [
  {
    title: "城市",
  },
  {
    title: "日期",
  },
  {
    title: "景点",
  },
  {
    title: "路线",
  },
] as const;

/**
 * 旅行计划页头
 */
const TouristPlanHeader = ({ title, step, subTitle }: Props) => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="p-5 shadow flex flex-col gap-2 sticky top-0 z-50 bg-color-on-primary">
      <div className="flex items-center gap-3">
        <IconButton size="small" color="secondary" onClick={goBack}>
          <KeyboardArrowLeft size={24} />
        </IconButton>

        <div className="mr-auto">
          <h1 className="text-xl font-semibold">{title}</h1>
          <span className="text-sm text-color-secondary">{subTitle}</span>
        </div>

        <span className="text-color-secondary">{step} / 4</span>
      </div>

      <Progress value={(step / 4) * 100} />

      <div className="flex justify-between text-color-secondary text-sm">
        {TOURIST_PLAN_STEP.map(({ title }) => {
          return <span key={title}>{title}</span>;
        })}
      </div>
    </div>
  );
};

export default TouristPlanHeader;
