use crate::{
    services::system_manager::SystemManager, BATTERY_SYSFS_PATH, BLOCK_RECORDING_DIRECTORY_PATH,
    PERFORMANCE_MODE_CHOICES_SYSFS_PATH, POWER_ON_LID_DIRECTORY_PATH, USB_CHARGING_DIRECTORY_PATH,
};

#[tauri::command]
pub async fn get_supported_settings() -> Result<String, Box<dyn std::error::Error>> {
    let sysfs = SystemManager::get_sysfs_manager()
        .map_err(|e| format!("Failed to get sysfs manager: {}", e))?;

    let battery_threshold = sysfs.get_value(BATTERY_SYSFS_PATH).await.is_ok();
    let performance_mode = sysfs
        .get_value(PERFORMANCE_MODE_CHOICES_SYSFS_PATH)
        .await
        .is_ok();
    let power_on_lid = sysfs
        .ls_directory(POWER_ON_LID_DIRECTORY_PATH)
        .await
        .is_ok();
    let usb_charging = sysfs
        .ls_directory(USB_CHARGING_DIRECTORY_PATH)
        .await
        .is_ok();
    let block_recording = sysfs
        .ls_directory(BLOCK_RECORDING_DIRECTORY_PATH)
        .await
        .is_ok();

    let supported_settings = vec![
        ("battery_threshold", battery_threshold),
        ("performance_mode", performance_mode),
        ("power_on_lid", power_on_lid),
        ("usb_charging", usb_charging),
        ("block_recording", block_recording),
    ];

    let supported_settings_json: Vec<_> = supported_settings
        .into_iter()
        .map(|(name, is_supported)| (name.to_string(), is_supported))
        .collect();
    let json = serde_json::to_string(&supported_settings_json)
        .map_err(|e| format!("Failed to serialize supported settings: {}", e))?;

    Ok(json)
}
