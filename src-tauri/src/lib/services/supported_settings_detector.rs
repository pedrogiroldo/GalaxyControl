use crate::{services::system_manager::SystemManager, BATTERY_SYSFS_PATH};

pub fn get_supported_settings() -> Result<String, Box<dyn std::error::Error>> {
    let sysfs = SystemManager::get_sysfs_manager()
        .map_err(|e| format!("Failed to get sysfs manager: {}", e))?;

    let battery_threshold = sysfs.get_value(BATTERY_SYSFS_PATH);
}
