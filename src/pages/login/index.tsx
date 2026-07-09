import { useState } from "react";
import { Button, Checkbox, Input } from "musae";
import { useNavigate } from "@aiszlab/bee/router";
import { useAuthStore } from "../../stores/auth.store";
import { Notification } from "musae";
import { RocketLaunch } from "musae/icons";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSubmit = !!username && !!password && agreed;

  const handleLogin = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await login({ username, password });
      navigate("/", { replace: true });
    } catch {
      Notification.error({
        title: "登录失败",
        description: "请检查邮箱和密码是否正确",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col safe-pt-12">
      {/* Branding area — top 60% */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8">
        <div className="bg-color-primary rounded-3xl p-6">
          <RocketLaunch size={56} className="text-color-on-primary" />
        </div>

        <h1 className="text-2xl font-semibold text-color-on-surface">驾驾旅游助手</h1>
        <p className="text-color-secondary text-sm">AI 智能规划，发现世界之美</p>
      </div>

      {/* Form area — bottom */}
      <div className="px-8 pb-12 flex flex-col gap-4">
        <Input
          placeholder="邮箱"
          value={username}
          onChange={setUsername}
          disabled={loading}
        />

        <Input
          placeholder="密码"
          type="password"
          value={password}
          onChange={setPassword}
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleLogin();
          }}
        />

        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={agreed}
            onChange={() => setAgreed(!agreed)}
            disabled={loading}
          />
          <span className="text-sm text-color-secondary">
            我已阅读并同意<span className="text-color-primary">驾驾隐私政策</span>
          </span>
        </label>

        <Button
          className="w-full"
          onClick={handleLogin}
          loading={loading}
          disabled={!canSubmit}
        >
          登录
        </Button>

        <button
          type="button"
          className="w-full py-3 text-sm text-color-secondary bg-transparent border-none cursor-pointer"
          onClick={() => navigate("/profile", { replace: true })}
          disabled={loading}
        >
          暂不登录，直接体验
        </button>
      </div>
    </div>
  );
};

export default Login;
