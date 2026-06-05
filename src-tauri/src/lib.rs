mod commands;

use log::info;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::init();
    info!("Starting Karaoke Lyrics Maker");

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::media::open_media,
            commands::media::get_waveform,
            commands::project::load_project,
            commands::project::save_project,
            commands::export::export_project,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
