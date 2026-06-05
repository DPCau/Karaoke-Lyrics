use serde::Serialize;
use log::info;

#[derive(Debug, Serialize)]
pub struct MediaFileInfo {
    pub path: String,
    pub name: String,
    pub duration: f64,
    pub sample_rate: u32,
    pub channels: u16,
    pub format: String,
}

#[tauri::command]
pub fn open_media(file_path: String, media_type: String) -> Result<MediaFileInfo, String> {
    info!("Opening {} media: {}", media_type, file_path);

    let path = std::path::Path::new(&file_path);
    let name = path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown")
        .to_string();

    Ok(MediaFileInfo {
        path: file_path,
        name,
        duration: 0.0,
        sample_rate: 44100,
        channels: 2,
        format: media_type,
    })
}

#[tauri::command]
pub fn get_waveform(file_path: String) -> Result<Vec<f32>, String> {
    info!("Generating waveform for: {}", file_path);
    // Placeholder: return empty waveform data
    Ok(Vec::new())
}
