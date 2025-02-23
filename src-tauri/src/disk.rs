use sysinfo::System;

#[derive(serde::Serialize)]
pub struct DiskInfo {
    total: u64,
    used: u64,
}

#[tauri::command]
pub fn get_disk_info() -> DiskInfo {
    let mut sys = System::new_all();
    sys.refresh_all();

    let disk_info: DiskInfo = DiskInfo {
        total: sys.total_memory(),
        used: sys.used_memory(),
    };

    return disk_info;
}
