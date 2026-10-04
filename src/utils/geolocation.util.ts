import { isTauri } from "./tauri.utils";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type GeolocationErrorCode =
  | "unsupported"
  | "permission-denied"
  | "position-unavailable"
  | "timeout";

export class GeolocationError extends Error {
  constructor(public code: GeolocationErrorCode) {
    super(code);
    this.name = "GeolocationError";
  }
}

/**
 * 获取当前设备坐标。浏览器使用 Web API，Tauri 使用原生定位插件并申请系统权限。
 */
export async function getCurrentPosition(): Promise<Coordinates> {
  if (isTauri()) {
    const { checkPermissions, getCurrentPosition: getTauriPosition, requestPermissions } =
      await import("@tauri-apps/plugin-geolocation").catch(() => {
        throw new GeolocationError("position-unavailable");
      });

    let permissions = await checkPermissions().catch(() => {
      throw new GeolocationError("position-unavailable");
    });
    if (
      permissions.location === "prompt" ||
      permissions.location === "prompt-with-rationale"
    ) {
      permissions = await requestPermissions(["location"]).catch(() => {
        throw new GeolocationError("permission-denied");
      });
    }
    if (permissions.location !== "granted") {
      throw new GeolocationError("permission-denied");
    }

    const position = await getTauriPosition({
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 60000,
    }).catch(() => {
      throw new GeolocationError("position-unavailable");
    });
    const { coords } = position;
    return { latitude: coords.latitude, longitude: coords.longitude };
  }

  if (typeof navigator === "undefined" || !navigator.geolocation) {
    throw new GeolocationError("unsupported");
  }

  const { coords } = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => {
        const code: GeolocationErrorCode =
          error.code === error.PERMISSION_DENIED
            ? "permission-denied"
            : error.code === error.TIMEOUT
              ? "timeout"
              : "position-unavailable";
        reject(new GeolocationError(code));
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 },
    );
  });

  return { latitude: coords.latitude, longitude: coords.longitude };
}
