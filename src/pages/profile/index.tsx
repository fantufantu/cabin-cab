import { Button, Switch } from "musae";
import { DarkMode, LightMode, Logout } from "musae/icons";
import { useTheme } from "musae";
import { useNavigate } from "@aiszlab/bee/router";
import { useAuthStore } from "../../stores/auth.store";
import { useThemeStore } from "../../stores/theme.store";
import useAppStore from "../../stores/app.store";
import { AUTH_TOKENS } from "../../constants/api.constant";
import UserInfo from "../../components/user/info";
import type { User } from "../../typings/user";

const Profile = () => {
  const { me } = useAuthStore();
  const { mode, toggle } = useTheme();
  const { persist } = useThemeStore();
  const { getAppId } = useAppStore();
  const navigate = useNavigate();

  const isLoggedIn = !!me;

  const user = me
    ? Promise.resolve(me)
    : getAppId().then<User>((appId) => ({
        nickname: `用户${appId.slice(-6)}`,
        username: appId,
      }));

  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKENS.AUTHENTICATION);
    navigate("/profile", { replace: true });
  };

  return (
    <div className="flex flex-col gap-6 safe-pt-5 px-5 py-8">
      {/* User info — Suspense handled internally */}
      <UserInfo user={user} />

      {/* Theme toggle */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-xl border"
        style={{ borderColor: "var(--color-outline)" }}
      >
        <div className="flex items-center gap-3">
          {mode === "dark" ? <DarkMode /> : <LightMode />}
          <span className="text-color-on-surface">昼夜模式</span>
        </div>
        <Switch
          value={mode === "dark"}
          onChange={() => persist(toggle())}
          icon
          checkedChildren={<DarkMode />}
          uncheckedChildren={<LightMode />}
        />
      </div>

      {/* Logout — only shown when actually logged in */}
      {isLoggedIn && (
        <Button
          variant="outlined"
          color="secondary"
          className="flex items-center justify-center gap-3"
          prefix={<Logout />}
          onClick={handleLogout}
        >
          退出登录
        </Button>
      )}

      {/* Register / Login guide — only shown when not logged in */}
      {!isLoggedIn && (
        <div className="flex flex-col gap-3 mt-4 p-4 rounded-xl bg-color-surface-container-low">
          <p className="text-sm text-color-secondary">登录后可同步出行计划到云端，跨设备查看</p>
          <div className="flex gap-3">
            <Button className="flex-1" onClick={() => navigate("/login")}>
              登录
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
