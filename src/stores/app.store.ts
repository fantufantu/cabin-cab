import { using } from "@aiszlab/relax/react";
import { LOCAL_STORAGE, LOCAL_STORAGE_KEYS } from "../utils/tauri.util";

interface AppStore {
  createAppId: () => Promise<string>;
  getAppId: () => Promise<string>;
}

const useAppStore = using<AppStore>((setStore) => {
  let _appId: string | undefined;

  const createAppId = async () => {
    if (_appId) return _appId;

    const appId = crypto.randomUUID();
    LOCAL_STORAGE.set(LOCAL_STORAGE_KEYS.APP_ID, appId)
      .then(() => LOCAL_STORAGE.save())
      .catch(() => null);
    setStore((store) => ({ ...store, appId }));
    return appId;
  };

  const getAppId = async () => {
    return (_appId ??=
      (await LOCAL_STORAGE.get<string>(LOCAL_STORAGE_KEYS.APP_ID).catch(() => null)) ??
      (await createAppId()));
  };

  return {
    createAppId,
    getAppId,
  };
});

export default useAppStore;
