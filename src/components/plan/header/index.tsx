import { Progress } from "musae";

interface Props {
  step: number;
  title: string;
  subTitle: string;
}

/**
 * 计划页头
 */
const PlanHeader = ({ title, step, subTitle }: Props) => {
  return (
    <div className="p-5 shadow flex flex-col gap-2">
      <div className="flex items-center">
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
