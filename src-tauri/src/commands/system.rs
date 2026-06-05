use serde::{Deserialize, Serialize};

// ---------------------------------------------------------------------------
// System commands — FFmpeg detection, app data directory, menu language
// ---------------------------------------------------------------------------

/// FFmpeg detection result
#[derive(Debug, Serialize, Deserialize)]
pub struct FfmpegInfo {
    pub found: bool,
    pub path: Option<String>,
    pub version: Option<String>,
}

/// Detect if FFmpeg is available on the system
#[tauri::command]
pub fn system_detect_ffmpeg() -> FfmpegInfo {
    let (found, path, version) = crate::engine::export::video_exporter::detect_ffmpeg();
    FfmpegInfo {
        found,
        path,
        version,
    }
}

/// Get the application data directory
#[tauri::command]
pub fn system_get_app_data_dir() -> String {
    dirs::data_dir()
        .unwrap_or_else(|| std::path::PathBuf::from("."))
        .join("Karaoke-Lyrics-Maker")
        .to_string_lossy()
        .to_string()
}

/// Update the native menu bar text to the given language.
///
/// Called from the front‑end when the user changes the UI language.
/// The native menu is rebuilt with translated text so the macOS menu bar
/// stays in sync with the custom MenuBar.tsx component.
#[tauri::command]
pub fn update_menu_language(app: tauri::AppHandle, lang: String) -> Result<(), String> {
    let menu = crate::menu::create_app_menu(&app, &lang).map_err(|e| e.to_string())?;
    app.set_menu(menu).map_err(|e| e.to_string())?;
    Ok(())
}
