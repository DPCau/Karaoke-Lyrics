use serde::{Deserialize, Serialize};

/// Video stream information extracted from ffprobe output.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VideoStreamInfo {
    pub codec: String,
    pub width: u32,
    pub height: u32,
    pub frame_rate: f64,
    pub bit_rate: Option<u64>,
}

/// Audio stream information extracted from ffprobe output.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioStreamInfo {
    pub codec: String,
    pub sample_rate: u32,
    pub channels: u16,
    pub bit_rate: Option<u64>,
}

/// Complete media information returned by probe_media.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MediaInfo {
    pub duration_ms: u64,
    pub video_stream: Option<VideoStreamInfo>,
    pub audio_stream: Option<AudioStreamInfo>,
    pub format: String,
}

/// Parse a rational fraction string like "30000/1001" or "25/1".
fn parse_fraction(s: &str) -> f64 {
    if let Some((num, den)) = s.split_once('/') {
        let n: f64 = num.trim().parse().unwrap_or(0.0);
        let d: f64 = den.trim().parse().unwrap_or(1.0);
        if d != 0.0 { n / d } else { 0.0 }
    } else {
        s.parse().unwrap_or(0.0)
    }
}

/// Probe a media file using external ffprobe and return structured metadata.
///
/// Calls `ffprobe -v quiet -print_format json -show_format -show_streams <path>`
/// and parses the JSON output to extract video and audio stream information.
pub fn probe_media(path: &str) -> Result<MediaInfo, String> {
    let output = std::process::Command::new("ffprobe")
        .arg("-v")
        .arg("quiet")
        .arg("-print_format")
        .arg("json")
        .arg("-show_format")
        .arg("-show_streams")
        .arg(path)
        .output()
        .map_err(|e| format!("Failed to execute ffprobe: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("ffprobe error: {}", stderr));
    }

    let json_str =
        String::from_utf8(output.stdout).map_err(|_| "ffprobe output is not valid UTF-8".to_string())?;

    let json: serde_json::Value =
        serde_json::from_str(&json_str).map_err(|e| format!("Failed to parse ffprobe JSON: {}", e))?;

    // --- Format info ---
    let format_obj = json.get("format");
    let format_name = format_obj
        .and_then(|f| f.get("format_name"))
        .and_then(|v| v.as_str())
        .unwrap_or("unknown")
        .to_string();

    let duration_secs: f64 = format_obj
        .and_then(|f| f.get("duration"))
        .and_then(|v| v.as_str())
        .and_then(|s| s.parse().ok())
        .unwrap_or(0.0);

    let duration_ms = (duration_secs * 1000.0).round() as u64;

    // --- Streams ---
    let streams = json
        .get("streams")
        .and_then(|v| v.as_array())
        .map(|a| a.clone())
        .unwrap_or_default();

    let mut video_stream: Option<VideoStreamInfo> = None;
    let mut audio_stream: Option<AudioStreamInfo> = None;

    for stream in &streams {
        let codec_type = stream
            .get("codec_type")
            .and_then(|v| v.as_str())
            .unwrap_or("");

        match codec_type {
            "video" if video_stream.is_none() => {
                let codec = stream
                    .get("codec_name")
                    .and_then(|v| v.as_str())
                    .unwrap_or("unknown")
                    .to_string();

                let width: u32 = stream.get("width").and_then(|v| v.as_u64()).unwrap_or(0) as u32;
                let height: u32 = stream.get("height").and_then(|v| v.as_u64()).unwrap_or(0) as u32;

                let frame_rate = stream
                    .get("r_frame_rate")
                    .and_then(|v| v.as_str())
                    .map(parse_fraction)
                    .or_else(|| {
                        stream
                            .get("avg_frame_rate")
                            .and_then(|v| v.as_str())
                            .map(parse_fraction)
                    })
                    .unwrap_or(0.0);

                let bit_rate: Option<u64> = stream
                    .get("bit_rate")
                    .and_then(|v| v.as_str())
                    .and_then(|s| s.parse().ok());

                video_stream = Some(VideoStreamInfo {
                    codec,
                    width,
                    height,
                    frame_rate,
                    bit_rate,
                });
            }
            "audio" if audio_stream.is_none() => {
                let codec = stream
                    .get("codec_name")
                    .and_then(|v| v.as_str())
                    .unwrap_or("unknown")
                    .to_string();

                let sample_rate: u32 = stream
                    .get("sample_rate")
                    .and_then(|v| v.as_str())
                    .and_then(|s| s.parse().ok())
                    .unwrap_or(0);

                let channels: u16 = stream
                    .get("channels")
                    .and_then(|v| v.as_u64())
                    .unwrap_or(0) as u16;

                let bit_rate: Option<u64> = stream
                    .get("bit_rate")
                    .and_then(|v| v.as_str())
                    .and_then(|s| s.parse().ok());

                audio_stream = Some(AudioStreamInfo {
                    codec,
                    sample_rate,
                    channels,
                    bit_rate,
                });
            }
            _ => {}
        }
    }

    Ok(MediaInfo {
        duration_ms,
        video_stream,
        audio_stream,
        format: format_name,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_fraction() {
        assert!((parse_fraction("30000/1001") - 29.97).abs() < 0.01);
        assert!((parse_fraction("25/1") - 25.0).abs() < 0.001);
        assert!((parse_fraction("30") - 30.0).abs() < 0.001);
        assert!((parse_fraction("0/1") - 0.0).abs() < 0.001);
    }
}
