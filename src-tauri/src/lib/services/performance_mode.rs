use crate::{
    services::system_manager::SystemManager, PERFORMANCE_MODE_CHOICES_SYSFS_PATH,
    PERFORMANCE_MODE_SYSFS_PATH,
};
use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PerformanceData {
    pub current_mode: String,
    pub possible_modes: Vec<String>,
}

#[tauri::command]
pub async fn get_performance_mode() -> Result<String, String> {
    let sysfs = SystemManager::get_sysfs_manager().map_err(|e| e.to_string())?;

    let value = sysfs
        .get_value(PERFORMANCE_MODE_SYSFS_PATH)
        .await
        .map_err(|e| e.to_string())?;

    Ok(value.trim().to_string())
}

#[tauri::command]
pub async fn set_performance_mode(mode: String) -> Result<(), String> {
    let sysfs = SystemManager::get_sysfs_manager().map_err(|e| e.to_string())?;

    sysfs
        .set_value(PERFORMANCE_MODE_SYSFS_PATH, &mode)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn get_possible_performance_modes() -> Result<Vec<String>, String> {
    let sysfs = SystemManager::get_sysfs_manager().map_err(|e| e.to_string())?;

    let value = sysfs
        .get_value(PERFORMANCE_MODE_CHOICES_SYSFS_PATH)
        .await
        .map_err(|e| e.to_string())?;

    let modes = value
        .trim()
        .split_whitespace()
        .map(|s| s.to_string())
        .collect();

    Ok(modes)
}

#[tauri::command]
pub async fn get_performance_data() -> Result<PerformanceData, String> {
    let sysfs = SystemManager::get_sysfs_manager().map_err(|e| e.to_string())?;

    // Get current mode
    let current_mode = sysfs
        .get_value(PERFORMANCE_MODE_SYSFS_PATH)
        .await
        .map_err(|e| e.to_string())?
        .trim()
        .to_string();

    // Get possible modes
    let possible_modes_value = sysfs
        .get_value(PERFORMANCE_MODE_CHOICES_SYSFS_PATH)
        .await
        .map_err(|e| e.to_string())?;

    let possible_modes = possible_modes_value
        .trim()
        .split_whitespace()
        .map(|s| s.to_string())
        .collect();

    Ok(PerformanceData {
        current_mode,
        possible_modes,
    })
}

pub fn get_performance_mode_sysfs_path() -> &'static str {
    PERFORMANCE_MODE_SYSFS_PATH
}

pub fn get_performance_mode_choices_sysfs_path() -> &'static str {
    PERFORMANCE_MODE_CHOICES_SYSFS_PATH
}
