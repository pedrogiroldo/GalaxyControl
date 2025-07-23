use crate::{
    services::{battery_thereshold_controller, system_manager::SystemManager},
    BATTERY_SYSFS_PATH, PERFORMANCE_MODE_CHOICES_SYSFS_PATH,
};

pub async fn get_supported_settings() -> Result<String, Box<dyn std::error::Error>> {
    let sysfs = SystemManager::get_sysfs_manager()
        .map_err(|e| format!("Failed to get sysfs manager: {}", e))?;

    let battery_threshold = sysfs.get_value(BATTERY_SYSFS_PATH).await.is_ok();
    let performance_mode = sysfs
        .get_value(PERFORMANCE_MODE_CHOICES_SYSFS_PATH)
        .await
        .is_ok();

    Ok("Pra parar de dar erro".to_string())
}
