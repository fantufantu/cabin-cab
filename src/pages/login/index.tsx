import { useState } from "react";
import { Button, Input } from "musae";
import { useNavigate } from "@aiszlab/bee/router";
import { useAuthStore } from "../../stores/auth.store";
import { Notification } from "musae";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) return;
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
    <div className="flex flex-col items-center justify-center h-screen px-8 gap-6">
      <h1 className="text-2xl font-medium">登录</h1>

      <div className="w-full flex flex-col gap-4">
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
      </div>

      <Button className="w-full" onClick={handleLogin} loading={loading}>
        登录
      </Button>
    </div>
  );
};

export default Login;
