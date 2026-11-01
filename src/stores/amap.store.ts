import { using } from "@aiszlab/relax/react";
import { getAmapCredential } from "../api/amap.api";

interface Store {
  apiKey: string | null;
  apiSecret: string | null;
  loadApiKey: () => Promise<string | null>;
}

const useAmapStore = using<Store>((setState, getState) => {
  let pending: Promise<string | null> | undefined;

  const fetchApiKey = async () => {
    try {
      const credential = await getAmapCredential().catch(() => null);
      const apiKey = credential?.apiKey ?? null;
      const apiSecret = credential?.apiSecret ?? null;
      setState((state) => ({ ...state, apiKey, apiSecret }));
      return apiKey;
    } finally {
      pending = undefined;
    }
  };

  return {
    apiKey: null,
    apiSecret: null,

    loadApiKey: () => {
      const { apiKey, apiSecret } = getState();
      if (apiKey && apiSecret) return Promise.resolve(apiKey);
      if (pending) return pending;

      pending = fetchApiKey();
      return pending;
    },
  };
});

export { useAmapStore };
