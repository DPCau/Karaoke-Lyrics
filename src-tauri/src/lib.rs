mod commands;
mod engine;

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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
