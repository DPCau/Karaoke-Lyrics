use serde::{Deserialize, Serialize};
use log::info;

#[derive(Debug, Serialize, Deserialize)]
pub struct Project {
    pub meta: ProjectMeta,
    pub media: Vec<MediaRef>,
    pub lyrics: Vec<serde_json::Value>,
    pub style: serde_json::Value,
    pub timing: TimingConfig,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectMeta {
    pub name: String,
    pub version: String,
    pub created: String,
    pub modified: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MediaRef {
    #[serde(rename = "type")]
    pub media_type: String,
    pub path: String,
    pub original_name: String,
    pub duration: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TimingConfig {
    pub lead_in: u64,
    pub bpm: Option<f64>,
}

#[tauri::command]
pub fn load_project(file_path: String) -> Result<Project, String> {
    info!("Loading project: {}", file_path);

    let data = std::fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read project file: {}", e))?;

    let project: Project =
        serde_json::from_str(&data).map_err(|e| format!("Failed to parse project: {}", e))?;

    Ok(project)
}

#[tauri::command]
pub fn save_project(file_path: String, project: Project) -> Result<(), String> {
    info!("Saving project: {}", file_path);

    let data =
        serde_json::to_string_pretty(&project).map_err(|e| format!("Failed to serialize: {}", e))?;

    std::fs::write(&file_path, data)
        .map_err(|e| format!("Failed to write project file: {}", e))?;

    Ok(())
}
