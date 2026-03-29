import { useNavigate } from "@aiszlab/bee/router";
import { IconButton, Progress } from "musae";
import { KeyboardArrowLeft } from "musae/icons";

interface Props {
  step: number;
  title: string;
  subTitle: string;
}

/**
 * 计划页头
 */
const PlanHeader = ({ title, step, subTitle }: Props) => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="p-5 shadow flex flex-col gap-2 sticky top-0 z-10 bg-color-on-primary">
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
        {["城市", "日期", "景点", "路线"].map((item) => {
          return <span key={item}>{item}</span>;
        })}
      </div>
    </div>
  );
};

export default PlanHeader;
