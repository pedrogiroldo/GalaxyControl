pub mod models;
pub mod services;

use crate::services::battery_thereshold_controller;
use crate::services::performance_mode;
use crate::services::system_manager;

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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
