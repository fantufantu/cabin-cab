import { ValueOf } from "@aiszlab/relax/types";

export const BASE_URL = "https://api.fantufantu.com";

export const GRAPHQL_URL = BASE_URL + "/graphql";

/**
 * 接口状态码
 */
export const STATUS_CODE = {
  CONTINUE: "100",
  SUCCESS: "200",
} as const;

export type StatusCode = ValueOf<typeof STATUS_CODE>;
