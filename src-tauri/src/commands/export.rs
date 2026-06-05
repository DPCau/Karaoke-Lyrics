use crate::engine::export::types::{ExportLine, ExportOptions};
use log::info;
use serde::{Deserialize, Serialize};

// ---------------------------------------------------------------------------
// Tauri commands for Phase 5 export system
// ---------------------------------------------------------------------------

/// Front-facing export config (serialized from frontend)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExportConfig {
    pub format: String,
    pub output_path: String,
    pub include_pronunciation: bool,
    pub include_styles: bool,
    pub video_embed: bool,
    pub resolution: ResConfig,
    pub framerate: f64,
    pub quality: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResConfig {
    pub width: u32,
    pub height: u32,
}

/// Export result (returned to frontend)
#[derive(Debug, Serialize, Deserialize)]
pub struct ExportResult {
    pub path: String,
}

// ===========================================================================
// LRC export
// ===========================================================================

#[tauri::command]
pub fn export_lrc(
    path: String,
    lines_json: String,
    options_json: String,
) -> Result<(), String> {
    info!("LRC export: path={}", path);

    let lines: Vec<ExportLine> =
        serde_json::from_str(&lines_json).map_err(|e| format!("Invalid lines JSON: {}", e))?;

    let options: ExportOptions =
        serde_json::from_str(&options_json).map_err(|e| format!("Invalid options JSON: {}", e))?;

    crate::engine::export::lrc_exporter::export_lrc(&path, &lines, &options)
}

// ===========================================================================
// JSON export
// ===========================================================================

#[tauri::command]
pub fn export_json(
    path: String,
    lines_json: String,
    options_json: String,
) -> Result<(), String> {
    info!("JSON export: path={}", path);

    let lines: Vec<ExportLine> =
        serde_json::from_str(&lines_json).map_err(|e| format!("Invalid lines JSON: {}", e))?;

    let options: ExportOptions =
        serde_json::from_str(&options_json).map_err(|e| format!("Invalid options JSON: {}", e))?;

    crate::engine::export::json_exporter::export_json(&path, &lines, &options)
}

// ===========================================================================
// ASS export
// ===========================================================================

#[tauri::command]
pub fn export_ass(
    path: String,
    lines_json: String,
    options_json: String,
) -> Result<(), String> {
    info!("ASS export: path={}", path);

    let lines: Vec<ExportLine> =
        serde_json::from_str(&lines_json).map_err(|e| format!("Invalid lines JSON: {}", e))?;

    let options: ExportOptions =
        serde_json::from_str(&options_json).map_err(|e| format!("Invalid options JSON: {}", e))?;

    crate::engine::export::ass_exporter::export_ass(&path, &lines, &options)
}

// ===========================================================================
// Video export (with FFmpeg)
// ===========================================================================

#[tauri::command]
pub fn export_video(
    app: tauri::AppHandle,
    config_json: String,
) -> Result<(), String> {
    info!("Video export");

    #[derive(Deserialize)]
    struct VideoConfig {
        input_path: String,
        output_path: String,
        lines_json: String,
        options_json: String,
    }

    let config: VideoConfig =
        serde_json::from_str(&config_json).map_err(|e| format!("Invalid config JSON: {}", e))?;

    let lines: Vec<ExportLine> = serde_json::from_str(&config.lines_json)
        .map_err(|e| format!("Invalid lines JSON in video config: {}", e))?;

    let options: ExportOptions = serde_json::from_str(&config.options_json)
        .map_err(|e| format!("Invalid options JSON in video config: {}", e))?;

    crate::engine::export::video_exporter::export_video(
        &config.input_path,
        &config.output_path,
        &lines,
        &options,
        Some(&app),
    )
}

// ===========================================================================
// Legacy export command (kept for backward compatibility)
// ===========================================================================

#[tauri::command]
pub fn export_project(config: ExportConfig) -> Result<ExportResult, String> {
    info!(
        "Exporting project to {} format at: {}",
        config.format, config.output_path
    );

    let path = config.output_path;
    Ok(ExportResult { path })
}
