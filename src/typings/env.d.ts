/// <reference types="@aiszlab/wasp/env" />

import type { AuthenticationToken } from "@/constants/authentication";

declare module "react" {
  interface CSSProperties {
    // 允许`CSS`自定义变量
    [$$Key$$: `--${string}`]: string | number | undefined;
  }
}

export {};
