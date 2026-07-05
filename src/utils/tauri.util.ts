import { tryParse } from "@aiszlab/relax";
import { LazyStore } from "@tauri-apps/plugin-store";

/**
 * 是否在 tauri 环境下
 */
export function isTauri() {
  return !!window.isTauri;
}

/**
 * 存储键
 */
export const LOCAL_STORAGE_KEYS = {
  APP_ID: "appId",
};

/**
 * browser localStorage 降级，接口与 LazyStore 对齐
 */
const browserLocalStorage = {
  async get<T>(key: string): Promise<T | undefined> {
    return tryParse(window.localStorage.getItem(key));
  },

  async set(key: string, value: unknown): Promise<void> {
    window.localStorage.setItem(key, JSON.stringify(value));
  },

  async save(): Promise<void> {
    // localStorage 同步写入，无需额外操作
  },
};

/**
 * 持久化存储，tauri 环境使用文件存储，浏览器降级使用 localStorage
 */
export const LOCAL_STORAGE = isTauri()
  ? new LazyStore("./cabin-cab.store.json")
  : browserLocalStorage;
