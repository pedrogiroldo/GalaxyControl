use crate::{services::system_manager::SystemManager, POWER_ON_LID_OPEN_SYSFS_PATH};

#[tauri::command]
pub async fn get_power_on_lid_open() -> Result<bool, String> {
    let sysfs = SystemManager::get_sysfs_manager()
        .map_err(|e| format!("Failed to get sysfs manager: {}", e))?;

    let value = sysfs
        .get_value(POWER_ON_LID_OPEN_SYSFS_PATH)
        .await
        .map_err(|e| format!("Failed to get power on lid open value: {}", e))?;
    let value = value.trim().to_lowercase();
    match value.as_str() {
        "1" => Ok(true),
        "0" => Ok(false),
        _ => Err(format!("Unexpected value for power on lid open: {}", value)),
    }
}

#[tauri::command]
pub async fn set_power_on_lid_open(enabled: bool) -> Result<(), String> {
    let sysfs = SystemManager::get_sysfs_manager()
        .map_err(|e| format!("Failed to get sysfs manager: {}", e))?;

    let value = if enabled { "1" } else { "0" };
    sysfs
        .set_value(POWER_ON_LID_OPEN_SYSFS_PATH, value)
        .await
        .map_err(|e| format!("Failed to set power on lid open value: {}", e))?;

    Ok(())
}
