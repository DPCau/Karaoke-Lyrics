use serde::{Deserialize, Serialize};
use log::info;
use tauri_plugin_dialog::DialogExt;

/// Media file information returned to the frontend after opening a file.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MediaFileInfo {
    pub path: String,
    pub name: String,
    pub duration_ms: u64,
    pub sample_rate: u32,
    pub channels: u16,
    pub format: String,
    pub video_stream: Option<VideoStreamInfo>,
    pub audio_stream: Option<AudioStreamInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VideoStreamInfo {
    pub codec: String,
    pub width: u32,
    pub height: u32,
    pub frame_rate: f64,
    pub bit_rate: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioStreamInfo {
    pub codec: String,
    pub sample_rate: u32,
    pub channels: u16,
    pub bit_rate: Option<u64>,
}

impl From<crate::engine::media::probe::MediaInfo> for MediaFileInfo {
    fn from(mi: crate::engine::media::probe::MediaInfo) -> Self {
        let sample_rate = mi.audio_stream.as_ref().map(|a| a.sample_rate).unwrap_or(0);
        let channels = mi.audio_stream.as_ref().map(|a| a.channels).unwrap_or(0);
        let video_stream = mi.video_stream.map(|vs| VideoStreamInfo {
            codec: vs.codec,
            width: vs.width,
            height: vs.height,
            frame_rate: vs.frame_rate,
            bit_rate: vs.bit_rate,
        });
        let audio_stream = mi.audio_stream.map(|as_| AudioStreamInfo {
            codec: as_.codec,
            sample_rate: as_.sample_rate,
            channels: as_.channels,
            bit_rate: as_.bit_rate,
        });
        MediaFileInfo {
            path: String::new(),
            name: String::new(),
            duration_ms: mi.duration_ms,
            sample_rate,
            channels,
            format: mi.format,
            video_stream,
            audio_stream,
        }
    }
}

/// Open a media file via dialog, probe it, and return media info.
///
/// `media_type` is "video" or "audio" and determines the file filter list.
fn open_media_file(app: tauri::AppHandle, media_type: &str) -> Result<MediaFileInfo, String> {
    let (title, filters): (&str, &[&str]) = match media_type {
        "video" => (
            "Select a video file",
            &["mp4", "mkv", "avi", "mov", "webm", "flv", "wmv"],
        ),
        "audio" => (
            "Select an audio file",
            &[
                "mp3", "wav", "flac", "ogg", "aac", "m4a", "wma", "opus",
            ],
        ),
        _ => return Err(format!("Unsupported media type: {}", media_type)),
    };

    let file = app
        .dialog()
        .file()
        .add_filter(
            if media_type == "video" {
                "Video files"
            } else {
                "Audio files"
            },
            filters,
        )
        .add_filter("All files", &["*"])
        .set_title(title)
        .blocking_pick_file();

    let file_path = match file {
        Some(f) => f.into_path().unwrap(),
        None => return Err("No file selected".to_string()),
    };

    let path_str = file_path.to_string_lossy().to_string();
    let name = file_path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown")
        .to_string();

    info!("Opening {} media: {} (path: {})", media_type, name, path_str);

    let media_info = crate::engine::media::probe::probe_media(&path_str)?;

    let mut result = MediaFileInfo::from(media_info);
    result.path = path_str;
    result.name = name;

    Ok(result)
}

#[tauri::command]
pub fn media_open_video(app: tauri::AppHandle) -> Result<MediaFileInfo, String> {
    open_media_file(app, "video")
}

#[tauri::command]
pub fn media_open_audio(app: tauri::AppHandle) -> Result<MediaFileInfo, String> {
    open_media_file(app, "audio")
}

#[tauri::command]
pub fn media_get_waveform(file_path: String, target_width: u32) -> Result<Vec<f32>, String> {
    info!(
        "Generating waveform for: {} ({} peaks)",
        file_path, target_width
    );

    let waveform = crate::engine::media::waveform::generate_waveform(&file_path, target_width)?;
    Ok(waveform.peaks)
}
