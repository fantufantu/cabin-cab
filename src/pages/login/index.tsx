import { useState } from "react";
import { Button, Checkbox, Form, Input } from "musae";
import { useNavigate, Link } from "@aiszlab/bee/router";
import { useAuthStore } from "../../stores/auth.store";
import { Notification } from "musae";
import { IconRocketLaunch } from "musae/icons";
import { stringify } from "@aiszlab/relax/class-name";

interface FormValue {
  who?: string;
  password?: string;
  isAgreed?: boolean;
}

const Login = () => {
  const navigate = useNavigate();
  const { login, whoAmI } = useAuthStore();
  const form = Form.useForm<FormValue>({
    defaultValue: { isAgreed: false },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    const isValid = await form.validate();
    if (!isValid) return;
    setIsSubmitting(true);

    const { who, password } = form.getFieldsValue();

    const isSucceed = await login({ who: who!, password: password! })
      .then(() => whoAmI())
      .then(() => true)
      .catch(() => false)
      .finally(() => {
        setIsSubmitting(false);
      });

    if (!isSucceed) {
      Notification.error({
        title: "登录失败",
        description: "请检查邮箱和密码是否正确",
      });
      return;
    }

    navigate("/", { replace: true });
  };

  return (
    <div className="h-screen flex flex-col safe-pt-12">
      {/* Branding area — top 60% */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8">
        <div className="bg-color-primary rounded-3xl p-6">
          <IconRocketLaunch size={56} className="text-color-on-primary" />
        </div>

        <h1 className="text-2xl font-semibold text-color-on-surface">驾驾旅游助手</h1>
        <p className="text-color-secondary text-sm">AI 智能规划，发现世界之美</p>
      </div>

      {/* Form area — bottom */}
      <div className="px-8 pb-12 flex flex-col gap-4">
        <Form form={form}>
          <Form.Item
            name="who"
            rules={[
              {
                validate: (value) => {
                  if (!value) return "请输入邮箱";
                },
              },
            ]}
          >
            <Input placeholder="邮箱" disabled={isSubmitting} />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              {
                validate: (value) => {
                  if (!value) return "请输入密码";
                },
              },
            ]}
          >
            <Input placeholder="密码" type="password" disabled={isSubmitting} />
          </Form.Item>

          <Form.Item
            name="isAgreed"
            rules={[
              {
                validate: (value) => {
                  if (!value) return "请阅读并同意隐私政策";
                },
              },
            ]}
          >
            <Checkbox disabled={isSubmitting}>
              我已阅读并同意<span className="text-color-primary">驾驾隐私政策</span>
            </Checkbox>
          </Form.Item>
        </Form>

        <Button className="w-full" onClick={handleLogin} loading={isSubmitting}>
          登录
        </Button>

        <Link
          to="/profile"
          replace
          className={stringify(
            "w-full py-3 text-sm text-color-secondary text-center block",
            isSubmitting && "pointer-events-none opacity-50",
          )}
        >
          暂不登录，直接体验
        </Link>
      </div>
    </div>
  );
};

export default Login;
