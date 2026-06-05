use log::info;
use serde::{Deserialize, Serialize};
use std::io::{Read, Write};
use std::path::Path;

// ---------------------------------------------------------------------------
// Project data structures
// ---------------------------------------------------------------------------

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

/// Current project format version
const PROJECT_VERSION: &str = "1.0";

// ===========================================================================
// Save project — ZIP package with atomic write
// ===========================================================================

#[tauri::command]
pub fn project_save(file_path: String, data_json: String) -> Result<(), String> {
    info!("Saving project: {}", file_path);

    let path = Path::new(&file_path);
    let parent = path.parent().unwrap_or(Path::new("."));

    // Build the ZIP archive in memory first
    let mut zip_buffer = std::io::Cursor::new(Vec::new());

    {
        let mut zip_writer =
            zip::ZipWriter::new(&mut zip_buffer);

        // 1. Write project.json (the main project data)
        zip_writer
            .start_file("project.json", Default::default())
            .map_err(|e| format!("Failed to create ZIP entry: {}", e))?;

        zip_writer
            .write_all(data_json.as_bytes())
            .map_err(|e| format!("Failed to write project data: {}", e))?;

        // 2. Write media/references.json (placeholder — could store media info)
        zip_writer
            .start_file("media/references.json", Default::default())
            .map_err(|e| format!("Failed to create media references entry: {}", e))?;

        zip_writer
            .write_all(b"{}")
            .map_err(|e| format!("Failed to write media references: {}", e))?;

        zip_writer
            .finish()
            .map_err(|e| format!("Failed to finish ZIP: {}", e))?;
    }

    // Atomic write: write to temp file, then rename
    let temp_ext = format!(".tmp.{}", std::process::id());
    let temp_path = parent.join(format!(
        "{}{}",
        path.file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("project"),
        temp_ext
    ));

    {
        let mut temp_file = std::fs::File::create(&temp_path)
            .map_err(|e| format!("Failed to create temp file: {}", e))?;

        temp_file
            .write_all(zip_buffer.get_ref())
            .map_err(|e| format!("Failed to write temp file: {}", e))?;

        temp_file
            .sync_all()
            .map_err(|e| format!("Failed to sync temp file: {}", e))?;
    }

    // Rename temp -> target (atomic on most platforms)
    std::fs::rename(&temp_path, path)
        .map_err(|e| format!("Failed to rename temp file: {}", e))?;

    info!("Project saved successfully to {}", file_path);
    Ok(())
}

// ===========================================================================
// Load project — ZIP extraction with version check
// ===========================================================================

#[tauri::command]
pub fn project_load(file_path: String) -> Result<String, String> {
    info!("Loading project: {}", file_path);

    let file = std::fs::File::open(&file_path)
        .map_err(|e| format!("Failed to open project file: {}", e))?;

    let mut archive =
        zip::ZipArchive::new(file).map_err(|e| format!("Failed to read ZIP archive: {}", e))?;

    // Find and read project.json
    let project_json = {
        let mut found: Option<String> = None;
        for i in 0..archive.len() {
            let mut entry = archive
                .by_index(i)
                .map_err(|e| format!("Failed to read ZIP entry {}: {}", i, e))?;

            if entry.name() == "project.json" {
                let mut content = String::new();
                entry
                    .read_to_string(&mut content)
                    .map_err(|e| format!("Failed to read project.json: {}", e))?;
                found = Some(content);
                break;
            }
        }
        found.ok_or_else(|| "project.json not found in archive".to_string())?
    };

    // Version check
    let parsed: serde_json::Value = serde_json::from_str(&project_json)
        .map_err(|e| format!("Failed to parse project.json: {}", e))?;

    let version = parsed
        .pointer("/meta/version")
        .and_then(|v| v.as_str())
        .unwrap_or("0.0");

    if version != PROJECT_VERSION {
        info!(
            "Project version mismatch: expected {}, got {}",
            PROJECT_VERSION, version
        );
        // Non-critical: still load it
    }

    info!("Project loaded successfully (version={})", version);
    Ok(project_json)
}

// ===========================================================================
// Legacy commands (kept for backward compatibility)
// ===========================================================================

#[tauri::command]
pub fn save_project(file_path: String, project: Project) -> Result<(), String> {
    info!("Saving project (legacy): {}", file_path);

    let data =
        serde_json::to_string_pretty(&project).map_err(|e| format!("Failed to serialize: {}", e))?;

    std::fs::write(&file_path, data)
        .map_err(|e| format!("Failed to write project file: {}", e))?;

    Ok(())
}

#[tauri::command]
pub fn load_project(file_path: String) -> Result<Project, String> {
    info!("Loading project (legacy): {}", file_path);

    let data = std::fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read project file: {}", e))?;

    let project: Project =
        serde_json::from_str(&data).map_err(|e| format!("Failed to parse project: {}", e))?;

    Ok(project)
}
