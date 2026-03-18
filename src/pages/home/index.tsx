import { Button } from "musae";
import styles from "./index.module.css";
import { stringify } from "@aiszlab/relax/class-name";

const Home = () => {
  return (
    <div className="flex flex-col gap-8">
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

        <Button className="mt-4">开始规划我的旅行</Button>

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

      <div>
        <h1 className="text-2xl">
          如何使用&nbsp;<span className="text-sm">4步生成专属旅行路线</span>
        </h1>
      </div>
    </div>
  );
};

export default Home;
