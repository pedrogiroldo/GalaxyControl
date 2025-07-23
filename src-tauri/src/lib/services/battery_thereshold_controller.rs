use crate::services::system_manager::SystemManager;

const BATTERY_SYSFS_PATH: &str = "/sys/class/power_supply/BAT1/charge_control_end_threshold";

#[tauri::command]
pub async fn get_threshold() -> Result<String, String> {
    let sysfs = SystemManager::get_sysfs_manager().map_err(|e| e.to_string())?;
    sysfs.validate_sudo().await.map_err(|e| e.to_string())?;

    let value = sysfs
        .get_value(BATTERY_SYSFS_PATH)
        .await
        .map_err(|e| e.to_string())?;

    Ok(value)
}

pub fn get_battery_sysfs_path() -> &'static str {
    BATTERY_SYSFS_PATH
}
