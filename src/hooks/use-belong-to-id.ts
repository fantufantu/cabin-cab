import { useAuthStore } from "../stores/auth.store";
import useAppStore from "../stores/app.store";
import { useEvent } from "@aiszlab/relax";

/**
 * 获取 belongToId — 登录用户返回 username，未登录返回设备 appId
 */
export const useBelongToId = () => {
  const { me } = useAuthStore();
  const { getAppId } = useAppStore();

  const getBelongToId = useEvent(async () => {
    return me?.username ?? (await getAppId());
  });

  return getBelongToId;
};
