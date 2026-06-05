use crate::engine::export::ass_exporter;
use crate::engine::export::types::{ExportLine, ExportOptions};
use std::io::BufRead;
use std::process::{Command, Stdio};
use tauri::Emitter;

// ---------------------------------------------------------------------------
// Video exporter — renders timed lyrics onto video via FFmpeg ASS filter
// ---------------------------------------------------------------------------

/// Parse an FFmpeg time= field (format: HH:MM:SS.MS or MM:SS.MS) to seconds
fn parse_ffmpeg_time(time_str: &str) -> Option<f64> {
    let time_str = time_str.trim();
    let parts: Vec<&str> = time_str.split(':').collect();

    match parts.len() {
        3 => {
            let h = parts[0].parse::<f64>().ok()?;
            let m = parts[1].parse::<f64>().ok()?;
            let s = parts[2].parse::<f64>().ok()?;
            Some(h * 3600.0 + m * 60.0 + s)
        }
        2 => {
            let m = parts[0].parse::<f64>().ok()?;
            let s = parts[1].parse::<f64>().ok()?;
            Some(m * 60.0 + s)
        }
        1 => parts[0].parse::<f64>().ok(),
        _ => None,
    }
}

/// Progress payload for Tauri events
#[derive(Debug, Clone, serde::Serialize)]
pub struct ExportProgress {
    pub progress: f64, // 0.0 - 1.0
    pub stage: String,
    pub speed: Option<String>,
}

/// Export video with lyrics overlay using FFmpeg
///
/// 1. Generates a temporary ASS subtitle file
/// 2. Calls FFmpeg: `ffmpeg -y -i <input> -vf "ass=<temp.ass>" -c:v libx264 -preset <preset> -c:a aac <output>`
/// 3. Parses FFmpeg stderr for `time=` to report progress
/// 4. Cleans up the temp ASS file
pub fn export_video(
    input_path: &str,
    output_path: &str,
    lines: &[ExportLine],
    options: &ExportOptions,
    app_handle: Option<&tauri::AppHandle>,
) -> Result<(), String> {
    // Step 1: Generate temporary ASS file
    let temp_dir = std::env::temp_dir();
    let temp_ass = temp_dir.join("karaoke_export_temp.ass");
    let temp_ass_str = temp_ass.to_string_lossy().to_string();

    ass_exporter::export_ass(&temp_ass_str, lines, options)?;

    // Step 2: Determine total duration from lyrics
    let total_duration = lines
        .iter()
        .filter_map(|l| {
            if l.end_time.is_finite() {
                Some(l.end_time)
            } else {
                None
            }
        })
        .fold(0.0_f64, f64::max);

    let preset = options.video_preset.as_deref().unwrap_or("medium");

    // Step 3: Build and run FFmpeg command
    let output = Command::new("ffmpeg")
        .arg("-y")
        .arg("-i")
        .arg(input_path)
        .arg("-vf")
        .arg(&format!("ass={}", temp_ass_str))
        .arg("-c:v")
        .arg("libx264")
        .arg("-preset")
        .arg(preset)
        .arg("-c:a")
        .arg("aac")
        .arg(output_path)
        .stderr(Stdio::piped())
        .stdout(Stdio::null())
        .spawn()
        .map_err(|e| format!("Failed to start FFmpeg: {}", e))?;

    let stderr = output.stderr
        .ok_or_else(|| "Failed to capture FFmpeg stderr".to_string())?;

    let reader = std::io::BufReader::new(stderr);

    // Step 4: Parse ffmpeg progress and emit events
    for line in reader.lines() {
        let line = line.map_err(|e| format!("Failed to read FFmpeg output: {}", e))?;

        if let Some(time_str) = line
            .split(' ')
            .find(|part| part.starts_with("time="))
            .and_then(|part| part.strip_prefix("time="))
        {
            if let Some(seconds) = parse_ffmpeg_time(time_str) {
                if total_duration > 0.0 {
                    let progress = (seconds / total_duration).min(1.0);

                    // Extract speed if available
                    let speed = line
                        .split(' ')
                        .find(|part| part.starts_with("speed="))
                        .and_then(|part| part.strip_prefix("speed="))
                        .map(|s| s.to_string());

                    let payload = ExportProgress {
                        progress,
                        stage: "encoding".to_string(),
                        speed,
                    };

                    // Emit event if AppHandle is available
                    if let Some(handle) = app_handle {
                        let _ = handle.emit("export-progress", &payload);
                    }
                }
            }
        }
    }

    // Step 5: Clean up temp file
    let _ = std::fs::remove_file(&temp_ass);

    // Step 6: Emit completion
    if let Some(handle) = app_handle {
        let payload = ExportProgress {
            progress: 1.0,
            stage: "complete".to_string(),
            speed: None,
        };
        let _ = handle.emit("export-progress", &payload);
    }

    Ok(())
}

/// Detect if FFmpeg is available on the system
pub fn detect_ffmpeg() -> (bool, Option<String>, Option<String>) {
    match Command::new("ffmpeg").arg("-version").output() {
        Ok(output) if output.status.success() => {
            let version = String::from_utf8_lossy(&output.stdout);
            let first_line = version.lines().next().map(|l| l.to_string());

            // Try to find ffmpeg path
            let path = which_ffmpeg_path();
            (true, path, first_line)
        }
        _ => (false, None, None),
    }
}

#[cfg(unix)]
fn which_ffmpeg_path() -> Option<String> {
    use std::process::Command;
    Command::new("which")
        .arg("ffmpeg")
        .output()
        .ok()
        .filter(|o| o.status.success())
        .and_then(|o| {
            String::from_utf8(o.stdout)
                .ok()
                .map(|s| s.trim().to_string())
        })
}

#[cfg(not(unix))]
fn which_ffmpeg_path() -> Option<String> {
    use std::process::Command;
    Command::new("where")
        .arg("ffmpeg")
        .output()
        .ok()
        .filter(|o| o.status.success())
        .and_then(|o| {
            String::from_utf8(o.stdout)
                .ok()
                .map(|s| s.trim().to_string())
        })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_ffmpeg_time_full() {
        // "time=00:01:30.50"
        let result = parse_ffmpeg_time("00:01:30.50");
        assert!(result.is_some());
        assert!((result.unwrap() - 90.5).abs() < 0.01);
    }

    #[test]
    fn test_parse_ffmpeg_time_min_sec() {
        // "time=01:30.50"
        let result = parse_ffmpeg_time("01:30.50");
        assert!(result.is_some());
        assert!((result.unwrap() - 90.5).abs() < 0.01);
    }

    #[test]
    fn test_parse_ffmpeg_time_seconds() {
        // "time=90.50"
        let result = parse_ffmpeg_time("90.50");
        assert!(result.is_some());
        assert!((result.unwrap() - 90.5).abs() < 0.01);
    }

    #[test]
    fn test_parse_ffmpeg_time_empty() {
        assert!(parse_ffmpeg_time("").is_none());
    }

    #[test]
    fn test_parse_ffmpeg_time_garbage() {
        assert!(parse_ffmpeg_time("N/A").is_none());
    }
}
