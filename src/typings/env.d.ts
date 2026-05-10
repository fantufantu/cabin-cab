/// <reference types="@aiszlab/wasp/env" />

declare module "react" {
  interface CSSProperties {
    // 允许`CSS`自定义变量
    [$$Key$$: `--${string}`]: string | number | undefined;
  }
}

declare global {
  interface Window {
    // Tauri 环境标识
    isTauri?: boolean;
  }
}

export {};
