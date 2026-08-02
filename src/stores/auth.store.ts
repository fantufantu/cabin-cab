import { using } from "@aiszlab/relax/react";
import { User } from "../typings/user";
import { login, whoAmI } from "../api/auth.api";
import { AUTH_TOKENS } from "../constants/api.constant";
import { GUEST_QUOTA, LOCAL_STORAGE, LOCAL_STORAGE_KEYS } from "../utils/tauri.utils";
import { client } from "../api";
import { COUNT_TOURIST_PLANS_TODAY } from "../api/tourist-plan.api";

interface Store {
  me: User | null;
  isLoggedIn: boolean;
  login: (input: { who: string; password: string }) => Promise<void>;
  whoAmI: () => Promise<void>;
  logout: () => void;
  myId: () => Promise<string>;
}

const useAuthStore = using<Store>((setState, getState) => {
  let _appId: string | undefined;

  const createAppId = async () => {
    if (_appId) return _appId;

    const appId = crypto.randomUUID();
    LOCAL_STORAGE.set(LOCAL_STORAGE_KEYS.APP_ID, appId)
      .then(() => LOCAL_STORAGE.save())
      .catch(() => null);
    setState((state) => ({ ...state, appId }));
    return appId;
  };

  const getAppId = async () => {
    return (_appId ??=
      (await LOCAL_STORAGE.get<string>(LOCAL_STORAGE_KEYS.APP_ID).catch(() => null)) ??
      (await createAppId()));
  };

  return {
    me: null,

    isLoggedIn: false,

    login: async (input) => {
      const token = await login(input);
      if (!token) throw new Error("登录失败");
      localStorage.setItem(AUTH_TOKENS.AUTHENTICATION, token);
    },

    whoAmI: async () => {
      const [user, appId] = await Promise.all([
        // 查询用户信息
        whoAmI().catch(() => null),
        // 生成`appId`
        getAppId(),
      ]);

      const usedQuota =
        (
          await client
            .query({
              query: COUNT_TOURIST_PLANS_TODAY,
              variables: {
                belongToId: appId,
              },
            })
            .catch(() => null)
        )?.data?.countTouristPlansToday ?? GUEST_QUOTA;

      setState((state) => ({
        ...state,
        me: user ?? {
          id: appId,
          nickname: `游客${appId.slice(-6)}`,
          username: appId,
          membership: {
            name: "游客",
            quota: GUEST_QUOTA,
          },
          usedQuota,
        },
        isLoggedIn: !!user,
      }));
    },

    logout: () => {
      setState((state) => ({
        ...state,
        me: null,
        isLoggedIn: true,
      }));
    },

    myId: async () => {
      return getState().me?.id ?? (await getAppId());
    },
  };
});

export { useAuthStore };
