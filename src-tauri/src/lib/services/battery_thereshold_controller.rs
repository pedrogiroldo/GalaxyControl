use crate::{services::system_manager::SystemManager, BATTERY_SYSFS_PATH};

#[tauri::command]
pub async fn get_threshold() -> Result<String, String> {
    let sysfs = SystemManager::get_sysfs_manager().map_err(|e| e.to_string())?;

    let value = sysfs
        .get_value(BATTERY_SYSFS_PATH)
        .await
        .map_err(|e| e.to_string())?;

    Ok(value)
}

#[tauri::command]
pub async fn set_threshold(value: u32) -> Result<(), String> {
    let sysfs = SystemManager::get_sysfs_manager().map_err(|e| e.to_string())?;

    sysfs
        .set_value(BATTERY_SYSFS_PATH, &value.to_string())
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

pub fn get_battery_sysfs_path() -> &'static str {
    BATTERY_SYSFS_PATH
}
