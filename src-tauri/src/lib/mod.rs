pub mod models;
pub mod services;

use crate::services::battery_thereshold_controller;
use crate::services::system_manager::SystemManager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|_app| {
            tauri::async_runtime::block_on(async {
                match SystemManager::initialize().await {
                    Ok(_) => println!("SystemManager initialized!"),
                    Err(e) => eprintln!("Failed to initialize SystemManager: {:?}", e),
                }
            });
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            battery_thereshold_controller::get_threshold,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
