import { using } from "@aiszlab/relax/react";
import { User } from "../typings/user";
import { login, whoAmI } from "../api/auth.api";
import { AUTH_TOKENS } from "../constants/api.constant";
import useAppStore from "./app.store";
import { GUEST_QUOTA } from "../utils/tauri.util";
import { client } from "../api";
import { COUNT_TOURIST_PLANS_TODAY } from "../api/tourist-plan.api";

interface Store {
  me: User | null;
  isLoggedIn: boolean;
  login: (input: { who: string; password: string }) => Promise<void>;
  whoAmI: () => Promise<void>;
  logout: () => void;
}

const useAuthStore = using<Store>((setState) => {
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
        whoAmI().catch(() => null),
        useAppStore.state.getAppId(),
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
  };
});

export { useAuthStore };
