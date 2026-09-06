import { Button, Grid } from "musae";
import styles from "./index.module.css";
import { stringify } from "@aiszlab/relax/class-name";
import { IconBolt, IconExplore, IconPsychology, IconSwapHoriz } from "musae/icons";
import { useNavigate } from "@aiszlab/bee/router";
import RouteAnimation from "./route-animation";

const { Col, Row } = Grid;

const VALUE_CARDS = [
  {
    icon: IconPsychology,
    title: "个性规划",
    desc: "根据你的偏好，定制专属旅行路线",
    surfaceVar: "bg-color-surface-container-low" as const,
  },
  {
    icon: IconBolt,
    title: "省时省心",
    desc: "不再翻攻略做功课，AI 一键搞定",
    surfaceVar: "bg-color-surface-container-high" as const,
  },
  {
    icon: IconSwapHoriz,
    title: "随时调整",
    desc: "行程随时修改，新方案即刻生成",
    surfaceVar: "bg-color-surface-container-highest" as const,
  },
];

const STATS = [
  { value: "10+", label: "热门城市" },
  { value: "80+", label: "精选景点" },
  { value: "AI", label: "智能规划" },
];

const Home = () => {
  const navigate = useNavigate();

  const startTouristPlan = () => {
    navigate("/tourist-planning/districts");
  };

  const viewTouristPlans = () => {
    navigate("/tourist-plan/list");
  };

  return (
    <div className="flex flex-col gap-10 pb-4">
      {/* Hero */}
      <div className={stringify("px-6 pb-10 safe-pt-12", styles["getting-started"])}>
        {/* 路线动画 */}
        <div className="mb-4">
          <RouteAnimation />
        </div>

        {/* 标题区 */}
        <p className="text-color-on-surface-variant text-sm font-medium">
          AI 智能规划
        </p>
        <h1 className="text-color-on-surface text-3xl font-bold mt-2 leading-tight">
          发现世界之美
        </h1>
        <h2 className="text-color-on-surface text-3xl font-bold leading-tight">
          <span className="text-color-primary">智能规划</span>每段旅程
        </h2>
        <p className="text-color-on-surface-variant text-sm mt-2">
          选择城市 · 设定周期 · AI 自动生成专属路线
        </p>

        {/* CTA */}
        <Button className="mt-6 w-full" onClick={startTouristPlan}>
          开始规划我的旅行
        </Button>

        {/* 统计条 */}
        <div className="mt-10 backdrop-blur-xl bg-color-surface-container-high rounded-2xl border border-color-outline-variant flex justify-around py-3">
          {STATS.map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center">
              <span className="text-lg text-color-primary font-bold">{value}</span>
              <span className="text-xs text-color-on-surface-variant">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI 为你做什么 */}
      <div className="px-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <IconExplore size={24} />
          AI 为你做什么
        </h2>

        <Row gutter={12} className="mt-4">
          {VALUE_CARDS.map((card) => (
            <Col span={card.title === "随时调整" ? 24 : 12} key={card.title}>
              <div
                className={`${card.surfaceVar} rounded-2xl p-4 border border-color-outline-variant`}
              >
                <div className="bg-color-primary-container rounded-xl w-10 h-10 flex items-center justify-center">
                  <card.icon size={22} color="var(--color-primary)" />
                </div>
                <h3 className="text-base font-medium mt-3">{card.title}</h3>
                <p className="text-sm text-color-on-surface-variant mt-1">{card.desc}</p>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* 底部 CTA */}
      <div className="px-4 flex flex-col gap-3">
        <Button onClick={startTouristPlan}>立刻开始规划</Button>
        <button
          className="text-color-on-surface-variant text-sm py-2"
          onClick={viewTouristPlans}
          type="button"
        >
          查看已有计划
        </button>
      </div>
    </div>
  );
};

export default Home;
