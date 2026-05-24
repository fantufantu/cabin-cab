import { Nullable } from "@aiszlab/relax/types";
import { AUTH_TOKENS } from "../constants/api.constant";

/**
 * 获取当前应用认证信息
 */
export const tryAuthenticate = (): Nullable<string> => {
  return localStorage.getItem(AUTH_TOKENS.AUTHENTICATION);
};
