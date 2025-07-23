pub mod models;
pub mod services;

use crate::services::battery_thereshold_controller;
use crate::services::performance_mode;
use crate::services::supported_settings_detector;
use crate::services::system_manager;

pub const BATTERY_SYSFS_PATH: &str = "/sys/class/power_supply/BAT1/charge_control_end_threshold";
pub const PERFORMANCE_MODE_SYSFS_PATH: &str = "/sys/firmware/acpi/platform_profile";
pub const PERFORMANCE_MODE_CHOICES_SYSFS_PATH: &str = "/sys/firmware/acpi/platform_profile_choices";
pub const POWER_ON_LID_OPEN_DIRECTORY_PATH: &str =
    "/sys/class/firmware-attributes/samsung-galaxybook/attributes/power_on_lid_open";
pub const POWER_ON_LID_OPEN_SYSFS_PATH: &str =
    "/sys/class/firmware-attributes/samsung-galaxybook/attributes/power_on_lid_open/current_value";
pub const USB_CHARGING_DIRECTORY_PATH: &str =
    "/sys/class/firmware-attributes/samsung-galaxybook/attributes/usb_charging";
pub const USB_CHARGING_SYSFS_PATH: &str =
    "/sys/class/firmware-attributes/samsung-galaxybook/attributes/usb_charging/current_value";

pub const BLOCK_RECORDING_DIRECTORY_PATH: &str =
    "/sys/class/firmware-attributes/samsung-galaxybook/attributes/block_recording";
pub const BLOCK_RECORDING_SYSFS_PATH: &str =
    "/sys/class/firmware-attributes/samsung-galaxybook/attributes/block_recording/current_value";

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            system_manager::authenticate,
            battery_thereshold_controller::get_threshold,
            battery_thereshold_controller::set_threshold,
            performance_mode::get_performance_mode,
            performance_mode::set_performance_mode,
            performance_mode::get_possible_performance_modes,
            performance_mode::get_performance_data,
            supported_settings_detector::get_supported_settings,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
