import { Button, Grid } from "musae";
import styles from "./index.module.css";
import { stringify } from "@aiszlab/relax/class-name";
import { AddAlert, AccountCircle, AttachFile, AutoDelete } from "musae/icons";
import { useNavigate } from "@aiszlab/bee/router";

const { Col, Row } = Grid;

const Home = () => {
  const navigate = useNavigate();

  const startPlan = () => {
    navigate("/plan/cities");
  };

  return (
    <div className="flex flex-col gap-8 pb-4">
      <div className={stringify("bg-cover px-8 py-12", styles["getting-started"])}>
        <h1 className="text-color-on-primary text-2xl">旅行规划助手</h1>
        <p className="text-color-secondary">AI 智能规划</p>

        <h2 className="text-color-on-primary text-3xl mt-5">发现世界之美</h2>
        <h2 className="text-color-on-primary text-3xl">
          <span className="text-color-primary">智能规划</span>每段旅程
        </h2>

        <ol className="text-color-secondary mt-3">
          <li>选择心仪城市</li>
          <li>设定旅行周期</li>
          <li>系统为你智能生成专属出行路线</li>
        </ol>

        <Button className="mt-4" onClick={startPlan}>
          开始规划我的旅行
        </Button>

        <div className="mt-15 backdrop-blur-2xl bg-color-on-primary-20 rounded-2xl border border-(--color-on-primary-20) flex justify-around py-3">
          {[
            { value: "10+", label: "热门城市" },
            { value: "80+", label: "精选景点" },
            { value: "AI", label: "智能规划" },
          ].map(({ label, value }) => (
            <div key={label}>
              <span className="text-md text-color-on-primary font-medium">{value}</span>
              <span className="text-xs text-color-secondary">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4">
        <h1 className="text-2xl font-medium mb-3">
          如何使用&nbsp;<span className="text-sm font-normal">4步生成专属旅行路线</span>
        </h1>

        <Row gutter={12}>
          {[
            {
              icon: AddAlert,
              title: "选择城市",
              desc: "挑选你想去的城市",
              color: "#E3F2FD",
              iconColor: "#2196F3",
            },
            {
              icon: AccountCircle,
              title: "设定周期",
              desc: "规划出行日期时长",
              color: "#E8F5E9",
              iconColor: "#4CAF50",
            },
            {
              icon: AttachFile,
              title: "选择景点",
              desc: "勾选感兴趣的景点",
              color: "#FFF3E0",
              iconColor: "#FF9800",
            },
            {
              icon: AutoDelete,
              title: "生成路线",
              desc: "AI自动排布最优行程",
              color: "#F3E5F5",
              iconColor: "#9C27B0",
            },
          ].map((step) => (
            <Col
              span={12}
              key={step.title}
              style={{ backgroundColor: step.color }}
              className="rounded-xl p-3"
            >
              <div>
                <step.icon size={22} color={step.iconColor} />
              </div>
              <h3 className="text-sm">{step.title}</h3>
              <p className="text-xs text-color-secondary">{step.desc}</p>
            </Col>
          ))}
        </Row>
      </div>

      <Button className="mx-4" onClick={startPlan}>
        立刻开始规划
      </Button>
    </div>
  );
};

export default Home;
