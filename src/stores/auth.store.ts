import { using } from "@aiszlab/relax/react";
import { User } from "../typings/user";
import { login, whoAmI } from "../api/auth.api";
import { AUTH_TOKENS } from "../constants/api.constant";

interface Store {
  me: User | null;
  login: (input: { who: string; password: string }) => Promise<void>;
  whoAmI: () => Promise<void>;
  logout: () => void;
}

const useAuthStore = using<Store>((setState) => {
  return {
    me: null,

    login: async (input) => {
      const token = await login(input);
      if (!token) throw new Error("登录失败");
      localStorage.setItem(AUTH_TOKENS.AUTHENTICATION, token);
    },

    whoAmI: async () => {
      const user = await whoAmI().catch(() => null);
      if (!user) return;
      setState((state) => ({ ...state, me: user }));
    },

    logout: () => {
      setState((state) => ({ ...state, me: null }));
    },
  };
});

export { useAuthStore };
