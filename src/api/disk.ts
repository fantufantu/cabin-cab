import { invoke } from "@tauri-apps/api/core";

export interface DiskInfo {
  total: number;
  used: number;
}

/**
 * @description get disk info
 */
export async function getDiskInfo() {
  return await invoke<DiskInfo>("get_disk_info");
}
