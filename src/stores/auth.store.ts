import { using } from "@aiszlab/relax/react";
import { User } from "../typings/user";
import { login, whoAmI } from "../api/auth.api";
import { AUTH_TOKENS } from "../constants/api.constant";

interface Store {
  me: User | null;
  login: (input: { username: string; password: string }) => Promise<void>;
  whoAmI: () => Promise<void>;
}

const useAuthStore = using<Store>((setState) => {
  return {
    me: null,

    login: async (input) => {
      const token = await login(input);
      if (!token) throw new Error("登录失败");
      localStorage.setItem(AUTH_TOKENS.AUTHENTICATION, token);
      const user = await whoAmI();
      if (!user) return;
      setState((state) => ({ ...state, me: user }));
    },

    whoAmI: async () => {
      const user = await whoAmI().catch(() => null);
      if (!user) return;
      setState((state) => ({ ...state, me: user }));
    },
  };
});

export { useAuthStore };
