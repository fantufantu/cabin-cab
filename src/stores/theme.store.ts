import { using } from "@aiszlab/relax/react";
import { LOCAL_STORAGE, LOCAL_STORAGE_KEYS } from "../utils/tauri.util";
import { Mode } from "musae/types/theme";

interface Store {
  mode?: Mode;
  init: () => void;
  persist: (mode: Mode) => void;
}

const useThemeStore = using<Store>((setState) => ({
  mode: void 0,

  init: async () => {
    const _mode = await LOCAL_STORAGE.get<string>(LOCAL_STORAGE_KEYS.THEME_MODE).catch(() => null);
    setState((state) => ({ ...state, mode: _mode === "dark" ? "dark" : "light" }));
  },

  persist: (mode: Mode) => {
    LOCAL_STORAGE.set(LOCAL_STORAGE_KEYS.THEME_MODE, mode).then(() => LOCAL_STORAGE.save());
    setState((state) => ({ ...state, mode }));
  },
}));

export { useThemeStore };
