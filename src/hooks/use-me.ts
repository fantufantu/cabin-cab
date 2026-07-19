import { useMemo } from "react";
import { useAuthStore } from "../stores/auth.store";
import useAppStore from "../stores/app.store";
import { User } from "../typings/user";
import { useLazyQuery } from "@apollo/client/react";
import { COUNT_TOURIST_PLANS_TODAY } from "../api/tourist-plan.api";
import { GUEST_QUOTA } from "../utils/tauri.util";

const useMe = () => {
  const { me } = useAuthStore();
  const { getAppId } = useAppStore();
  const [countTouristPlansToday] = useLazyQuery(COUNT_TOURIST_PLANS_TODAY);

  return useMemo(async (): Promise<User> => {
    return (
      me ??
      getAppId()
        .then((appId) => {
          return countTouristPlansToday({
            variables: {
              belongToId: appId,
            },
          })
            .catch(() => null)
            .then((_v) => {
              return {
                appId,
                usedQuota: _v?.data?.countTouristPlansToday ?? 1,
              };
            });
        })
        .then<User>(({ appId, usedQuota }) => {
          return {
            nickname: `游客${appId.slice(-6)}`,
            username: appId,
            membership: {
              name: "游客",
              quota: GUEST_QUOTA,
            },
            usedQuota,
          };
        })
    );
  }, [me]);
};

export default useMe;
