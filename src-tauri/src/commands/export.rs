use serde::{Deserialize, Serialize};
use log::info;

#[derive(Debug, Serialize, Deserialize)]
pub struct ExportConfig {
    pub format: String,
    pub output_path: String,
    pub include_pronunciation: bool,
    pub include_styles: bool,
    pub video_embed: bool,
    pub resolution: Resolution,
    pub framerate: f64,
    pub quality: u8,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Resolution {
    pub width: u32,
    pub height: u32,
}

#[derive(Debug, Serialize)]
pub struct ExportResult {
    pub path: String,
}

#[tauri::command]
pub fn export_project(config: ExportConfig) -> Result<ExportResult, String> {
    info!(
        "Exporting project to {} format at: {}",
        config.format, config.output_path
    );

    // Placeholder export implementation
    let path = config.output_path;
    Ok(ExportResult { path })
}
