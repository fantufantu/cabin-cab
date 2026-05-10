import { LazyStore } from "@tauri-apps/plugin-store";

/**
 * 是否在 tauri 环境下
 */
export function isTauri() {
  return !!window.isTauri;
}

/* 应用存储 start */

/**
 * 存储键
 */
export const LOCAL_STORAGE_KEYS = {
  APP_ID: "appId",
};

/**
 * tauri 文件存储
 */
export const LOCAL_STORAGE = new LazyStore("./cabin-cab.store.json");

/* 应用存储 end */
