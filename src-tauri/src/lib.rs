mod commands;
mod engine;
mod menu;

use log::info;
use tauri::Emitter;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::init();
    info!("Starting Karaoke Lyrics Maker");

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Default language is zh-CN; it will be overridden by user settings
            let menu = menu::create_app_menu(app.handle(), "zh-CN")?;
            app.set_menu(menu)?;
            Ok(())
        })
        .on_menu_event(|app, event| {
            let id = event.id().as_ref();
            let _ = app.emit("menu-event", id);
        })
        .invoke_handler(tauri::generate_handler![
            commands::media::media_open_video,
            commands::media::media_open_audio,
            commands::media::media_get_waveform,
            commands::project::load_project,
            commands::project::save_project,
            commands::project::project_save,
            commands::project::project_load,
            commands::export::export_project,
            commands::export::export_lrc,
            commands::export::export_json,
            commands::export::export_ass,
            commands::export::export_video,
            commands::pronunciation::pronunciation_lookup,
            commands::pronunciation::pronunciation_annotate_batch,
            commands::system::system_detect_ffmpeg,
            commands::system::system_get_app_data_dir,
            commands::system::update_menu_language,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
